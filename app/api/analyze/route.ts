import { experimental_evaluate as evaluate } from 'ai';
import { NextResponse } from 'next/server';
import { splitRequirements, type Requirement } from '../../lib';
import { check, tooMany } from '../../server/ratelimit';

const PRICE_PER_INPUT_TOKEN = 0.042 / 1_000_000;
const MAX_CHARS = 20_000;

const STRENGTH = [
  'the CV shows nothing relevant to this',
  'the CV shows adjacent or transferable experience',
  'the CV clearly meets this',
  'the CV goes well beyond this',
];

async function scoreLine(line: string, cv: string) {
  const { answers, usage } = await evaluate({
    model: 'typesafe-ai/jev',
    state: { requirement: line, candidateCV: cv },
    questions: {
      isRequirement: {
        type: 'boolean',
        instructions: 'Is this line a concrete skill, qualification or requirement for the role?',
        criteria: {
          true: 'a specific skill, tool, amount of experience, or qualification the candidate must have',
          false: 'a job title, section heading, company description, benefit, or generic boilerplate',
        },
      },
      met: {
        type: 'boolean',
        instructions: 'Does the CV provide evidence the candidate meets this requirement?',
      },
      strength: {
        type: 'score',
        instructions: 'How strongly does the CV evidence this requirement?',
        criteria: STRENGTH,
      },
      critical: {
        type: 'boolean',
        instructions: 'Is this requirement essential for the role rather than nice to have?',
      },
    },
  });

  return {
    requirement: {
      text: line,
      isRequirement: answers.isRequirement.probability,
      met: answers.met.probability,
      strength: answers.strength.score,
      critical: answers.critical.probability,
    } as Requirement,
    inputTokens: usage.inputTokens ?? 0,
  };
}

export async function POST(req: Request) {
  const gate = check(req, 'analyze');
  if (!gate.ok) return tooMany(gate.retryAfter);

  const { jobDescription, cv } = await req.json();

  if (!jobDescription?.trim() || !cv?.trim()) {
    return NextResponse.json({ error: 'Both the posting and your CV are required.' }, { status: 400 });
  }

  if (jobDescription.length > MAX_CHARS || cv.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Each box is capped at ${MAX_CHARS.toLocaleString()} characters. Trim it down and try again.` },
      { status: 413 },
    );
  }

  const lines = splitRequirements(jobDescription);
  if (lines.length === 0) {
    return NextResponse.json({ error: 'could not find any requirements in that job description' }, { status: 400 });
  }

  try {
    const scored = await Promise.all(lines.map((line) => scoreLine(line, cv)));
    const requirements = scored.map((s) => s.requirement).filter((r) => r.isRequirement >= 0.6);

    if (requirements.length === 0) {
      return NextResponse.json({ error: 'no concrete requirements found in that job description' }, { status: 400 });
    }

    // Essential requirements count double, so missing one hurts more than missing a nice-to-have.
    const weight = (r: Requirement) => 1 + r.critical;
    const fit =
      requirements.reduce((sum, r) => sum + Math.min(r.strength / 2, 1) * weight(r), 0) /
      requirements.reduce((sum, r) => sum + weight(r), 0);

    const inputTokens = scored.reduce((sum, s) => sum + s.inputTokens, 0);

    return NextResponse.json({
      requirements: requirements.sort((a, b) => b.critical - a.critical || a.met - b.met),
      fit,
      inputTokens,
      cost: inputTokens * PRICE_PER_INPUT_TOKEN,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'analysis failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

'use client';

import { useRef, useState } from 'react';
import { CvDropzone } from './CvDropzone';
import { Nav } from './Nav';
import { Scorecard } from './Scorecard';
import type { Analysis } from './lib';
import { SAMPLE_CV, SAMPLE_JD } from './samples';

export default function Page() {
  const [jd, setJd] = useState('');
  const [cv, setCv] = useState('');
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const ready = jd.trim().length > 40 && cv.trim().length > 40;

  async function analyze() {
    if (!ready) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, cv }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'The check did not finish. Try again.');
      setResult(body);
      if (window.innerWidth < 1024) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The check did not finish. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="top">
      <Nav onPrimary={analyze} />

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        <section className="rounded-3xl bg-card px-6 py-10 shadow-[0_2px_0_rgba(17,24,39,0.03)] sm:px-10 lg:px-14 lg:py-14">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div ref={formRef}>
              <h1 className="text-[2.35rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                See how your CV stacks up against any <span className="text-blue">job posting</span>.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
                Paste a posting and drop in your CV. Each requirement is scored against your experience, and the ones
                you nearly meet are listed first, so you know what to address in your cover letter.
              </p>

              <div className="mt-8 space-y-5 rounded-2xl border border-line bg-card p-5 shadow-[0_12px_40px_-24px_rgba(30,37,87,0.35)]">
                <div>
                  <label htmlFor="posting" className="mb-1.5 block text-sm font-semibold text-ink">
                    Job posting
                  </label>
                  <textarea
                    id="posting"
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    rows={7}
                    placeholder="Paste the full job description, bullet points and all"
                    className="w-full resize-y rounded-lg border border-line bg-card p-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-blue"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-semibold text-ink">Your CV</p>
                  <CvDropzone value={cv} onChange={setCv} />
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
                  <button
                    onClick={analyze}
                    disabled={busy || !ready}
                    className="min-h-12 cursor-pointer rounded-lg bg-blue px-7 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-faint"
                  >
                    {busy ? 'Checking every requirement...' : 'Check my fit'}
                  </button>
                  <button
                    onClick={() => {
                      setJd(SAMPLE_JD);
                      setCv(SAMPLE_CV);
                      setResult(null);
                      setError(null);
                    }}
                    className="min-h-11 cursor-pointer text-sm font-medium text-blue underline-offset-4 hover:underline"
                  >
                    Try an example
                  </button>
                </div>

                {error && (
                  <p role="alert" className="rounded-lg bg-bad-bg px-4 py-3 text-sm font-medium text-bad">
                    {error}
                  </p>
                )}
              </div>

              <p className="mt-5 text-xs text-ink-soft">
                No account, nothing stored. Runs on TypeSafe&apos;s Jev decision model, so each check costs a fraction of a
                cent.
              </p>
            </div>

            <div ref={cardRef} className={result ? "" : "lg:sticky lg:top-24"}>
              <Scorecard result={result} busy={busy} />
            </div>
          </div>
        </section>

        <section id="how" className="mt-20 scroll-mt-24">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink">How it works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
            No AI rewriting your CV. It only reads and judges, one requirement at a time.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-line bg-card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-soft text-sm font-extrabold text-blue">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mt-20 scroll-mt-24">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-ink">Questions</h2>
          <div className="mx-auto mt-8 max-w-2xl divide-y divide-line rounded-2xl border border-line bg-card px-6">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                  {f.q}
                  <span className="text-lg text-ink-faint transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-line py-8 text-center text-xs text-ink-faint">
        JobFit. Built on TypeSafe Jev via Vercel AI Gateway.
      </footer>
    </div>
  );
}

const STEPS = [
  {
    title: 'Paste the posting',
    body: 'The posting is split into individual requirements. Headings, perks and company blurb are filtered out automatically.',
  },
  {
    title: 'Drop in your CV',
    body: 'Upload a PDF or paste the text. Nothing is stored; the text only exists for the length of the check.',
  },
  {
    title: 'Read the recommendations',
    body: 'Each requirement is scored on how strongly your CV evidences it. Near misses come first, because those are the ones worth writing about.',
  },
];

const FAQ = [
  {
    q: 'Does it rewrite my CV?',
    a: 'No. It never generates text. It reads your CV against each requirement and returns a judgment with a confidence score, which is why the borderline list exists at all.',
  },
  {
    q: 'Is my CV stored anywhere?',
    a: 'No. It is sent to the model for the check and discarded. There is no account and no database.',
  },
  {
    q: 'Why is there a limit on checks?',
    a: 'This is a demo running on personal API credits, so each visitor gets a couple of checks per hour. If you hit the limit, come back a little later.',
  },
];

export type Requirement = {
  text: string;
  isRequirement: number;
  met: number;
  strength: number;
  critical: number;
};

export type Analysis = {
  requirements: Requirement[];
  fit: number;
  inputTokens: number;
  cost: number;
};

export const MEETS = 0.7;
export const MISSING = 0.3;

export function bucket(r: Requirement) {
  if (r.met >= MEETS) return 'strong' as const;
  if (r.met <= MISSING) return 'missing' as const;
  return 'borderline' as const;
}

export function splitRequirements(jd: string, limit = 24) {
  return jd
    .split(/\r?\n|(?<=\.)\s+(?=[A-Z])/)
    .map((line) => line.replace(/^\s*[-•*–—·]\s*/, '').trim())
    .filter((line) => line.length > 15 && line.length < 300)
    .slice(0, limit);
}

export function coverage(r: Requirement) {
  return Math.min(r.strength / 2, 1);
}

'use client';

import { bucket, coverage, type Analysis, type Requirement } from './lib';

type Props = { result: Analysis | null; busy: boolean };

const PILL = {
  good: 'bg-good-bg text-good',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-bad-bg text-bad',
} as const;

export function Scorecard({ result, busy }: Props) {
  const live = Boolean(result);
  const reqs = result?.requirements ?? [];
  const met = reqs.filter((r) => bucket(r) === 'strong');
  const address = reqs.filter((r) => bucket(r) === 'borderline');
  const missing = reqs.filter((r) => bucket(r) === 'missing');
  const pct = result ? Math.round(result.fit * 100) : 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line bg-card shadow-[0_24px_60px_-30px_rgba(30,37,87,0.35)] transition-opacity ${
        busy ? 'opacity-60' : ''
      }`}
      aria-live="polite"
      aria-busy={busy}
    >
      <div className="flex items-center justify-between bg-navy px-5 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">JobFit review</span>
        {!live && <span className="text-[11px] font-medium text-white/60">Preview</span>}
      </div>

      <div className="grid grid-cols-[auto_1fr] items-stretch border-b border-line">
        <div className="flex flex-col items-center justify-center border-r border-line px-5 py-5">
          <Ring value={live ? pct : 0} />
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">overall</span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-line">
          <Metric label="Met" value={live ? met.length : null} total={reqs.length} tone="good" pill="Strong" />
          <Metric label="Address" value={live ? address.length : null} total={reqs.length} tone="warn" pill="Needs work" />
          <Metric label="Missing" value={live ? missing.length : null} total={reqs.length} tone="bad" pill="Gap" />
        </div>
      </div>

      <div className="px-5 py-5">
        <p className="text-base font-bold text-ink">
          {live ? 'Here is your fit review.' : 'Your fit review will appear here.'}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {live
            ? `${reqs.length} requirements read from the posting and checked one by one.`
            : 'Add a posting and your CV, then run the check.'}
        </p>

        <div className="mt-4 rounded-xl border border-line p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">
              {live ? (
                <>
                  Your CV covers <span className="tabular-nums">{pct}</span> out of 100.
                </>
              ) : (
                'Your CV covers -- out of 100.'
              )}
            </p>
            {live && (
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${PILL[tone(pct)]}`}>
                {pct >= 70 ? 'Strong match' : pct >= 45 ? 'Worth applying' : 'Long shot'}
              </span>
            )}
          </div>
          <Gauge value={live ? pct : null} />
        </div>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">Recommendations</p>
        {live ? (
          <>
            <p className="mt-1.5 text-xs text-ink-soft">
              {address.length
                ? `Start with these ${address.length}. Your CV touches them without proving them, so name the specific work in your cover letter.`
                : 'Nothing borderline. Everything is either clearly met or clearly missing.'}
            </p>
            <ol className="mt-3 divide-y divide-line">
              {address.map((r, i) => (
                <Row key={r.text} index={i + 1} req={r} tone="warn" tag="Address" />
              ))}
              {missing.map((r, i) => (
                <Row key={r.text} index={address.length + i + 1} req={r} tone="bad" tag="Missing" />
              ))}
            </ol>
            {met.length > 0 && (
              <details className="mt-4 group">
                <summary className="cursor-pointer list-none text-xs font-semibold text-blue">
                  <span className="group-open:hidden">Show the {met.length} you clearly meet</span>
                  <span className="hidden group-open:inline">Hide the {met.length} you clearly meet</span>
                </summary>
                <ol className="mt-2 divide-y divide-line">
                  {met.map((r, i) => (
                    <Row key={r.text} index={i + 1} req={r} tone="good" tag="Met" />
                  ))}
                </ol>
              </details>
            )}
          </>
        ) : (
          <ul className="mt-3 space-y-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="h-6 w-6 shrink-0 rounded-md bg-line" />
                <span className="h-3 flex-1 rounded bg-line" style={{ maxWidth: `${85 - i * 15}%` }} />
              </li>
            ))}
          </ul>
        )}

        {result && (
          <p className="mt-5 text-[11px] text-ink-faint">
            {result.inputTokens.toLocaleString()} tokens, ${result.cost.toFixed(5)} of model spend for this check.
          </p>
        )}
      </div>
    </div>
  );
}

function tone(pct: number) {
  return pct >= 70 ? 'good' : pct >= 45 ? 'warn' : 'bad';
}

function Ring({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value === 0 ? 'var(--color-line-strong)' : `var(--color-${tone(value)})`;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" role="img" aria-label={`Overall fit ${value} percent`}>
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--color-line)" strokeWidth="6" />
      <circle
        cx="34"
        cy="34"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 34 34)"
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
      <text x="34" y="39" textAnchor="middle" className="fill-ink text-lg font-extrabold tabular-nums">
        {value || '--'}
      </text>
    </svg>
  );
}

function Metric({
  label,
  value,
  total,
  tone,
  pill,
}: {
  label: string;
  value: number | null;
  total: number;
  tone: keyof typeof PILL;
  pill: string;
}) {
  return (
    <div className="px-3 py-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-1 text-lg font-extrabold tabular-nums text-ink">
        {value === null ? '--' : value}
        <span className="text-xs font-semibold text-ink-faint">/{total || '--'}</span>
      </p>
      <span
        className={`mt-1.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
          value === null ? 'bg-line text-ink-faint' : PILL[tone]
        }`}
      >
        {pill}
      </span>
    </div>
  );
}

function Gauge({ value }: { value: number | null }) {
  return (
    <div className="mt-5">
      <div className="relative">
        {value !== null && (
          <div
            className="absolute -top-5 transition-[left] duration-700 ease-out"
            style={{ left: `calc(${value}% - 22px)` }}
          >
            <span className="block w-11 text-center text-[9px] font-bold uppercase tracking-wider text-ink">
              your cv
            </span>
            <span className="mx-auto mt-0.5 block h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-navy" />
          </div>
        )}
        <div
          className="h-2 w-full rounded-full"
          style={{
            background:
              value === null
                ? 'var(--color-line)'
                : 'linear-gradient(to right, #dc2626 0%, #f59e0b 50%, #16a34a 100%)',
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium tabular-nums text-ink-faint">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}

function Row({
  index,
  req,
  tone,
  tag,
}: {
  index: number;
  req: Requirement;
  tone: keyof typeof PILL;
  tag: string;
}) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-page text-[11px] font-bold tabular-nums text-ink-soft">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-ink">{req.text}</p>
        <p className="mt-1 text-[11px] text-ink-faint">
          {Math.round(coverage(req) * 100)}% evidenced
          {req.critical > 0.6 && ' · marked essential in the posting'}
        </p>
      </div>
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${PILL[tone]}`}>
        {tag}
      </span>
    </li>
  );
}

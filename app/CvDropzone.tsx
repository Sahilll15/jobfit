'use client';

import { useId, useRef, useState } from 'react';

type Props = { value: string; onChange: (v: string) => void };

export function CvDropzone({ value, onChange }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasting, setPasting] = useState(false);

  async function ingest(file: File) {
    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/extract', { method: 'POST', body: data });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      onChange(body.text);
      setSource(`${body.name} (${body.pages} page${body.pages === 1 ? '' : 's'})`);
      setPasting(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
      setSource(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const loaded = value.trim().length > 0;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) ingest(f);
        }}
        className={`rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors ${
          dragging ? 'border-blue bg-blue-soft/50' : 'border-blue/40 bg-blue-wash'
        }`}
      >
        {loaded && !pasting ? (
          <>
            <p className="text-sm font-semibold text-ink">
              {source ? `Loaded ${source}` : 'CV text added'}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {value.trim().split(/\s+/).length.toLocaleString()} words ready to check
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="min-h-10 cursor-pointer rounded-lg border border-line-strong bg-card px-4 text-sm font-semibold text-ink transition-colors hover:border-ink-faint"
              >
                Replace PDF
              </button>
              <button
                type="button"
                onClick={() => setPasting(true)}
                className="min-h-10 cursor-pointer rounded-lg px-3 text-sm font-medium text-blue transition-colors hover:bg-blue-soft/50"
              >
                Edit text
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-ink">Drop your CV here or choose a file.</p>
            <p className="mt-1 text-xs text-ink-soft">PDF only. Max 8MB file size.</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="mt-4 min-h-11 cursor-pointer rounded-lg bg-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink-faint"
            >
              {uploading ? 'Reading your PDF...' : 'Upload your CV'}
            </button>
            <p className="mt-3 text-xs text-ink-soft">
              or{' '}
              <button
                type="button"
                onClick={() => setPasting(true)}
                className="cursor-pointer font-medium text-blue underline underline-offset-2"
              >
                paste the text instead
              </button>
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        aria-label="Upload your CV as a PDF"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) ingest(f);
        }}
      />

      {pasting && (
        <div className="mt-3">
          <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-soft">
            Your CV text
          </label>
          <textarea
            id={id}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (source) setSource(null);
            }}
            rows={8}
            placeholder="Paste your CV here"
            className="w-full resize-y rounded-lg border border-line bg-card p-3 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-blue"
          />
          <button
            type="button"
            onClick={() => setPasting(false)}
            className="mt-1 min-h-9 cursor-pointer text-xs font-medium text-blue"
          >
            Done
          </button>
        </div>
      )}

      <p aria-live="polite" className="mt-2 min-h-4 text-xs text-bad">
        {error}
      </p>
    </div>
  );
}

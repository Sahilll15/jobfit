export function Nav({ onPrimary }: { onPrimary: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-blue">
          <img src="/icon.svg" alt="" width={26} height={26} className="rounded-md" />
          JobFit
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex" aria-label="Primary">
          <a href="#top" className="border-b-2 border-blue pb-0.5 text-ink">
            Home
          </a>
          <a href="#how" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#faq" className="transition-colors hover:text-ink">
            FAQ
          </a>
        </nav>

        <button
          onClick={onPrimary}
          className="min-h-10 cursor-pointer rounded-lg bg-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-deep"
        >
          Check my fit
        </button>
      </div>
    </header>
  );
}

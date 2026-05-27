import { Link, useLocation } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineMenuAlt2 } from 'react-icons/hi';

const pageTitles = {
  '/': { eyebrow: 'Today', title: 'Feed' },
  '/friends': { eyebrow: 'Network', title: 'People' },
  '/messages': { eyebrow: 'Threads', title: 'Messages' },
};

export default function Navbar({ onMenuClick, onOpenSearch }) {
  const location = useLocation();

  const meta =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/profile')
      ? { eyebrow: 'Profile', title: 'Profile' }
      : { eyebrow: '', title: '' });

  return (
    <header className="sticky top-0 z-30 hairline-b bg-graphite-50/70 backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-5 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden -ml-2 flex h-11 w-11 touch-manipulation items-center justify-center rounded-md text-ink-200 transition-colors hover:bg-white/[0.05] active:bg-white/[0.1]"
        >
          <HiOutlineMenuAlt2 className="h-5 w-5" strokeWidth={1.6} />
        </button>

        <div className="hidden min-w-0 items-baseline gap-3 lg:flex">
          <span className="eyebrow">{meta.eyebrow}</span>
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <h1 className="display text-[22px] leading-none text-ink-50">
            {meta.title}
          </h1>
        </div>

        <Link to="/" className="lg:hidden">
          <span className="display text-[20px] leading-none text-ink-50">
            Sphere
          </span>
        </Link>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open search"
            className="group relative hidden h-9 w-[220px] items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 text-left text-[13px] text-ink-400 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-ink-200 focus:outline-none focus:ring-1 focus:ring-white/15 sm:flex"
          >
            <HiOutlineSearch className="h-4 w-4" strokeWidth={1.6} />
            <span>Search</span>
            <span className="ml-auto flex items-center gap-1">
              <kbd className="rounded-[5px] border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[10px] font-mono text-faint">
                /
              </kbd>
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open search"
            className="-mr-2 flex h-11 w-11 touch-manipulation items-center justify-center rounded-md text-ink-200 transition-colors hover:bg-white/[0.05] active:bg-white/[0.1] sm:hidden"
          >
            <HiOutlineSearch className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </header>
  );
}

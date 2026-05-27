import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineMenuAlt2 } from 'react-icons/hi';

const pageTitles = {
  '/': { eyebrow: 'Today', title: 'Feed' },
  '/friends': { eyebrow: 'Network', title: 'People' },
  '/messages': { eyebrow: 'Threads', title: 'Messages' },
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const [focused, setFocused] = useState(false);

  const meta =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/profile')
      ? { eyebrow: 'Profile', title: 'Profile' }
      : { eyebrow: '', title: '' });

  return (
    <header className="sticky top-0 z-30 hairline-b bg-graphite-50/70 backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-5 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden -ml-1 flex h-9 w-9 items-center justify-center rounded-md text-ink-200 hover:bg-white/[0.05]"
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
          <motion.div
            animate={{ width: focused ? 360 : 220 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="relative hidden sm:block"
          >
            <HiOutlineSearch
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
              strokeWidth={1.6}
            />
            <input
              type="text"
              placeholder="Search"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="input-field h-9 rounded-md pl-9 pr-12 text-[13px]"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-[5px] border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[10px] font-mono text-faint">
              /
            </kbd>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

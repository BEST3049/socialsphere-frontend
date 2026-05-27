import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import api from '../api/axios';
import Avatar from './Avatar';

function formatExcerpt(text, q) {
  if (!text) return '';
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text.length > 90 ? `${text.slice(0, 90)}…` : text;
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + q.length + 50);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-ember-300/20 text-ember-200">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const items = useMemo(() => {
    const out = [];
    results.users.forEach((u) =>
      out.push({ kind: 'user', id: u.id, data: u })
    );
    results.posts.forEach((p) =>
      out.push({ kind: 'post', id: p.id, data: p })
    );
    return out;
  }, [results]);

  const navItems = useMemo(
    () => [
      { kind: 'nav', id: 'feed', label: 'Go to Feed', shortcut: 'F', to: '/' },
      { kind: 'nav', id: 'people', label: 'Go to People', shortcut: 'P', to: '/friends' },
      { kind: 'nav', id: 'messages', label: 'Go to Messages', shortcut: 'M', to: '/messages' },
    ],
    []
  );

  const showNav = query.trim().length === 0;
  const flat = showNav ? navItems : items;

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults({ users: [], posts: [] });
      setActiveIndex(0);
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults({ users: [], posts: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setResults({ users: data.users || [], posts: data.posts || [] });
      } catch {
        setResults({ users: [], posts: [] });
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const selectItem = (item) => {
    if (!item) return;
    if (item.kind === 'nav') navigate(item.to);
    else if (item.kind === 'user') navigate(`/profile/${item.data.username}`);
    else if (item.kind === 'post') navigate(`/profile/${item.data.author.username}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectItem(flat[activeIndex]);
    }
  };

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-label="Search"
            initial={{ y: -8, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -4, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[640px] overflow-hidden rounded-md border border-white/[0.07] bg-graphite-200/95 shadow-lift backdrop-blur-2xl"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-3 px-4 hairline-b">
              <HiOutlineSearch
                className="h-4 w-4 text-ink-400"
                strokeWidth={1.7}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people, posts, places…"
                className="flex-1 bg-transparent py-4 text-[15px] text-ink-50 outline-none placeholder:text-ink-400"
              />
              <kbd className="rounded-[5px] border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[10px] font-mono text-faint">
                Esc
              </kbd>
            </div>

            <div
              ref={listRef}
              className="max-h-[56vh] overflow-y-auto px-2 py-2"
            >
              {showNav && (
                <Section title="Jump to">
                  {navItems.map((item, i) => (
                    <Row
                      key={item.id}
                      idx={i}
                      active={activeIndex === i}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => selectItem(item)}
                      icon={
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.04] text-ink-200">
                          ↵
                        </span>
                      }
                      right={
                        <kbd className="rounded-[5px] border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[10px] font-mono text-faint">
                          {item.shortcut}
                        </kbd>
                      }
                    >
                      <span className="truncate text-[13.5px] text-ink-100">
                        {item.label}
                      </span>
                    </Row>
                  ))}
                </Section>
              )}

              {!showNav && (
                <>
                  {loading && (
                    <div className="px-3 py-6 text-center text-[12px] text-mute">
                      Searching…
                    </div>
                  )}

                  {!loading &&
                    results.users.length === 0 &&
                    results.posts.length === 0 && (
                      <div className="px-3 py-10 text-center">
                        <p className="display text-[18px] text-ink-100">
                          Nothing turned up
                        </p>
                        <p className="mt-1 text-[12px] text-mute">
                          Try a different name or phrase.
                        </p>
                      </div>
                    )}

                  {results.users.length > 0 && (
                    <Section title="People">
                      {results.users.map((u, i) => {
                        const idx = i;
                        return (
                          <Row
                            key={u.id}
                            idx={idx}
                            active={activeIndex === idx}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() =>
                              selectItem({ kind: 'user', data: u })
                            }
                            icon={
                              <Avatar
                                src={u.avatar}
                                username={u.username}
                                size="sm"
                              />
                            }
                            right={
                              <HiOutlineUser
                                className="h-4 w-4 text-ink-400"
                                strokeWidth={1.6}
                              />
                            }
                          >
                            <div className="min-w-0">
                              <div className="truncate text-[13.5px] text-ink-100">
                                <Highlight
                                  text={u.username}
                                  query={query.trim()}
                                />
                              </div>
                              {u.bio && (
                                <div className="truncate text-[11.5px] text-mute">
                                  {u.bio}
                                </div>
                              )}
                            </div>
                          </Row>
                        );
                      })}
                    </Section>
                  )}

                  {results.posts.length > 0 && (
                    <Section title="Posts">
                      {results.posts.map((p, i) => {
                        const idx = results.users.length + i;
                        return (
                          <Row
                            key={p.id}
                            idx={idx}
                            active={activeIndex === idx}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() =>
                              selectItem({ kind: 'post', data: p })
                            }
                            icon={
                              p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt=""
                                  className="h-8 w-8 rounded-md object-cover"
                                />
                              ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.04] text-ink-200">
                                  <HiOutlineDocumentText
                                    className="h-4 w-4"
                                    strokeWidth={1.6}
                                  />
                                </span>
                              )
                            }
                            right={
                              p.imageUrl ? (
                                <HiOutlinePhotograph
                                  className="h-4 w-4 text-ink-400"
                                  strokeWidth={1.6}
                                />
                              ) : null
                            }
                          >
                            <div className="min-w-0">
                              <div className="truncate text-[13.5px] text-ink-100">
                                <Highlight
                                  text={formatExcerpt(
                                    p.content || '(no text)',
                                    query.trim()
                                  )}
                                  query={query.trim()}
                                />
                              </div>
                              <div className="truncate text-[11.5px] text-mute">
                                @{p.author.username}
                              </div>
                            </div>
                          </Row>
                        );
                      })}
                    </Section>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 px-4 py-2 hairline-t bg-graphite-100/50">
              <div className="flex items-center gap-3 text-[10.5px] text-faint">
                <Hint label="navigate" keys={['↑', '↓']} />
                <Hint label="open" keys={['↵']} />
                <Hint label="close" keys={['esc']} />
              </div>
              <span className="text-[10.5px] font-mono text-faint">SocialSphere</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-1">
      <div className="px-3 pt-3 pb-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-faint">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ idx, active, onClick, onMouseEnter, icon, right, children }) {
  return (
    <button
      type="button"
      data-idx={idx}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
        active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
      {right && <span className="shrink-0">{right}</span>}
    </button>
  );
}

function Hint({ label, keys }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex gap-0.5">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded-[4px] border border-white/[0.08] bg-white/[0.02] px-1 py-0.5 font-mono text-[9.5px] text-ink-300"
          >
            {k}
          </kbd>
        ))}
      </span>
      <span>{label}</span>
    </span>
  );
}

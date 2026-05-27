import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineChat,
  HiOutlineUser,
  HiOutlineLogout,
} from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import Avatar from './Avatar';

const navItems = [
  { to: '/', icon: HiOutlineHome, label: 'Feed', shortcut: 'F' },
  { to: '/friends', icon: HiOutlineUserGroup, label: 'People', shortcut: 'P' },
  { to: '/messages', icon: HiOutlineChat, label: 'Messages', shortcut: 'M' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  const isWide = expanded || isOpen;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        animate={{ width: isWide ? 232 : 68 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/[0.06] bg-graphite-50/80 backdrop-blur-2xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-editorial`}
      >
        <div className="flex h-16 items-center px-4 hairline-b">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-bone-50 text-[14px] font-bold text-ink-900">
              ◐
            </span>
            <motion.span
              animate={{ opacity: isWide ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="display whitespace-nowrap text-[20px] leading-none text-ink-50"
            >
              Sphere
            </motion.span>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-4">
          {navItems.map(({ to, icon: Icon, label, shortcut }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className="nav-rail-item focus-ring group"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="rail-active"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-md bg-white/[0.05]"
                    />
                  )}
                  <span
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition ${
                      isActive ? 'text-ink-50' : 'text-ink-300 group-hover:text-ink-100'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </span>
                  <motion.span
                    animate={{ opacity: isWide ? 1 : 0, x: isWide ? 0 : -4 }}
                    transition={{ duration: 0.18 }}
                    className={`relative whitespace-nowrap font-medium ${
                      isActive ? 'text-ink-50' : 'text-ink-300 group-hover:text-ink-100'
                    }`}
                  >
                    {label}
                  </motion.span>
                  <motion.span
                    animate={{ opacity: isWide ? 1 : 0 }}
                    transition={{ duration: 0.18 }}
                    className="relative ml-auto rounded-[5px] border border-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-faint"
                  >
                    {shortcut}
                  </motion.span>
                </>
              )}
            </NavLink>
          ))}

          <div className="h-px bg-white/[0.05] my-3 mx-2.5" />

          <NavLink
            to={`/profile/${user?.username}`}
            onClick={onClose}
            className="nav-rail-item focus-ring group"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="rail-active"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-md bg-white/[0.05]"
                  />
                )}
                <span
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition ${
                    isActive ? 'text-ink-50' : 'text-ink-300 group-hover:text-ink-100'
                  }`}
                >
                  <HiOutlineUser className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </span>
                <motion.span
                  animate={{ opacity: isWide ? 1 : 0, x: isWide ? 0 : -4 }}
                  transition={{ duration: 0.18 }}
                  className={`relative whitespace-nowrap font-medium ${
                    isActive ? 'text-ink-50' : 'text-ink-300 group-hover:text-ink-100'
                  }`}
                >
                  Profile
                </motion.span>
              </>
            )}
          </NavLink>
        </nav>

        <div className="p-2 hairline-t">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <Link to={`/profile/${user?.username}`} className="shrink-0">
              <Avatar src={user?.avatar} username={user?.username} size="sm" />
            </Link>
            <motion.div
              animate={{ opacity: isWide ? 1 : 0, x: isWide ? 0 : -4 }}
              transition={{ duration: 0.18 }}
              className="min-w-0 flex-1 overflow-hidden"
            >
              <p className="truncate text-[13px] font-medium text-ink-50">
                {user?.username}
              </p>
              <p className="truncate text-[11px] text-mute">{user?.email}</p>
            </motion.div>
            {isWide && (
              <button
                onClick={handleLogout}
                className="rounded-md p-1.5 text-ink-300 transition hover:bg-white/[0.05] hover:text-ink-50"
                title="Sign out"
              >
                <HiOutlineLogout className="h-4 w-4" strokeWidth={1.6} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

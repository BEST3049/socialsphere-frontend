import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { fetchMe, token } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token) fetchMe();
  }, [token, fetchMe]);

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 lg:pl-[68px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

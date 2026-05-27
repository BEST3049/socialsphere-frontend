import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, username, password);
      toast.success('Welcome to Sphere');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* Form left */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-bone-50 text-[14px] font-bold text-ink-900">
              ◐
            </span>
            <span className="display text-[22px] text-ink-50">SocialSphere</span>
          </div>

          <p className="eyebrow">Create account</p>
          <h2 className="display mt-3 text-[40px] leading-[0.98] text-ink-50">
            Begin quietly.
          </h2>
          <p className="mt-3 text-[14px] text-mute">
            A space for the people you actually know.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="eyebrow mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="input-field"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_handle"
                pattern="^[a-zA-Z0-9_]{3,30}$"
                className="input-field"
                required
              />
              <p className="mt-2 text-[11px] text-faint">
                3–30 characters · letters, numbers, underscores
              </p>
            </div>
            <div>
              <label className="eyebrow mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-[13px] text-mute">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-ink-50 underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </section>

      {/* Editorial right */}
      <section className="relative hidden flex-col justify-between p-12 lg:order-2 lg:flex border-l border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 grain opacity-60" />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 80% 30%, rgba(214,162,102,0.07), transparent 50%), radial-gradient(circle at 20% 80%, rgba(120,140,180,0.05), transparent 50%)',
          }}
        />
        <div className="flex items-center justify-end">
          <Link
            to="/login"
            className="text-[12.5px] text-mute hover:text-ink-100"
          >
            Sign in →
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="display text-[88px] leading-[0.88] text-ink-50">
            People,
            <br />
            <span className="italic text-ink-200">not noise.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-mute">
            A refined dark social layer built for small, intentional networks.
            Edit your profile, follow conversations and share what matters.
          </p>
        </motion.div>
        <div className="space-y-2 text-[11.5px] text-faint">
          <span>By signing up you agree to keep things kind.</span>
          <div>
            Crafted by{' '}
            <a
              href="http://dharmeesh.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-200 underline-offset-4 transition-colors hover:text-ink-50 hover:underline"
            >
              Dharmeesh Rathod ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

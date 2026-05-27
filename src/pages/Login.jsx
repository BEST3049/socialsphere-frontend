import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Editorial left */}
      <section className="relative hidden flex-col justify-between p-12 lg:flex hairline-r overflow-hidden">
        <div className="absolute inset-0 grain opacity-60" />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(214,162,102,0.06), transparent 50%), radial-gradient(circle at 80% 70%, rgba(166,177,255,0.04), transparent 50%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-bone-50 text-[14px] font-bold text-ink-900">
            ◐
          </span>
          <span className="display text-[22px] text-ink-50">SocialSphere</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="display text-[88px] leading-[0.88] text-ink-50">
            A quieter
            <br />
            <span className="italic text-ink-200">social layer.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-mute">
            For people you actually know. Photos, conversations and signals worth keeping close.
          </p>
        </motion.div>

        <div className="flex items-center justify-between text-[11.5px] text-faint">
          <span>© Sphere {new Date().getFullYear()}</span>
          <span>Private by design</span>
        </div>
      </section>

      {/* Form right */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
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

          <p className="eyebrow">Sign in</p>
          <h2 className="display mt-3 text-[40px] leading-[0.98] text-ink-50">
            Welcome back.
          </h2>
          <p className="mt-3 text-[14px] text-mute">
            Continue to your private feed.
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
              <div className="mb-2 flex items-center justify-between">
                <label className="eyebrow">Password</label>
                <button
                  type="button"
                  className="text-[11px] text-mute hover:text-ink-100"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-[13px] text-mute">
            New here?{' '}
            <Link
              to="/register"
              className="font-medium text-ink-50 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </section>
    </div>
  );
}

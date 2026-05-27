import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlinePhotograph,
  HiOutlineFilm,
  HiOutlineX,
  HiOutlineAtSymbol,
  HiPencilAlt,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Avatar from './Avatar';

export default function CreatePost({ friends = [], onCreated, open, onClose }) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const imageRef = useRef();
  const videoRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setVideo(null);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image && !video) {
      toast.error('Add something to share');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (image) formData.append('image', image);
    if (video) formData.append('video', video);
    if (taggedUsers.length) {
      formData.append('taggedUserIds', JSON.stringify(taggedUsers));
    }

    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setContent('');
      setImage(null);
      setVideo(null);
      setImagePreview(null);
      setTaggedUsers([]);
      toast.success('Posted');
      onCreated?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (userId) => {
    setTaggedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/65 backdrop-blur-md px-4 pt-16 sm:items-center sm:pt-0"
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px] overflow-hidden rounded-xl border border-white/[0.08] bg-graphite-100 shadow-lift"
          >
            <div className="flex items-center justify-between px-5 py-3.5 hairline-b">
              <div className="flex items-center gap-3">
                <span className="eyebrow">Compose</span>
                <span className="h-1 w-1 rounded-full bg-white/15" />
                <span className="text-[13px] text-mute">
                  Esc to cancel · ⌘↵ to publish
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-ink-300 hover:bg-white/[0.05] hover:text-ink-50"
              >
                <HiOutlineX className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pb-4 pt-5">
              <div className="flex items-start gap-3">
                <Avatar src={user?.avatar} username={user?.username} size="md" />
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSubmit(e);
                    }
                  }}
                  placeholder="What's worth saying?"
                  rows={3}
                  className="input-bare flex-1 resize-none text-[17px] leading-[1.5] placeholder:text-ink-400 placeholder:font-display placeholder:text-[20px] placeholder:italic"
                />
              </div>

              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative mt-4 overflow-hidden rounded-lg ring-1 ring-white/[0.06]"
                  >
                    <img
                      src={imagePreview}
                      alt=""
                      className="max-h-72 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-black/80"
                    >
                      <HiOutlineX className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {video && (
                <div className="mt-4 flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px]">
                  <span className="truncate text-ember-300">
                    🎬 {video.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVideo(null)}
                    className="rounded-md p-1 text-ink-300 hover:bg-white/[0.04] hover:text-ink-50"
                  >
                    <HiOutlineX className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <AnimatePresence>
                {showTags && friends.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 hairline-t pt-3">
                      <p className="eyebrow mb-2">Tag friends</p>
                      <div className="flex flex-wrap gap-1.5">
                        {friends.map((friend) => {
                          const active = taggedUsers.includes(friend.id);
                          return (
                            <button
                              key={friend.id}
                              type="button"
                              onClick={() => toggleTag(friend.id)}
                              className={`rounded-md border px-2 py-1 text-[12px] transition ${
                                active
                                  ? 'border-ember-400/40 bg-ember-400/10 text-ember-300'
                                  : 'border-white/[0.06] bg-white/[0.02] text-ink-300 hover:border-white/[0.12] hover:text-ink-100'
                              }`}
                            >
                              @{friend.username}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="flex items-center justify-between px-5 py-3 hairline-t">
              <div className="flex items-center gap-1">
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                <button
                  type="button"
                  onClick={() => imageRef.current?.click()}
                  className="rounded-md p-2 text-ink-300 transition hover:bg-white/[0.05] hover:text-ink-50"
                  title="Add image"
                >
                  <HiOutlinePhotograph className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </button>
                <button
                  type="button"
                  onClick={() => videoRef.current?.click()}
                  className="rounded-md p-2 text-ink-300 transition hover:bg-white/[0.05] hover:text-ink-50"
                  title="Add video"
                >
                  <HiOutlineFilm className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowTags((s) => !s)}
                  className={`rounded-md p-2 transition ${
                    showTags
                      ? 'bg-ember-400/10 text-ember-300'
                      : 'text-ink-300 hover:bg-white/[0.05] hover:text-ink-50'
                  }`}
                  title="Tag people"
                >
                  <HiOutlineAtSymbol className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[12px] tabular-nums text-faint">
                  {content.length}/500
                </span>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || (!content.trim() && !image && !video)}
                  className="btn-primary"
                >
                  {loading ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ComposeButton({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-bone-50 pl-4 pr-5 text-[13.5px] font-semibold text-ink-900 shadow-lift hover:bg-white sm:bottom-8 sm:right-8"
    >
      <HiPencilAlt className="h-[18px] w-[18px]" strokeWidth={1.8} />
      <span>Compose</span>
    </motion.button>
  );
}

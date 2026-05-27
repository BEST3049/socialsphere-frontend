import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineChat,
  HiOutlineBookmark,
  HiOutlineDotsHorizontal,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Avatar from './Avatar';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function PostCard({ post, onUpdate, variant = 'default' }) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      const { data } = await api.post(`/posts/${post.id}/like`);
      setLiked(data.liked);
    } catch {
      setLiked(liked);
      setLikeCount(likeCount);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, {
        content: newComment,
      });
      setComments((prev) => [...prev, data.comment]);
      setCommentCount((c) => c + 1);
      setNewComment('');
      onUpdate?.();
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const mediaTall = variant === 'tall';

  return (
    <article className="group relative px-4 py-5 sm:px-6 hairline-b transition duration-300 ease-editorial hover:bg-white/[0.012]">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${post.author.username}`} className="shrink-0">
          <Avatar src={post.author.avatar} username={post.author.username} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px]">
            <Link
              to={`/profile/${post.author.username}`}
              className="font-semibold text-ink-50 hover:underline"
            >
              {post.author.username}
            </Link>
            <span className="text-faint">·</span>
            <span className="text-mute">{timeAgo(post.createdAt)}</span>
            <button className="ml-auto rounded-md p-1 text-faint opacity-0 transition hover:bg-white/[0.04] hover:text-ink-200 group-hover:opacity-100">
              <HiOutlineDotsHorizontal className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {post.content && (
            <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-[1.55] text-ink-100">
              {post.content}
            </p>
          )}

          {post.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/profile/${tag.username}`}
                  className="text-[13px] font-medium text-ember-300 hover:text-ember-200"
                >
                  @{tag.username}
                </Link>
              ))}
            </div>
          )}

          {post.imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative mt-3 overflow-hidden rounded-lg ring-1 ring-white/[0.05]"
            >
              <img
                src={post.imageUrl}
                alt=""
                loading="lazy"
                className={`w-full object-cover ${
                  mediaTall ? 'max-h-[640px]' : 'max-h-[520px]'
                }`}
              />
            </motion.div>
          )}

          {post.videoUrl && (
            <div className="mt-3 overflow-hidden rounded-lg ring-1 ring-white/[0.05]">
              <video
                src={post.videoUrl}
                controls
                className="w-full max-h-[520px]"
              />
            </div>
          )}

          <div className="mt-3 flex items-center gap-1 text-[13px] text-mute">
            <button
              type="button"
              onClick={handleLike}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike' : 'Like'}
              className={`flex h-9 touch-manipulation items-center gap-1.5 rounded-md px-2.5 transition active:bg-rose-400/10 hover:bg-rose-400/5 hover:text-rose-300 ${
                liked ? 'text-rose-300' : ''
              }`}
            >
              <motion.span
                key={liked ? '1' : '0'}
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 480, damping: 16 }}
              >
                {liked ? (
                  <HiHeart className="h-4 w-4" />
                ) : (
                  <HiOutlineHeart className="h-4 w-4" strokeWidth={1.6} />
                )}
              </motion.span>
              <span className="tabular-nums">{likeCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments((s) => !s)}
              aria-expanded={showComments}
              aria-label="Toggle comments"
              className="flex h-9 touch-manipulation items-center gap-1.5 rounded-md px-2.5 transition active:bg-white/[0.07] hover:bg-white/[0.04] hover:text-ink-100"
            >
              <HiOutlineChat className="h-4 w-4" strokeWidth={1.6} />
              <span className="tabular-nums">{commentCount}</span>
            </button>

            <button
              type="button"
              aria-label="Save"
              className="ml-auto flex h-9 w-9 touch-manipulation items-center justify-center rounded-md transition active:bg-white/[0.07] hover:bg-white/[0.04] hover:text-ink-100"
            >
              <HiOutlineBookmark className="h-4 w-4" strokeWidth={1.6} />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3 hairline-t pt-3">
                  {comments.map((comment) => (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={comment.id}
                      className="flex gap-2.5 text-[13.5px]"
                    >
                      <Avatar
                        src={comment.author.avatar}
                        username={comment.author.username}
                        size="xs"
                      />
                      <div className="leading-[1.5]">
                        <Link
                          to={`/profile/${comment.author.username}`}
                          className="font-semibold text-ink-50 hover:underline"
                        >
                          {comment.author.username}
                        </Link>{' '}
                        <span className="text-ink-200">{comment.content}</span>
                      </div>
                    </motion.div>
                  ))}
                  <form onSubmit={handleComment} className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Reply..."
                      className="input-bare flex-1 py-1 text-[13.5px]"
                    />
                    {newComment.trim() && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="text-[12.5px] font-medium text-ember-300 hover:text-ember-200 disabled:opacity-50"
                      >
                        Send
                      </button>
                    )}
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}

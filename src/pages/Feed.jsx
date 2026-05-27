import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import CreatePost, { ComposeButton } from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { PostSkeleton } from '../components/LoadingSkeleton';
import { MotionPage, StaggerList, StaggerItem } from '../components/Motion';
import EmptyState from '../components/EmptyState';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/Avatar';

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function Feed() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);

  const fetchFeed = useCallback(async () => {
    try {
      const [feedRes, friendsRes] = await Promise.all([
        api.get('/posts/feed'),
        api.get('/friends'),
      ]);
      setPosts(feedRes.data.posts);
      setFriends(friendsRes.data.friends);
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <MotionPage>
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* Main feed column */}
        <section className="min-w-0 lg:border-r lg:border-white/[0.06]">
          {/* Editorial header */}
          <div className="px-4 pt-10 sm:px-8 sm:pt-14">
            <p className="eyebrow">{formatToday()}</p>
            <h1 className="display mt-3 text-[56px] leading-[0.95] text-ink-50 sm:text-[72px]">
              Quietly,
              <br />
              <span className="italic text-ink-200">your circle.</span>
            </h1>
            <div className="mt-6 flex items-center gap-3 text-[13px] text-mute">
              <span>{posts.length} posts</span>
              <span className="h-1 w-1 rounded-full bg-white/15" />
              <span>{friends.length} friends</span>
              <button
                onClick={() => setComposerOpen(true)}
                className="ml-auto text-[13px] font-medium text-ember-300 hover:text-ember-200"
              >
                Compose →
              </button>
            </div>
          </div>

          <div className="mt-10 hairline-t" />

          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              eyebrow="Empty space"
              title={
                <>
                  Nothing here <span className="italic">yet</span>.
                </>
              }
              description="Your feed will fill once you and your friends start posting. Begin with a single thought."
              action={
                <button onClick={() => setComposerOpen(true)} className="btn-primary">
                  Write the first post
                </button>
              }
            />
          ) : (
            <StaggerList>
              {posts.map((post, idx) => (
                <StaggerItem key={post.id}>
                  <PostCard
                    post={post}
                    onUpdate={fetchFeed}
                    variant={idx % 5 === 0 && post.imageUrl ? 'tall' : 'default'}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </section>

        {/* Sticky context rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-16 px-6 py-10">
            {/* Identity block */}
            <div className="flex items-center gap-3 hairline-b pb-5">
              <Avatar src={user?.avatar} username={user?.username} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-ink-50">
                  {user?.username}
                </p>
                <p className="truncate text-[12px] text-mute">{user?.email}</p>
              </div>
            </div>

            {/* Asymmetric stats */}
            <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5">
              <div className="col-span-2">
                <p className="eyebrow">Posts</p>
                <p className="display mt-2 text-[36px] leading-none text-ink-50">
                  {posts.length}
                </p>
              </div>
              <div>
                <p className="eyebrow">Friends</p>
                <p className="display mt-2 text-[24px] leading-none text-ink-50">
                  {friends.length}
                </p>
              </div>
            </div>

            {/* Friends preview */}
            {friends.length > 0 && (
              <div className="mt-10">
                <div className="mb-3 flex items-center justify-between">
                  <p className="eyebrow">Your circle</p>
                  <Link
                    to="/friends"
                    className="text-[11px] font-medium text-mute hover:text-ink-100"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {friends.slice(0, 5).map((friend) => (
                    <Link
                      key={friend.id}
                      to={`/profile/${friend.username}`}
                      className="group flex items-center gap-3"
                    >
                      <Avatar src={friend.avatar} username={friend.username} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink-100 group-hover:text-ink-50">
                          {friend.username}
                        </p>
                        {friend.bio && (
                          <p className="truncate text-[11.5px] text-mute">
                            {friend.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Footer note */}
            <div className="mt-10 hairline-t pt-5">
              <p className="text-[11.5px] leading-5 text-faint">
                A quieter social layer. Photos, conversations and signals from people you actually know.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <CreatePost
        friends={friends}
        onCreated={fetchFeed}
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />
      <ComposeButton onClick={() => setComposerOpen(true)} />
    </MotionPage>
  );
}

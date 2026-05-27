import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { PostSkeleton } from '../components/LoadingSkeleton';
import { MotionPage, StaggerList, StaggerItem } from '../components/Motion';
import EmptyState from '../components/EmptyState';
import {
  HiOutlinePencil,
  HiOutlineCamera,
  HiOutlineChat,
} from 'react-icons/hi';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuthStore();
  const isOwnProfile = currentUser?.username === username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/${username}`);
        setProfile(data.user);
        setEditForm({ username: data.user.username, bio: data.user.bio || '' });
        const postsRes = await api.get(`/posts/user/${data.user.id}`);
        setPosts(postsRes.data.posts);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append('username', editForm.username);
    formData.append('bio', editForm.bio);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((p) => ({ ...p, ...data.user }));
      updateUser({ ...currentUser, ...data.user });
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      await api.post('/friends/request', { receiverId: profile.id });
      toast.success('Friend request sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <div className="h-72 bg-gradient-to-br from-graphite-200 to-graphite-50" />
        <div className="px-4 sm:px-8 -mt-16">
          <div className="h-28 w-28 rounded-lg bg-white/[0.05]" />
          <div className="mt-4 h-10 w-48 rounded-md bg-white/[0.05]" />
          <div className="mt-2 h-4 w-72 rounded-md bg-white/[0.03]" />
        </div>
        <div className="mt-12">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="User not found"
        description="This profile doesn't exist."
      />
    );
  }

  const seedColor = (profile.username?.charCodeAt(0) || 0) % 3;
  const covers = [
    'radial-gradient(ellipse at 30% 40%, #2a2820 0%, #14110d 60%, #0a0a0c 100%)',
    'radial-gradient(ellipse at 70% 30%, #1a2228 0%, #11161a 60%, #0a0a0c 100%)',
    'radial-gradient(ellipse at 50% 60%, #251f24 0%, #15121a 60%, #0a0a0c 100%)',
  ];

  return (
    <MotionPage>
      <div className="mx-auto max-w-[1180px]">
        {/* Cinematic cover */}
        <div
          className="relative h-64 overflow-hidden sm:h-80"
          style={{ background: covers[seedColor] }}
        >
          <div className="grain absolute inset-0" />
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 30%, rgba(214,162,102,0.08), transparent 40%), radial-gradient(circle at 75% 70%, rgba(166,177,255,0.05), transparent 50%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent" />
        </div>

        {/* Identity strip — asymmetric, not centered */}
        <div className="relative px-4 sm:px-8">
          <div className="-mt-20 flex flex-col gap-6 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              <div className="relative">
                <Avatar
                  src={avatarPreview || profile.avatar}
                  username={profile.username}
                  size="2xl"
                  rounded="lg"
                  className="ring-4 ring-bg"
                />
                {editing && (
                  <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-white/[0.1] bg-graphite-200 text-ink-50 hover:bg-graphite-300">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          setAvatarFile(f);
                          setAvatarPreview(URL.createObjectURL(f));
                        }
                      }}
                    />
                    <HiOutlineCamera className="h-4 w-4" strokeWidth={1.6} />
                  </label>
                )}
              </div>
              <div className="pb-2">
                <p className="eyebrow">@{profile.username}</p>
                <h1 className="display mt-2 text-[44px] leading-[0.95] text-ink-50 sm:text-[56px]">
                  {profile.username}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-outline gap-2"
                >
                  <HiOutlinePencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Edit profile
                </button>
              )}
              {isOwnProfile && editing && (
                <>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </>
              )}
              {!isOwnProfile && !profile.isFriend && (
                <button onClick={handleAddFriend} className="btn-primary">
                  Add friend
                </button>
              )}
              {!isOwnProfile && profile.isFriend && (
                <>
                  <button
                    onClick={() => navigate(`/messages/${profile.id}`)}
                    className="btn-outline gap-2"
                  >
                    <HiOutlineChat className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Message
                  </button>
                  <span className="chip border-emerald-300/20 bg-emerald-300/5 text-emerald-300/90">
                    Connected
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bio + asymmetric stats */}
          <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {editing ? (
                <form className="space-y-3" onSubmit={handleSave}>
                  <input
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    className="input-field max-w-sm"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    placeholder="A short bio…"
                    rows={3}
                    className="input-field resize-none"
                  />
                </form>
              ) : profile.bio ? (
                <p className="font-display text-[24px] italic leading-[1.35] text-ink-100 sm:text-[28px]">
                  “{profile.bio}”
                </p>
              ) : (
                <p className="text-[15px] text-mute">
                  {isOwnProfile
                    ? 'Add a bio to introduce yourself.'
                    : 'No bio yet.'}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-6">
              <div>
                <p className="display text-[40px] leading-none text-ink-50">
                  {profile.postCount ?? posts.length}
                </p>
                <p className="eyebrow mt-1.5">Posts</p>
              </div>
              <div>
                <p className="display text-[40px] leading-none text-ink-50">
                  {profile.friendCount ?? 0}
                </p>
                <p className="eyebrow mt-1.5">Friends</p>
              </div>
              <div>
                <p className="display text-[40px] leading-none text-ink-200">
                  {profile.isFriend ? '·' : isOwnProfile ? '·' : '~'}
                </p>
                <p className="eyebrow mt-1.5">
                  {profile.isFriend
                    ? 'Connected'
                    : isOwnProfile
                    ? 'You'
                    : 'Public'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-14 hairline-b">
            <div className="flex items-center gap-6">
              {['posts', 'media'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative pb-3 text-[13.5px] font-medium capitalize transition ${
                    tab === t ? 'text-ink-50' : 'text-mute hover:text-ink-200'
                  }`}
                >
                  {t}
                  {tab === t && (
                    <motion.span
                      layoutId="profile-tab"
                      className="absolute -bottom-px left-0 right-0 h-px bg-ink-50"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-2">
          {tab === 'posts' &&
            (posts.length === 0 ? (
              <EmptyState
                eyebrow="Quiet"
                title="No posts yet"
                description={
                  isOwnProfile
                    ? 'Share your first thought.'
                    : 'This profile hasn\u2019t posted anything yet.'
                }
              />
            ) : (
              <StaggerList>
                {posts.map((post) => (
                  <StaggerItem key={post.id}>
                    <PostCard post={post} />
                  </StaggerItem>
                ))}
              </StaggerList>
            ))}

          {tab === 'media' && (
            <div className="grid grid-cols-2 gap-1 px-4 py-6 sm:grid-cols-3 sm:gap-2 sm:px-8">
              {posts.filter((p) => p.imageUrl).length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    eyebrow="Media"
                    title="No images yet"
                    description="When images are posted, they'll appear here."
                  />
                </div>
              ) : (
                posts
                  .filter((p) => p.imageUrl)
                  .map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aspect-square overflow-hidden rounded-md ring-1 ring-white/[0.05]"
                    >
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 hover:scale-105"
                      />
                    </motion.div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </MotionPage>
  );
}

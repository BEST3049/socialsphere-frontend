import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import { UserSkeleton } from '../components/LoadingSkeleton';
import { MotionPage, StaggerList, StaggerItem } from '../components/Motion';
import EmptyState from '../components/EmptyState';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [section, setSection] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests'),
      ]);
      setFriends(friendsRes.data.friends);
      setRequests(requestsRes.data.requests);
    } catch {
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(
          `/users/search?q=${encodeURIComponent(query)}`
        );
        const ids = new Set(friends.map((f) => f.id));
        setSearchResults(data.users.filter((u) => !ids.has(u.id)));
      } catch {
        toast.error('Search failed');
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [query, friends]);

  const handleSendRequest = async (receiverId) => {
    try {
      await api.post('/friends/request', { receiverId });
      toast.success('Request sent');
      setSearchResults((prev) => prev.filter((u) => u.id !== receiverId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await api.patch(`/friends/request/${requestId}`, { action });
      toast.success(action === 'accept' ? 'Friend added' : 'Declined');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <MotionPage>
      <div className="mx-auto max-w-[920px] px-4 py-10 sm:px-8 sm:py-14">
        {/* Editorial header */}
        <div className="grid items-end gap-8 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Network</p>
            <h1 className="display mt-3 text-[56px] leading-[0.95] text-ink-50 sm:text-[68px]">
              People worth
              <br />
              <span className="italic text-ink-200">keeping close.</span>
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <p className="display text-[36px] leading-none text-ink-50">
                {friends.length}
              </p>
              <p className="eyebrow mt-1.5">Connected</p>
            </div>
            <div>
              <p className="display text-[36px] leading-none text-ember-300">
                {requests.length}
              </p>
              <p className="eyebrow mt-1.5">Pending</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-12">
          <HiOutlineSearch
            className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
            strokeWidth={1.6}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find someone..."
            className="input-bare h-14 w-full border-b border-white/[0.08] pb-3 pl-8 text-[24px] font-display italic placeholder:text-ink-400 focus:border-white/30"
          />
          {searching && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] text-mute">
              Searching…
            </span>
          )}
        </div>

        {/* Search results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2"
            >
              <p className="eyebrow mt-6 mb-4">Results</p>
              <StaggerList>
                {searchResults.map((u) => (
                  <StaggerItem key={u.id}>
                    <div className="flex items-center gap-4 py-3 hairline-b">
                      <Avatar src={u.avatar} username={u.username} />
                      <Link
                        to={`/profile/${u.username}`}
                        className="flex-1 text-[14.5px] font-medium text-ink-50 hover:underline"
                      >
                        {u.username}
                      </Link>
                      <button
                        onClick={() => handleSendRequest(u.id)}
                        className="btn-outline text-[12.5px]"
                      >
                        Add
                      </button>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending requests */}
        {requests.length > 0 && (
          <section className="mt-14">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="display text-[28px] leading-none text-ink-50">
                Pending invites
              </h2>
              <span className="text-[12px] text-mute">
                {requests.length} {requests.length === 1 ? 'request' : 'requests'}
              </span>
            </div>
            <StaggerList>
              {requests.map((req) => (
                <StaggerItem key={req.id}>
                  <div className="flex items-center gap-4 py-4 hairline-b">
                    <Avatar
                      src={req.sender.avatar}
                      username={req.sender.username}
                    />
                    <Link
                      to={`/profile/${req.sender.username}`}
                      className="flex-1"
                    >
                      <p className="text-[14.5px] font-medium text-ink-50 hover:underline">
                        {req.sender.username}
                      </p>
                      <p className="text-[12px] text-mute">wants to connect</p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespond(req.id, 'reject')}
                        className="text-[12.5px] text-mute hover:text-ink-100"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, 'accept')}
                        className="btn-primary text-[12.5px]"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          </section>
        )}

        {/* Friends list */}
        <section className="mt-14">
          <div className="mb-5 flex items-baseline justify-between hairline-b pb-3">
            <h2 className="display text-[28px] leading-none text-ink-50">
              Your circle
            </h2>
            <div className="flex gap-1 text-[12px]">
              {['all', 'recent'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  className={`rounded-md px-2 py-1 capitalize transition ${
                    section === s
                      ? 'bg-white/[0.05] text-ink-50'
                      : 'text-mute hover:text-ink-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3, 4].map((i) => (
                <UserSkeleton key={i} />
              ))}
            </div>
          ) : friends.length === 0 ? (
            <EmptyState
              eyebrow="Empty"
              title="No one here yet"
              description="Search for someone above to send the first request."
            />
          ) : (
            <StaggerList>
              {friends.map((friend) => (
                <StaggerItem key={friend.id}>
                  <Link
                    to={`/profile/${friend.username}`}
                    className="group flex items-center gap-4 py-4 hairline-b transition hover:bg-white/[0.012] -mx-4 px-4 sm:-mx-6 sm:px-6"
                  >
                    <Avatar src={friend.avatar} username={friend.username} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-ink-50 group-hover:underline">
                        {friend.username}
                      </p>
                      <p className="truncate text-[12.5px] text-mute">
                        {friend.bio || 'No bio yet.'}
                      </p>
                    </div>
                    <span className="text-[12px] text-faint opacity-0 transition group-hover:opacity-100">
                      View →
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </section>
      </div>
    </MotionPage>
  );
}

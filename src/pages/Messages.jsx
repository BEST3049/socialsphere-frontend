import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiPaperAirplane,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineSearch,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/Avatar';
import { ChatSkeleton, UserSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export default function Messages() {
  const { user } = useAuthStore();
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.conversations);
    } catch {
      toast.error('Failed to load conversations');
    }
  };

  const fetchFriends = async () => {
    try {
      const { data } = await api.get('/friends');
      setFriends(data.friends);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    Promise.all([fetchConversations(), fetchFriends()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // Resolve URL :userId → selectedUser using friends or conversations
  useEffect(() => {
    if (!urlUserId) {
      setSelectedUser(null);
      setMessages([]);
      return;
    }
    const friend = friends.find((f) => f.id === urlUserId);
    if (friend) {
      setSelectedUser(friend);
      return;
    }
    const conv = conversations.find((c) => c.partner.id === urlUserId);
    if (conv) {
      setSelectedUser(conv.partner);
      return;
    }
  }, [urlUserId, friends, conversations]);

  // Load messages whenever selectedUser changes; poll every 5s
  useEffect(() => {
    if (!selectedUser) return;
    let cancelled = false;

    const loadMessages = async ({ silent } = {}) => {
      if (!silent) setLoadingChat(true);
      try {
        const { data } = await api.get(`/messages/${selectedUser.id}`);
        if (!cancelled) setMessages(data.messages);
      } catch (err) {
        if (!silent) {
          toast.error(
            err.response?.data?.message || 'Failed to load messages'
          );
        }
      } finally {
        if (!cancelled) setLoadingChat(false);
      }
    };

    loadMessages();
    const interval = setInterval(() => loadMessages({ silent: true }), 5000);
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openThread = (partner) => {
    navigate(`/messages/${partner.id}`);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    const content = newMessage;
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      content,
      senderId: user.id,
      receiverId: selectedUser.id,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage('');
    setSending(true);

    try {
      const { data } = await api.post('/messages', {
        receiverId: selectedUser.id,
        content,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data.message : m))
      );
      fetchConversations();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(content);
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  const groupedMessages = useMemo(() => {
    const out = [];
    messages.forEach((msg, i) => {
      const prev = messages[i - 1];
      const sameSender = prev && prev.senderId === msg.senderId;
      const closeInTime =
        prev && new Date(msg.createdAt) - new Date(prev.createdAt) < 60_000 * 3;
      out.push({ msg, grouped: sameSender && closeInTime });
    });
    return out;
  }, [messages]);

  // Friends not yet in a conversation (for the New Thread picker)
  const friendsForPicker = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return friends.filter((f) =>
      q ? f.username.toLowerCase().includes(q) : true
    );
  }, [friends, pickerQuery]);

  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="flex h-full">
        {/* Conversation list */}
        <aside
          className={`${
            selectedUser ? 'hidden md:flex' : 'flex'
          } w-full flex-col hairline-r md:w-[340px]`}
        >
          <div className="flex items-start justify-between px-5 pt-8 pb-5">
            <div>
              <p className="eyebrow">Threads</p>
              <h1 className="display mt-2 text-[32px] leading-none text-ink-50">
                Messages
              </h1>
            </div>
            <button
              onClick={() => setPickerOpen(true)}
              className="mt-1 flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.02] text-ink-200 transition hover:bg-white/[0.05] hover:text-ink-50"
              title="New thread"
            >
              <HiOutlinePlus className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-4 px-5">
                {[1, 2, 3].map((i) => (
                  <UserSkeleton key={i} />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-5">
                <EmptyState
                  eyebrow="Quiet"
                  title="No threads yet"
                  description={
                    friends.length > 0
                      ? 'Start a thread with someone in your circle.'
                      : 'Add a friend first, then start a conversation.'
                  }
                  action={
                    friends.length > 0 ? (
                      <button
                        onClick={() => setPickerOpen(true)}
                        className="btn-primary"
                      >
                        Start a thread
                      </button>
                    ) : (
                      <Link to="/friends" className="btn-outline">
                        Find friends
                      </Link>
                    )
                  }
                />
              </div>
            ) : (
              conversations.map(({ partner, lastMessage, unread }) => {
                const isActive = selectedUser?.id === partner.id;
                return (
                  <button
                    key={partner.id}
                    onClick={() => openThread(partner)}
                    className={`relative flex w-full items-center gap-3 px-5 py-3.5 text-left transition ${
                      isActive ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="thread-active"
                        className="absolute left-0 top-1/2 h-8 w-[2px] -translate-y-1/2 rounded-full bg-bone-50"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Avatar src={partner.avatar} username={partner.username} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[14px] font-medium text-ink-50">
                          {partner.username}
                        </span>
                        <span className="text-[11px] text-faint">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`truncate text-[12.5px] ${
                          unread > 0 ? 'text-ink-100 font-medium' : 'text-mute'
                        }`}
                      >
                        {lastMessage.senderId === user?.id && (
                          <span className="text-faint">You: </span>
                        )}
                        {lastMessage.content}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ember-400 px-1.5 text-[11px] font-bold text-ink-900">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat panel */}
        <section
          className={`${
            !selectedUser ? 'hidden md:flex' : 'flex'
          } min-w-0 flex-1 flex-col`}
        >
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3 px-6 py-4 hairline-b">
                <button
                  onClick={() => navigate('/messages')}
                  className="rounded-md p-1.5 text-ink-300 hover:bg-white/[0.05] md:hidden"
                >
                  <HiOutlineArrowLeft className="h-5 w-5" />
                </button>
                <Link
                  to={`/profile/${selectedUser.username}`}
                  className="flex items-center gap-3"
                >
                  <Avatar
                    src={selectedUser.avatar}
                    username={selectedUser.username}
                  />
                  <div>
                    <p className="text-[14px] font-medium text-ink-50">
                      {selectedUser.username}
                    </p>
                    <p className="text-[11px] text-emerald-400/80">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80 align-middle" />{' '}
                      Active
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {loadingChat && messages.length === 0 ? (
                  <ChatSkeleton />
                ) : messages.length === 0 ? (
                  <EmptyState
                    eyebrow="New thread"
                    title="Say hello"
                    description={`Start a conversation with ${selectedUser.username}.`}
                  />
                ) : (
                  <div className="space-y-1">
                    {groupedMessages.map(({ msg, grouped }, i) => {
                      const isMine = msg.senderId === user?.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.01, 0.2) }}
                          className={`flex items-end gap-2 ${
                            isMine ? 'flex-row-reverse pl-12' : 'pr-12'
                          } ${grouped ? 'mt-0.5' : 'mt-3'}`}
                        >
                          {!isMine && (
                            <div className="w-7 shrink-0">
                              {!grouped && (
                                <Avatar
                                  src={selectedUser.avatar}
                                  username={selectedUser.username}
                                  size="xs"
                                />
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[75%] px-3.5 py-2 text-[14px] leading-[1.45] transition ${
                              isMine
                                ? `bg-bone-50 text-ink-900 shadow-[0_1px_0_rgba(0,0,0,0.2)] ${
                                    msg.pending ? 'opacity-60' : ''
                                  }`
                                : 'border border-white/[0.06] bg-white/[0.04] text-ink-50'
                            } ${
                              isMine
                                ? grouped
                                  ? 'rounded-2xl rounded-br-md'
                                  : 'rounded-2xl rounded-br-sm'
                                : grouped
                                ? 'rounded-2xl rounded-bl-md'
                                : 'rounded-2xl rounded-bl-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {!grouped && (
                              <p
                                className={`mt-1 text-[10.5px] ${
                                  isMine ? 'text-ink-700/70' : 'text-faint'
                                }`}
                              >
                                {msg.pending ? 'Sending…' : formatTime(msg.createdAt)}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 px-6 py-4 hairline-t"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedUser.username}`}
                  className="input-field h-11 rounded-full bg-white/[0.04] px-5 text-[14px]"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bone-50 text-ink-900 transition hover:bg-white disabled:opacity-40"
                >
                  <HiPaperAirplane className="h-4 w-4 rotate-90" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="max-w-md text-center px-6">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08]">
                  <span className="text-[24px] text-mute">◐</span>
                </div>
                <p className="eyebrow">No thread selected</p>
                <h2 className="display mt-3 text-[40px] leading-[0.95] text-ink-50">
                  Pick a conversation
                </h2>
                <p className="mt-3 text-[13.5px] text-mute">
                  Or{' '}
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="text-ember-300 underline-offset-4 hover:underline"
                  >
                    start a new thread
                  </button>{' '}
                  with someone in your circle.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <NewThreadPicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setPickerQuery('');
        }}
        friends={friendsForPicker}
        query={pickerQuery}
        onQueryChange={setPickerQuery}
        onSelect={(friend) => {
          openThread(friend);
          setPickerOpen(false);
          setPickerQuery('');
        }}
      />
    </div>
  );
}

function NewThreadPicker({ open, onClose, friends, query, onQueryChange, onSelect }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/65 backdrop-blur-md px-4 pt-20 sm:items-center sm:pt-0"
          onMouseDown={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] overflow-hidden rounded-xl border border-white/[0.08] bg-graphite-100 shadow-lift"
          >
            <div className="flex items-center justify-between px-5 py-3.5 hairline-b">
              <div className="flex items-center gap-3">
                <span className="eyebrow">New thread</span>
                <span className="h-1 w-1 rounded-full bg-white/15" />
                <span className="text-[13px] text-mute">Pick someone</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-ink-300 hover:bg-white/[0.05] hover:text-ink-50"
              >
                <HiOutlineX className="h-4 w-4" />
              </button>
            </div>

            <div className="relative px-5 py-3 hairline-b">
              <HiOutlineSearch
                className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
                strokeWidth={1.6}
              />
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search friends..."
                autoFocus
                className="input-bare h-9 w-full pl-7 text-[14px] placeholder:text-ink-400"
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {friends.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="eyebrow">No one</p>
                  <p className="mt-3 text-[13.5px] text-mute">
                    {query
                      ? `No friends matching "${query}"`
                      : 'Add a friend first to start a thread.'}
                  </p>
                </div>
              ) : (
                friends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onSelect(f)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-white/[0.025]"
                  >
                    <Avatar src={f.avatar} username={f.username} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-ink-50">
                        {f.username}
                      </p>
                      {f.bio && (
                        <p className="truncate text-[12px] text-mute">
                          {f.bio}
                        </p>
                      )}
                    </div>
                    <span className="text-[12px] text-faint">→</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

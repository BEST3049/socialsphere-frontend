function Bar({ className = '' }) {
  return (
    <div
      className={`rounded-[4px] bg-gradient-to-r from-white/[0.04] via-white/[0.07] to-white/[0.04] bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  );
}

export function PostSkeleton() {
  return (
    <article className="px-4 py-6 sm:px-6 hairline-b">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-white/[0.05]" />
        <div className="space-y-1.5">
          <Bar className="h-2.5 w-24" />
          <Bar className="h-2 w-16" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Bar className="h-3 w-full" />
        <Bar className="h-3 w-4/5" />
      </div>
      <Bar className="mt-5 h-72 w-full rounded-lg" />
    </article>
  );
}

export function UserSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-md bg-white/[0.05]" />
      <div className="flex-1 space-y-1.5">
        <Bar className="h-2.5 w-28" />
        <Bar className="h-2 w-40" />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <Bar
            className={`h-9 ${i % 2 === 0 ? 'w-40' : 'w-56'} rounded-2xl`}
          />
        </div>
      ))}
    </div>
  );
}

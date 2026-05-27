import { motion } from 'framer-motion';

export default function EmptyState({
  eyebrow = 'Nothing here',
  title,
  description,
  action,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`px-6 py-16 text-center ${className}`}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="display mt-3 text-[34px] leading-[1.05] text-ink-50">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-mute">
          {description}
        </p>
      )}
      {action && <div className="mt-7">{action}</div>}
    </motion.div>
  );
}

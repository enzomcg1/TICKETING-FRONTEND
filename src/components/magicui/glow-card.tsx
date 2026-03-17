import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowCard({ children, className }: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-[28px] border border-white/10 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:bg-slate-950/70',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_48%)] opacity-70" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

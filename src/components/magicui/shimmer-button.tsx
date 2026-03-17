import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function ShimmerButton({
  children,
  className,
  disabled,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-rose-300/40 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(15,23,42,0.28)] transition duration-300',
        'before:absolute before:inset-y-0 before:left-[-120%] before:w-24 before:rotate-[22deg] before:bg-white/25 before:blur-xl before:transition before:duration-700 hover:before:left-[120%]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span className="absolute inset-0 bg-[linear-gradient(120deg,#ef4444,#f97316,#0f172a)] opacity-95" />
      <span className="absolute inset-[1px] rounded-full bg-[linear-gradient(120deg,#18181b,#111827)]" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

import { cn } from '@/lib/utils';

interface AnimatedGridPatternProps {
  className?: string;
}

export function AnimatedGridPattern({ className }: AnimatedGridPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(circle_at_center,white,transparent_72%)]',
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="magic-grid-aurora absolute left-[-12%] top-[-20%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(255,97,97,0.28),transparent_62%)]" />
      <div className="magic-grid-aurora absolute bottom-[-26%] right-[-10%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(255,199,107,0.24),transparent_62%)] [animation-delay:-6s]" />
    </div>
  );
}

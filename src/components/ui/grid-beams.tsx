'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface GridBeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

const GridBeams = React.forwardRef<HTMLDivElement, GridBeamsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative h-full w-full overflow-hidden bg-background', className)}
        {...props}
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Animated Beams */}
        <div className="absolute inset-0">
          {/* Beam 1 */}
          <div className="absolute -top-40 -left-40 h-80 w-80 animate-beam-pulse rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />

          {/* Beam 2 */}
          <div className="absolute -top-40 -right-40 h-80 w-80 animate-beam-pulse rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl [animation-delay:1s]" />

          {/* Beam 3 */}
          <div className="absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 animate-beam-pulse rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl [animation-delay:2s]" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    );
  }
);

GridBeams.displayName = 'GridBeams';

export { GridBeams };

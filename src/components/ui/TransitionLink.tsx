'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import { useViewTransition } from '@/hooks/useViewTransition';

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  ({ children, className, ...props }, ref) => {
    const { navigate } = useViewTransition();

    return (
      <Link
        ref={ref}
        className={className}
        {...props}
        onClick={(e) => {
          e.preventDefault();
          navigate(props.href.toString());
        }}
      >
        {children}
      </Link>
    );
  }
);

TransitionLink.displayName = 'TransitionLink';

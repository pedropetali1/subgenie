import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-[80px] w-full rounded-input border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const variants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100',
        outline: 'border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950',
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
        destructive: 'bg-rose-600 text-white hover:bg-rose-700'
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5'
      }
    },
    defaultVariants: { variant: 'default', size: 'md' }
  }
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(variants({ variant, size }), className)} {...props} />;
}

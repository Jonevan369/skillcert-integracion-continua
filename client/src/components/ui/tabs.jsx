import React from 'react';
import { cn } from '../../lib/utils.js';

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-semibold text-slate-600 transition',
            value === tab.value && 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

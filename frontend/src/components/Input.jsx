import { forwardRef } from 'react';

import { cn } from '../utils/cn';

export const Input = forwardRef(
  (
    {
      className,
      label,
      error,
      as = 'input',
      type = 'text',
      helper,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const Component = as;

    return (
      <label className={cn('flex w-full flex-col gap-2', containerClassName)}>
        {label ? <span className="text-sm font-medium text-ink">{label}</span> : null}
        <Component
          ref={ref}
          type={as === 'input' ? type : undefined}
          className={cn(
            'brand-input w-full rounded-2xl border border-stroke bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/70',
            as === 'textarea' ? 'min-h-[140px] resize-y' : '',
            className
          )}
          {...props}
        />
        {error ? <span className="text-sm text-danger">{error}</span> : null}
        {!error && helper ? <span className="text-sm text-muted">{helper}</span> : null}
      </label>
    );
  }
);

Input.displayName = 'Input';

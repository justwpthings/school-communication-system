import { cn } from '../utils/cn';

const variants = {
  primary: 'text-white shadow-soft hover:scale-[1.01] hover:brightness-95',
  secondary: 'hover:scale-[1.01]',
  ghost: 'bg-transparent hover:bg-black/5',
  danger: 'bg-danger text-white hover:bg-[#d83a41] hover:scale-[1.01]'
};

const variantStyles = {
  primary: {
    backgroundColor: 'var(--primary-color)',
    boxShadow: '0 10px 30px rgba(var(--primary-color-rgb), 0.22)'
  },
  secondary: {
    backgroundColor: 'rgba(var(--primary-color-rgb), 0.08)',
    color: 'var(--primary-color)',
    border: '1px solid rgba(var(--primary-color-rgb), 0.12)'
  },
  ghost: {
    color: 'var(--primary-color)'
  }
};

export const Button = ({
  className,
  variant = 'primary',
  type = 'button',
  children,
  disabled,
  style,
  ...props
}) => (
  <button
    type={type}
    disabled={disabled}
    className={cn(
      'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
      variants[variant],
      className
    )}
    style={{
      ...(variantStyles[variant] || {}),
      ...style
    }}
    {...props}
  >
    {children}
  </button>
);

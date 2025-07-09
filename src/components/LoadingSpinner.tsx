'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'gray' | 'white';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'accent', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    accent: 'border-accent-blue',
    gray: 'border-border-primary',
    white: 'border-text-primary'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-2 border-t-transparent 
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
} 
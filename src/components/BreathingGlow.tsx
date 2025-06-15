'use client';

import { motion } from 'framer-motion';

interface BreathingGlowProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'green' | 'pink' | 'white';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export default function BreathingGlow({ 
  size = 'md', 
  color = 'blue', 
  intensity = 'medium',
  className = '' 
}: BreathingGlowProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  const colorClasses = {
    blue: {
      primary: 'bg-blue-500',
      secondary: 'bg-blue-400',
      glow: 'shadow-blue-500/50'
    },
    purple: {
      primary: 'bg-purple-500',
      secondary: 'bg-purple-400',
      glow: 'shadow-purple-500/50'
    },
    green: {
      primary: 'bg-green-500',
      secondary: 'bg-green-400',
      glow: 'shadow-green-500/50'
    },
    pink: {
      primary: 'bg-pink-500',
      secondary: 'bg-pink-400',
      glow: 'shadow-pink-500/50'
    },
    white: {
      primary: 'bg-white',
      secondary: 'bg-gray-200',
      glow: 'shadow-white/50'
    }
  };

  const intensitySettings = {
    low: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      blur: [0, 2, 0],
      shadowSize: [10, 20, 10]
    },
    medium: {
      scale: [1, 1.2, 1],
      opacity: [0.4, 0.8, 0.4],
      blur: [0, 4, 0],
      shadowSize: [15, 30, 15]
    },
    high: {
      scale: [1, 1.3, 1],
      opacity: [0.5, 1, 0.5],
      blur: [0, 6, 0],
      shadowSize: [20, 40, 20]
    }
  };

  const settings = intensitySettings[intensity];
  const colors = colorClasses[color];

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow ring */}
      <motion.div
        className={`absolute ${sizeClasses[size]} rounded-full ${colors.primary} ${colors.glow}`}
        animate={{
          scale: settings.scale,
          opacity: settings.opacity,
          filter: settings.blur.map(b => `blur(${b}px)`),
          boxShadow: settings.shadowSize.map(s => `0 0 ${s}px ${s/2}px currentColor`)
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: `radial-gradient(circle, ${color === 'white' ? 'rgba(255,255,255,0.8)' : `var(--${color}-500)`} 0%, transparent 70%)`
        }}
      />
      
      {/* Middle ring */}
      <motion.div
        className={`absolute rounded-full ${colors.secondary}`}
        style={{
          width: `${size === 'sm' ? '12' : size === 'md' ? '18' : size === 'lg' ? '24' : '36'}px`,
          height: `${size === 'sm' ? '12' : size === 'md' ? '18' : size === 'lg' ? '24' : '36'}px`
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      
      {/* Inner core */}
      <motion.div
        className={`absolute rounded-full ${colors.primary}`}
        style={{
          width: `${size === 'sm' ? '8' : size === 'md' ? '12' : size === 'lg' ? '16' : '24'}px`,
          height: `${size === 'sm' ? '8' : size === 'md' ? '12' : size === 'lg' ? '16' : '24'}px`
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Pulse waves */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute ${sizeClasses[size]} rounded-full border-2 ${color === 'white' ? 'border-white' : `border-${color}-400`}`}
          animate={{
            scale: [1, 2, 1],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 1.3
          }}
        />
      ))}
    </div>
  );
} 
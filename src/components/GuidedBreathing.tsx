'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiSquare, FiWind } from 'react-icons/fi';

interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdEmpty?: number;
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: '4-7-8 Relaxation',
    description: 'Perfect for stress relief and falling asleep',
    inhale: 4,
    hold: 7,
    exhale: 8
  },
  {
    name: 'Box Breathing',
    description: 'Used by Navy SEALs for focus and calm',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdEmpty: 4
  },
  {
    name: 'Equal Breathing',
    description: 'Simple and effective for daily practice',
    inhale: 4,
    hold: 0,
    exhale: 4
  },
  {
    name: 'Energizing Breath',
    description: 'Quick inhale, slow exhale for energy boost',
    inhale: 2,
    hold: 1,
    exhale: 6
  }
];

const durations = [
  { label: '1 min', value: 1 },
  { label: '3 min', value: 3 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 }
];

export default function GuidedBreathing() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0]);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start breathing session
  const startSession = () => {
    const totalSeconds = selectedDuration * 60;
    setTotalTimeLeft(totalSeconds);
    setPhaseTimeLeft(selectedPattern.inhale);
    setCurrentPhase('inhale');
    setCycleCount(0);
    setIsActive(true);
  };

  // Stop breathing session
  const stopSession = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setPhaseTimeLeft(0);
    setTotalTimeLeft(0);
    setCycleCount(0);
    setCurrentPhase('inhale');
  };

  // Pause/Resume session
  const togglePause = () => {
    setIsActive(!isActive);
  };

  // Main breathing timer effect
  useEffect(() => {
    if (isActive && totalTimeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTotalTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });

        setPhaseTimeLeft(prev => {
          if (prev <= 1) {
            // Move to next phase
            let nextPhase: 'inhale' | 'hold' | 'exhale' | 'holdEmpty' = 'inhale';
            let nextDuration = selectedPattern.inhale;

            switch (currentPhase) {
              case 'inhale':
                if (selectedPattern.hold > 0) {
                  nextPhase = 'hold';
                  nextDuration = selectedPattern.hold;
                } else {
                  nextPhase = 'exhale';
                  nextDuration = selectedPattern.exhale;
                }
                break;
              case 'hold':
                nextPhase = 'exhale';
                nextDuration = selectedPattern.exhale;
                break;
              case 'exhale':
                if (selectedPattern.holdEmpty && selectedPattern.holdEmpty > 0) {
                  nextPhase = 'holdEmpty';
                  nextDuration = selectedPattern.holdEmpty;
                } else {
                  nextPhase = 'inhale';
                  nextDuration = selectedPattern.inhale;
                  setCycleCount(c => c + 1);
                }
                break;
              case 'holdEmpty':
                nextPhase = 'inhale';
                nextDuration = selectedPattern.inhale;
                setCycleCount(c => c + 1);
                break;
            }

            setCurrentPhase(nextPhase);
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, totalTimeLeft, currentPhase, selectedPattern]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get breathing animation properties
  const getBreathingAnimation = () => {
    const progress = 1 - (phaseTimeLeft / (
      currentPhase === 'inhale' ? selectedPattern.inhale :
      currentPhase === 'hold' ? selectedPattern.hold :
      currentPhase === 'exhale' ? selectedPattern.exhale :
      selectedPattern.holdEmpty || 1
    ));

    switch (currentPhase) {
      case 'inhale':
        return { scale: 0.8 + (0.4 * progress) }; // Grow from 0.8 to 1.2
      case 'exhale':
        return { scale: 1.2 - (0.4 * progress) }; // Shrink from 1.2 to 0.8
      default:
        return { scale: currentPhase === 'hold' ? 1.2 : 0.8 };
    }
  };

  const breathingAnim = getBreathingAnimation();

  return (
    <div className="text-text-primary">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <FiWind className="text-2xl text-text-secondary mr-2" />
            <h1 className="text-xl font-bold">Guided Breathing</h1>
          </div>
          <p className="text-text-tertiary text-sm">
            Practice mindful breathing to reduce stress and improve focus
          </p>
        </div>

        {!isActive && totalTimeLeft === 0 ? (
          /* Settings View */
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Pattern Selection */}
            <div>
              <h2 className="text-base font-semibold mb-3 text-text-secondary">Choose Pattern</h2>
              <div className="space-y-2">
                {breathingPatterns.map((pattern) => (
                  <motion.div
                    key={pattern.name}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPattern.name === pattern.name
                        ? 'border-border-secondary bg-bg-tertiary'
                        : 'border-border-primary hover:border-border-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-text-primary mb-1">{pattern.name}</h3>
                        <p className="text-text-secondary text-sm mb-2">{pattern.description}</p>
                        <div className="text-xs text-text-tertiary">
                          {pattern.inhale}s in
                          {pattern.hold > 0 && ` • ${pattern.hold}s hold`}
                          • {pattern.exhale}s out
                          {pattern.holdEmpty && ` • ${pattern.holdEmpty}s hold`}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPattern.name === pattern.name
                          ? 'border-text-primary'
                          : 'border-border-primary'
                      }`}>
                        {selectedPattern.name === pattern.name && (
                          <div className="w-2.5 h-2.5 rounded-full bg-text-primary" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <h2 className="text-base font-semibold mb-3 text-text-secondary">Duration</h2>
              <div className="flex gap-2">
                {durations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedDuration === duration.value
                        ? 'bg-accent-blue text-text-primary'
                        : 'bg-bg-tertiary text-text-secondary hover:bg-hover-bg'
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startSession}
                className="w-full bg-accent-blue text-text-primary font-bold py-3 px-6 rounded-lg flex items-center justify-center text-lg hover:bg-accent-blue-hover transition-colors"
              >
                <FiPlay className="mr-2" />
                Start Session
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Active Session View */
          <motion.div 
            className="flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Breathing Circle */}
              <motion.div
                className="w-full h-full rounded-full bg-bg-tertiary border-4 border-border-primary"
                animate={breathingAnim}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />

              {/* Text Indicators */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-4xl font-bold text-text-primary mb-2">{phaseTimeLeft}s</p>
                <p className="text-lg text-text-secondary capitalize">{currentPhase.replace('holdEmpty', 'hold')}</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-text-secondary">Total time remaining: {formatTime(totalTimeLeft)}</p>
              <p className="text-text-tertiary text-sm mt-1">Cycle: {cycleCount}</p>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={togglePause}
                className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center text-2xl text-text-primary hover:bg-hover-bg transition-colors"
              >
                {isActive ? <FiPause /> : <FiPlay />}
              </button>
              <button
                onClick={stopSession}
                className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center text-2xl text-text-primary hover:bg-hover-bg transition-colors"
              >
                <FiSquare />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 
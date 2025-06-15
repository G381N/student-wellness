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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FiWind className="text-3xl text-white mr-3" />
            <h1 className="text-2xl font-bold">Guided Breathing</h1>
          </div>
          <p className="text-gray-400">
            Practice mindful breathing to reduce stress and improve focus
          </p>
        </div>

        {!isActive && totalTimeLeft === 0 ? (
          /* Settings View */
          <div className="space-y-8">
            {/* Pattern Selection */}
            <div>
              <h2 className="text-lg font-medium mb-4 text-white">Choose Pattern</h2>
              <div className="space-y-3">
                {breathingPatterns.map((pattern) => (
                  <motion.div
                    key={pattern.name}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPattern.name === pattern.name
                        ? 'border-white bg-white bg-opacity-5'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white mb-1">{pattern.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{pattern.description}</p>
                        <div className="text-xs text-gray-500">
                          {pattern.inhale}s in
                          {pattern.hold > 0 && ` • ${pattern.hold}s hold`}
                          • {pattern.exhale}s out
                          {pattern.holdEmpty && ` • ${pattern.holdEmpty}s hold`}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPattern.name === pattern.name
                          ? 'border-white bg-white'
                          : 'border-gray-600'
                      }`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <h2 className="text-lg font-medium mb-4 text-white">Duration</h2>
              <div className="flex gap-3">
                {durations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDuration === duration.value
                        ? 'bg-white text-black'
                        : 'border border-gray-600 text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startSession}
                className="bg-white hover:bg-gray-200 text-black font-medium py-3 px-8 rounded-full flex items-center mx-auto transition-all"
              >
                <FiPlay className="mr-2" />
                Start Session
              </motion.button>
            </div>
          </div>
        ) : (
          /* Active Session View */
          <div className="text-center space-y-8">
            {/* Session Info */}
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-2 text-white">{selectedPattern.name}</h2>
              <div className="text-gray-400 text-sm">
                <p>Cycle {cycleCount + 1} • {formatTime(totalTimeLeft)} remaining</p>
              </div>
            </div>

            {/* Minimal Breathing Visualization */}
            <div className="flex justify-center mb-12">
              <motion.div
                animate={{
                  scale: breathingAnim.scale,
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut"
                }}
                className="w-32 h-32 rounded-full border-2 border-white border-opacity-30 flex items-center justify-center relative"
              >
                {/* Inner circle */}
                <div className="w-20 h-20 rounded-full border border-white border-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-lg font-medium mb-1 capitalize">
                      {currentPhase === 'holdEmpty' ? 'Hold' : currentPhase}
                    </div>
                    <div className="text-2xl font-bold">{phaseTimeLeft}</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Phase indicator */}
            <div className="flex justify-center space-x-2 mb-8">
              {['inhale', 'hold', 'exhale', selectedPattern.holdEmpty ? 'holdEmpty' : null].filter(Boolean).map((phase) => (
                <div
                  key={phase}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentPhase === phase
                      ? 'bg-white'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePause}
                className="border border-gray-600 hover:border-white text-white p-3 rounded-full transition-all"
              >
                {isActive ? <FiPause className="text-lg" /> : <FiPlay className="text-lg" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopSession}
                className="border border-gray-600 hover:border-white text-white p-3 rounded-full transition-all"
              >
                <FiSquare className="text-lg" />
              </motion.button>
            </div>

            {/* Simple instruction */}
            <div className="text-gray-400 text-sm">
              <p>Follow the circle and breathe with the rhythm</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
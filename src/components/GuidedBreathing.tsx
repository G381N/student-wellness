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

  const getPhaseStyles = () => {
    switch(currentPhase) {
      case 'inhale': return { color: '#FFFFFF', shadow: 'shadow-white' };
      case 'hold': return { color: '#A0AEC0', shadow: 'shadow-gray-400' };
      case 'exhale': return { color: '#718096', shadow: 'shadow-gray-600' };
      case 'holdEmpty': return { color: '#4A5568', shadow: 'shadow-gray-800' };
      default: return { color: '#FFFFFF', shadow: 'shadow-white' };
    }
  };

  const breathingAnim = getBreathingAnimation();
  const phaseStyles = getPhaseStyles();

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <FiWind className="text-2xl text-gray-300 mr-3" />
            <h1 className="text-xl font-bold">Guided Breathing</h1>
          </div>
          <p className="text-gray-400 text-sm">
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
              <h2 className="text-base font-medium mb-3 text-gray-300">Choose Pattern</h2>
              <div className="space-y-2">
                {breathingPatterns.map((pattern) => (
                  <motion.div
                    key={pattern.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPattern.name === pattern.name
                        ? 'border-gray-400 bg-gray-800'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-white mb-1">{pattern.name}</h3>
                        <p className="text-gray-400 text-xs mb-2">{pattern.description}</p>
                        <div className="text-xs text-gray-500">
                          {pattern.inhale}s in
                          {pattern.hold > 0 && ` • ${pattern.hold}s hold`}
                          • {pattern.exhale}s out
                          {pattern.holdEmpty && ` • ${pattern.holdEmpty}s hold`}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPattern.name === pattern.name
                          ? 'border-white bg-white'
                          : 'border-gray-600'
                      }`}>
                        {selectedPattern.name === pattern.name && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <h2 className="text-base font-medium mb-3 text-gray-300">Duration</h2>
              <div className="flex gap-2">
                {durations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      selectedDuration === duration.value
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg flex items-center justify-center text-lg gap-3"
            >
              <FiPlay />
              <span>Start Session</span>
            </motion.button>
          </motion.div>
        ) : (
          /* Active Session View */
          <div className="flex flex-col items-center justify-center h-[500px]">
            <motion.div
              className="relative w-64 h-64 flex items-center justify-center"
              animate={breathingAnim}
              transition={{ type: 'spring', stiffness: 20, damping: 10 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 40px 10px ${phaseStyles.color}`,
                  background: `radial-gradient(circle, ${phaseStyles.color} 0%, rgba(0,0,0,0) 70%)`,
                }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: selectedPattern.inhale + selectedPattern.exhale, repeat: Infinity }}
              />
              <div className="w-56 h-56 bg-gray-900 rounded-full border-4 border-gray-700" />
            </motion.div>
            
            <div className="text-center mt-12">
              <motion.h2 
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-semibold capitalize mb-2"
                style={{ color: phaseStyles.color }}
              >
                {currentPhase === 'holdEmpty' ? 'Hold' : currentPhase}
              </motion.h2>
              <p className="text-5xl font-mono text-white">{phaseTimeLeft}</p>
            </div>
            
            <div className="w-full mt-12">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Cycle: {cycleCount + 1}</span>
                <span>Total Time: {formatTime(totalTimeLeft)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-white h-2 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(totalTimeLeft / (selectedDuration * 60)) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <button onClick={togglePause} className="text-gray-300 hover:text-white transition-colors p-3 bg-gray-800 rounded-full">
                {isActive ? <FiPause size={24} /> : <FiPlay size={24} />}
              </button>
              <button onClick={stopSession} className="text-gray-300 hover:text-white transition-colors p-4 bg-gray-800 hover:bg-gray-700 rounded-full">
                <FiSquare size={28} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
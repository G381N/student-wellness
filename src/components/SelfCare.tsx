'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiSquare, FiSun } from 'react-icons/fi';

interface BreathingSession {
  duration: number; // in minutes
  breathsPerMinute: number;
  inhaleTime: number; // in seconds
  exhaleTime: number; // in seconds
  holdTime: number; // in seconds
}

const breathingSessions: BreathingSession[] = [
  { duration: 1, breathsPerMinute: 6, inhaleTime: 4, exhaleTime: 6, holdTime: 2 },
  { duration: 3, breathsPerMinute: 6, inhaleTime: 4, exhaleTime: 6, holdTime: 2 },
  { duration: 5, breathsPerMinute: 6, inhaleTime: 4, exhaleTime: 6, holdTime: 2 },
  { duration: 10, breathsPerMinute: 6, inhaleTime: 4, exhaleTime: 6, holdTime: 2 },
];

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export default function SelfCare() {
  const [selectedSession, setSelectedSession] = useState<BreathingSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [breathCount, setBreathCount] = useState(0);

  // Reset session
  const resetSession = () => {
    setIsActive(false);
    setTimeRemaining(0);
    setCurrentPhase('inhale');
    setPhaseTimeRemaining(0);
    setBreathCount(0);
  };

  // Start session
  const startSession = (session: BreathingSession) => {
    setSelectedSession(session);
    setTimeRemaining(session.duration * 60);
    setPhaseTimeRemaining(session.inhaleTime);
    setCurrentPhase('inhale');
    setIsActive(true);
    setBreathCount(0);
  };

  // Toggle pause/resume
  const toggleSession = () => {
    setIsActive(!isActive);
  };

  // Stop session
  const stopSession = () => {
    resetSession();
    setSelectedSession(null);
  };

  // Main timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && selectedSession && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });

        setPhaseTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next phase
            switch (currentPhase) {
              case 'inhale':
                setCurrentPhase('hold');
                return selectedSession.holdTime;
              case 'hold':
                setCurrentPhase('exhale');
                return selectedSession.exhaleTime;
              case 'exhale':
                setCurrentPhase('pause');
                setBreathCount((count) => count + 1);
                return 1; // Short pause
              case 'pause':
                setCurrentPhase('inhale');
                return selectedSession.inhaleTime;
              default:
                return prev;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, selectedSession, timeRemaining, currentPhase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'pause':
        return 'Pause';
      default:
        return '';
    }
  };

  const getCircleScale = () => {
    switch (currentPhase) {
      case 'inhale':
        return 1.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 0.8;
      case 'pause':
        return 0.8;
      default:
        return 1;
    }
  };

  const getCircleColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'bg-blue-500';
      case 'hold':
        return 'bg-purple-500';
      case 'exhale':
        return 'bg-green-500';
      case 'pause':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FiSun className="text-yellow-500 text-3xl mr-3" />
          <h1 className="text-3xl font-bold text-white">Self Care</h1>
        </div>
        <p className="text-gray-400 text-lg">Take a moment to breathe and relax</p>
      </div>

      {!selectedSession ? (
        /* Session Selection */
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Breathing Exercise</h2>
          <div className="grid grid-cols-2 gap-4">
            {breathingSessions.map((session) => (
              <motion.button
                key={session.duration}
                onClick={() => startSession(session)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:bg-gray-800 transition-all group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{session.duration}</div>
                  <div className="text-lg text-gray-300 mb-3">minute{session.duration > 1 ? 's' : ''}</div>
                  <div className="text-sm text-gray-400">
                    {session.inhaleTime}s in • {session.holdTime}s hold • {session.exhaleTime}s out
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        /* Active Session */
        <div className="max-w-2xl mx-auto text-center">
          {/* Timer Display */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-white mb-2">{formatTime(timeRemaining)}</div>
            <div className="text-xl text-gray-400">
              Breath {breathCount} • {selectedSession.duration} minute session
            </div>
          </div>

          {/* Breathing Circle */}
          <div className="mb-8 flex justify-center">
            <motion.div
              className={`w-32 h-32 rounded-full ${getCircleColor()} flex items-center justify-center`}
              animate={{
                scale: getCircleScale(),
              }}
              transition={{
                duration: currentPhase === 'inhale' ? selectedSession.inhaleTime : 
                        currentPhase === 'hold' ? selectedSession.holdTime :
                        currentPhase === 'exhale' ? selectedSession.exhaleTime : 1,
                ease: 'easeInOut',
              }}
            >
              <div className="text-white font-bold text-lg">{getPhaseText()}</div>
            </motion.div>
          </div>

          {/* Phase Instructions */}
          <div className="mb-8">
            <div className="text-2xl font-bold text-white mb-2">{getPhaseText()}</div>
            <div className="text-lg text-gray-400">{phaseTimeRemaining}s remaining</div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleSession}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full transition-colors"
            >
              {isActive ? <FiPause size={24} /> : <FiPlay size={24} />}
            </button>
            <button
              onClick={stopSession}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
            >
              <FiSquare size={24} />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="bg-gray-800 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${((selectedSession.duration * 60 - timeRemaining) / (selectedSession.duration * 60)) * 100}%`,
                }}
              ></div>
            </div>
            <div className="text-sm text-gray-400">
              {Math.round(((selectedSession.duration * 60 - timeRemaining) / (selectedSession.duration * 60)) * 100)}% complete
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      {!selectedSession && (
        <div className="max-w-2xl mx-auto mt-12 bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">Benefits of Breathing Exercises</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Reduces stress and anxiety</li>
            <li>• Improves focus and concentration</li>
            <li>• Helps regulate emotions</li>
            <li>• Promotes better sleep</li>
            <li>• Lowers blood pressure</li>
            <li>• Enhances overall well-being</li>
          </ul>
        </div>
      )}
    </div>
  );
} 
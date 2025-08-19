'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiSun, FiMoon, FiActivity, FiBookOpen, FiMusic } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import GuidedBreathing from '@/components/GuidedBreathing';

export default function WellnessPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('breathing');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-text-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary text-lg">Loading wellness center...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const wellnessTools = [
    {
      id: 'breathing',
      title: 'Guided Breathing',
      icon: FiHeart,
      description: 'Calm your mind with breathing exercises',
      component: <GuidedBreathing />
    },
    {
      id: 'meditation',
      title: 'Meditation',
      icon: FiSun,
      description: 'Find inner peace with meditation',
      component: (
        <div className="space-y-6">
          {/* Daily Meditation Quote */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-bg-tertiary dark:to-bg-secondary p-6 rounded-xl border-l-4 border-yellow-400">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💭</span>
              <div>
                <p className="text-text-primary italic text-lg leading-relaxed mb-2">
                  "Peace comes from within. Do not seek it without."
                </p>
                <p className="text-text-secondary text-sm font-medium">— Buddha</p>
              </div>
            </div>
          </div>

          {/* Meditation Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-tertiary p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">🧠</span>
                <h4 className="font-semibold text-text-primary">Mental Benefits</h4>
              </div>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li>• Reduces stress and anxiety</li>
                <li>• Improves focus and concentration</li>
                <li>• Enhances emotional well-being</li>
                <li>• Increases self-awareness</li>
              </ul>
            </div>
            <div className="bg-bg-tertiary p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">❤️</span>
                <h4 className="font-semibold text-text-primary">Physical Benefits</h4>
              </div>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li>• Lowers blood pressure</li>
                <li>• Improves sleep quality</li>
                <li>• Boosts immune system</li>
                <li>• Reduces chronic pain</li>
              </ul>
            </div>
          </div>

          {/* Meditation Tips */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">💡</span>
              <h4 className="font-semibold text-text-primary">Daily Meditation Tips</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-500 mt-1">✨</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Start Small:</strong> Begin with just 5 minutes daily</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-500 mt-1">🌅</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Morning Practice:</strong> Meditate right after waking up</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-500 mt-1">🪑</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Comfortable Space:</strong> Find a quiet, comfortable spot</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">🎯</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Focus on Breath:</strong> Use breathing as your anchor</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">🧘</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Be Patient:</strong> Don't judge your thoughts</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">📅</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Consistency:</strong> Practice daily for best results</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Breathing Exercise */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-bg-tertiary dark:to-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">🌬️</span>
              <h4 className="font-semibold text-text-primary">4-7-8 Breathing Technique</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">4</div>
                <p className="text-text-secondary text-sm">Inhale for 4 seconds</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">7</div>
                <p className="text-text-secondary text-sm">Hold for 7 seconds</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">8</div>
                <p className="text-text-secondary text-sm">Exhale for 8 seconds</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sleep',
      title: 'Sleep Wellness',
      icon: FiMoon,
      description: 'Improve your sleep quality',
      component: (
        <div className="space-y-6">
          {/* Sleep Quote */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-bg-tertiary dark:to-bg-secondary p-6 rounded-xl border-l-4 border-blue-400">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💤</span>
              <div>
                <p className="text-text-primary italic text-lg leading-relaxed mb-2">
                  "Sleep is the golden chain that ties health and our bodies together."
                </p>
                <p className="text-text-secondary text-sm font-medium">— Thomas Dekker</p>
              </div>
            </div>
          </div>

          {/* Sleep Hygiene Tips */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🛏️</span>
              <h4 className="font-semibold text-text-primary">Essential Sleep Hygiene Tips</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1">🕘</span>
                  <div>
                    <p className="text-text-primary font-medium">Consistent Sleep Schedule</p>
                    <p className="text-text-secondary text-sm">Go to bed and wake up at the same time daily</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1">🌡️</span>
                  <div>
                    <p className="text-text-primary font-medium">Cool Environment</p>
                    <p className="text-text-secondary text-sm">Keep bedroom temperature between 60-67°F</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 mt-1">🌑</span>
                  <div>
                    <p className="text-text-primary font-medium">Dark Room</p>
                    <p className="text-text-secondary text-sm">Use blackout curtains or eye masks</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">📱</span>
                  <div>
                    <p className="text-text-primary font-medium">No Screens Before Bed</p>
                    <p className="text-text-secondary text-sm">Avoid devices 1 hour before sleep</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">☕</span>
                  <div>
                    <p className="text-text-primary font-medium">Limit Caffeine</p>
                    <p className="text-text-secondary text-sm">No caffeine 6 hours before bedtime</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">🧘</span>
                  <div>
                    <p className="text-text-primary font-medium">Relaxation Routine</p>
                    <p className="text-text-secondary text-sm">Create a calming pre-sleep ritual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sleep Quality Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-bg-tertiary p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">💪</div>
              <h5 className="font-semibold text-text-primary mb-1">Good Sleep Signs</h5>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• Fall asleep in 15-20 min</li>
                <li>• Sleep 7-9 hours</li>
                <li>• Wake up refreshed</li>
              </ul>
            </div>
            <div className="bg-bg-tertiary p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <h5 className="font-semibold text-text-primary mb-1">Warning Signs</h5>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• Trouble falling asleep</li>
                <li>• Frequent night waking</li>
                <li>• Morning fatigue</li>
              </ul>
            </div>
            <div className="bg-bg-tertiary p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h5 className="font-semibold text-text-primary mb-1">Sleep Goals</h5>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• 7-9 hours nightly</li>
                <li>• Same sleep schedule</li>
                <li>• Quality over quantity</li>
              </ul>
            </div>
          </div>

          {/* Natural Sleep Aids */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-bg-tertiary dark:to-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">🌿</span>
              <h4 className="font-semibold text-text-primary">Natural Sleep Enhancers</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg">
                <div className="text-2xl mb-1">🍵</div>
                <p className="text-text-primary font-medium text-sm">Chamomile Tea</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg">
                <div className="text-2xl mb-1">🛁</div>
                <p className="text-text-primary font-medium text-sm">Warm Bath</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg">
                <div className="text-2xl mb-1">📖</div>
                <p className="text-text-primary font-medium text-sm">Reading</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg">
                <div className="text-2xl mb-1">🎵</div>
                <p className="text-text-primary font-medium text-sm">Soft Music</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'fitness',
      title: 'Fitness Tracker',
      icon: FiActivity,
      description: 'Track your physical wellness',
      component: (
        <div className="space-y-6">
          {/* Fitness Quote */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-bg-tertiary dark:to-bg-secondary p-6 rounded-xl border-l-4 border-green-400">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🏃‍♂️</span>
              <div>
                <p className="text-text-primary italic text-lg leading-relaxed mb-2">
                  "The only bad workout is the one that didn't happen."
                </p>
                <p className="text-text-secondary text-sm font-medium">— Unknown</p>
              </div>
            </div>
          </div>

          {/* Fitness Guidelines */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">📋</span>
              <h4 className="font-semibold text-text-primary">Weekly Exercise Guidelines</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-tertiary p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">❤️</span>
                  <h5 className="font-semibold text-text-primary">Cardiovascular</h5>
                </div>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li>• 150 minutes moderate intensity</li>
                  <li>• OR 75 minutes vigorous intensity</li>
                  <li>• Walking, running, cycling, swimming</li>
                  <li>• Break into 10+ minute sessions</li>
                </ul>
              </div>
              <div className="bg-bg-tertiary p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">🏋️</span>
                  <h5 className="font-semibold text-text-primary">Strength Training</h5>
                </div>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li>• 2+ days per week</li>
                  <li>• All major muscle groups</li>
                  <li>• 8-12 repetitions per exercise</li>
                  <li>• Bodyweight or weights</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Daily Activity Tips */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">⚡</span>
              <h4 className="font-semibold text-text-primary">Stay Active Throughout the Day</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-green-100 dark:bg-bg-tertiary p-4 rounded-xl mb-2">
                  <div className="text-3xl mb-2">🚶</div>
                  <h5 className="font-semibold text-text-primary">Daily Steps</h5>
                  <p className="text-text-secondary text-sm">Aim for 8,000-10,000 steps</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-bg-tertiary p-4 rounded-xl mb-2">
                  <div className="text-3xl mb-2">🪑</div>
                  <h5 className="font-semibold text-text-primary">Break Sitting</h5>
                  <p className="text-text-secondary text-sm">Stand every 30 minutes</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-bg-tertiary p-4 rounded-xl mb-2">
                  <div className="text-3xl mb-2">🚲</div>
                  <h5 className="font-semibold text-text-primary">Active Transport</h5>
                  <p className="text-text-secondary text-sm">Walk or bike when possible</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Exercises */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-bg-tertiary dark:to-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🏃</span>
              <h4 className="font-semibold text-text-primary">Quick Exercises (No Equipment Needed)</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🏃‍♀️</div>
                <p className="text-text-primary font-medium text-sm mb-1">Jumping Jacks</p>
                <p className="text-text-secondary text-xs">30 seconds</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">⬇️</div>
                <p className="text-text-primary font-medium text-sm mb-1">Push-ups</p>
                <p className="text-text-secondary text-xs">10-15 reps</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🦵</div>
                <p className="text-text-primary font-medium text-sm mb-1">Squats</p>
                <p className="text-text-secondary text-xs">15-20 reps</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🧘‍♂️</div>
                <p className="text-text-primary font-medium text-sm mb-1">Plank</p>
                <p className="text-text-secondary text-xs">30-60 seconds</p>
              </div>
            </div>
          </div>

          {/* Health Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-tertiary p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">🧠</span>
                <h5 className="font-semibold text-text-primary">Mental Benefits</h5>
              </div>
              <ul className="space-y-1 text-text-secondary text-sm">
                <li>• Reduces stress and anxiety</li>
                <li>• Improves mood and self-esteem</li>
                <li>• Enhances cognitive function</li>
                <li>• Better sleep quality</li>
              </ul>
            </div>
            <div className="bg-bg-tertiary p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">❤️</span>
                <h5 className="font-semibold text-text-primary">Physical Benefits</h5>
              </div>
              <ul className="space-y-1 text-text-secondary text-sm">
                <li>• Strengthens heart and muscles</li>
                <li>• Improves bone density</li>
                <li>• Boosts immune system</li>
                <li>• Increases energy levels</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'journal',
      title: 'Mood Journal',
      icon: FiBookOpen,
      description: 'Track your emotional wellbeing',
      component: (
        <div className="space-y-6">
          {/* Mood Quote */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-bg-tertiary dark:to-bg-secondary p-6 rounded-xl border-l-4 border-purple-400">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💭</span>
              <div>
                <p className="text-text-primary italic text-lg leading-relaxed mb-2">
                  "Your feelings are valid. Your struggles are real. Your healing is important."
                </p>
                <p className="text-text-secondary text-sm font-medium">— Unknown</p>
              </div>
            </div>
          </div>

          {/* Benefits of Mood Tracking */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🎯</span>
              <h4 className="font-semibold text-text-primary">Why Track Your Mood?</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">🔍</span>
                  <div>
                    <p className="text-text-primary font-medium">Identify Patterns</p>
                    <p className="text-text-secondary text-sm">Recognize what triggers certain emotions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">🧠</span>
                  <div>
                    <p className="text-text-primary font-medium">Increase Awareness</p>
                    <p className="text-text-secondary text-sm">Better understand your emotional responses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">📈</span>
                  <div>
                    <p className="text-text-primary font-medium">Track Progress</p>
                    <p className="text-text-secondary text-sm">See improvements in your mental health</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">💬</span>
                  <div>
                    <p className="text-text-primary font-medium">Improve Communication</p>
                    <p className="text-text-secondary text-sm">Better express feelings to others</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🎯</span>
                  <div>
                    <p className="text-text-primary font-medium">Set Goals</p>
                    <p className="text-text-secondary text-sm">Work towards emotional wellness goals</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🛡️</span>
                  <div>
                    <p className="text-text-primary font-medium">Prevent Relapse</p>
                    <p className="text-text-secondary text-sm">Early warning signs of mental health issues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood Scale Guide */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">📊</span>
              <h4 className="font-semibold text-text-primary">Understanding Your Mood Scale</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="bg-red-100 dark:bg-bg-tertiary p-3 rounded-xl text-center">
                <div className="text-2xl mb-1">😢</div>
                <p className="text-text-primary font-semibold text-sm">Very Low</p>
                <p className="text-text-secondary text-xs">Sad, hopeless, overwhelmed</p>
              </div>
              <div className="bg-orange-100 dark:bg-bg-tertiary p-3 rounded-xl text-center">
                <div className="text-2xl mb-1">😕</div>
                <p className="text-text-primary font-semibold text-sm">Low</p>
                <p className="text-text-secondary text-xs">Down, tired, stressed</p>
              </div>
              <div className="bg-yellow-100 dark:bg-bg-tertiary p-3 rounded-xl text-center">
                <div className="text-2xl mb-1">😐</div>
                <p className="text-text-primary font-semibold text-sm">Neutral</p>
                <p className="text-text-secondary text-xs">Okay, stable, calm</p>
              </div>
              <div className="bg-green-100 dark:bg-bg-tertiary p-3 rounded-xl text-center">
                <div className="text-2xl mb-1">😊</div>
                <p className="text-text-primary font-semibold text-sm">Good</p>
                <p className="text-text-secondary text-xs">Happy, content, positive</p>
              </div>
              <div className="bg-blue-100 dark:bg-bg-tertiary p-3 rounded-xl text-center">
                <div className="text-2xl mb-1">😄</div>
                <p className="text-text-primary font-semibold text-sm">Great</p>
                <p className="text-text-secondary text-xs">Joyful, energetic, amazing</p>
              </div>
            </div>
          </div>

          {/* Journaling Tips */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">✍️</span>
              <h4 className="font-semibold text-text-primary">Effective Journaling Tips</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">🕐</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Same Time Daily:</strong> Establish a consistent routine</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">❤️</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Be Honest:</strong> Write your true feelings without judgment</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">🎯</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Focus on Details:</strong> What, where, when, why you feel this way</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🌟</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Include Gratitude:</strong> Write 3 things you're grateful for</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">📝</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Keep It Simple:</strong> Even a few sentences help</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🔄</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Review Regularly:</strong> Look back to spot patterns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emotional Wellness Activities */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-bg-tertiary dark:to-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🌈</span>
              <h4 className="font-semibold text-text-primary">Mood Boosting Activities</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🚶‍♀️</div>
                <p className="text-text-primary font-medium text-sm">Nature Walk</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🎵</div>
                <p className="text-text-primary font-medium text-sm">Listen to Music</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">📞</div>
                <p className="text-text-primary font-medium text-sm">Call a Friend</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🧘‍♀️</div>
                <p className="text-text-primary font-medium text-sm">Practice Mindfulness</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'music',
      title: 'Relaxing Music',
      icon: FiMusic,
      description: 'Soothing sounds for relaxation',
      component: (
        <div className="space-y-6">
          {/* Music Quote */}
          <div className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-bg-tertiary dark:to-bg-secondary p-6 rounded-xl border-l-4 border-pink-400">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎼</span>
              <div>
                <p className="text-text-primary italic text-lg leading-relaxed mb-2">
                  "Music is the medicine of the mind."
                </p>
                <p className="text-text-secondary text-sm font-medium">— John A. Logan</p>
              </div>
            </div>
          </div>

          {/* Benefits of Music Therapy */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🎯</span>
              <h4 className="font-semibold text-text-primary">Benefits of Relaxing Music</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-bg-tertiary p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">🧠</span>
                  <h5 className="font-semibold text-text-primary">Mental Benefits</h5>
                </div>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li>• Reduces stress and anxiety</li>
                  <li>• Improves focus and concentration</li>
                  <li>• Enhances mood and emotional state</li>
                  <li>• Promotes mindfulness and presence</li>
                </ul>
              </div>
              <div className="bg-bg-tertiary p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">❤️</span>
                  <h5 className="font-semibold text-text-primary">Physical Benefits</h5>
                </div>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li>• Lowers blood pressure</li>
                  <li>• Reduces heart rate</li>
                  <li>• Decreases cortisol levels</li>
                  <li>• Improves sleep quality</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Music Categories for Different Moods */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🎨</span>
              <h4 className="font-semibold text-text-primary">Music for Every Mood</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 dark:bg-bg-tertiary p-4 rounded-xl">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">😌</div>
                  <h5 className="font-semibold text-text-primary">For Relaxation</h5>
                </div>
                <ul className="space-y-1 text-text-secondary text-sm">
                  <li>• Classical piano</li>
                  <li>• Ambient soundscapes</li>
                  <li>• Soft acoustic guitar</li>
                  <li>• Nature sounds</li>
                </ul>
              </div>
              <div className="bg-green-100 dark:bg-bg-tertiary p-4 rounded-xl">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">🎯</div>
                  <h5 className="font-semibold text-text-primary">For Focus</h5>
                </div>
                <ul className="space-y-1 text-text-secondary text-sm">
                  <li>• Lo-fi hip hop</li>
                  <li>• Instrumental music</li>
                  <li>• White noise</li>
                  <li>• Binaural beats</li>
                </ul>
              </div>
              <div className="bg-purple-100 dark:bg-bg-tertiary p-4 rounded-xl">
                <div className="text-center mb-3">
                  <div className="text-2xl mb-2">💤</div>
                  <h5 className="font-semibold text-text-primary">For Sleep</h5>
                </div>
                <ul className="space-y-1 text-text-secondary text-sm">
                  <li>• Delta wave music</li>
                  <li>• Rain sounds</li>
                  <li>• Soft lullabies</li>
                  <li>• Brown noise</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Creating Your Musical Environment */}
          <div className="bg-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🏠</span>
              <h4 className="font-semibold text-text-primary">Creating Your Musical Sanctuary</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🎧</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Quality Audio:</strong> Use good headphones or speakers</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🛏️</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Comfortable Space:</strong> Find a quiet, cozy spot</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">📱</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Remove Distractions:</strong> Put devices on silent</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">🕐</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Set Time Aside:</strong> Dedicate 15-30 minutes daily</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">🌡️</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Ideal Temperature:</strong> Keep room cool and comfortable</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-500 mt-1">💡</span>
                  <p className="text-text-secondary"><strong className="text-text-primary">Soft Lighting:</strong> Dim lights or use candles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Relaxing Music Genres */}
          <div className="bg-gradient-to-r from-pink-100 to-red-100 dark:from-bg-tertiary dark:to-bg-secondary p-5 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🎭</span>
              <h4 className="font-semibold text-text-primary">Popular Relaxing Genres</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🎹</div>
                <p className="text-text-primary font-medium text-sm">Classical</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🌊</div>
                <p className="text-text-primary font-medium text-sm">Ambient</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🌿</div>
                <p className="text-text-primary font-medium text-sm">Nature</p>
              </div>
              <div className="bg-white dark:bg-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">🧘</div>
                <p className="text-text-primary font-medium text-sm">Meditation</p>
              </div>
            </div>
          </div>

          {/* Music Listening Tips */}
          <div className="bg-bg-tertiary p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">💡</span>
              <h5 className="font-semibold text-text-primary">Pro Tips for Relaxing Music</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <ul className="space-y-2 text-text-secondary">
                <li>• Start with 10-15 minutes daily</li>
                <li>• Experiment with different genres</li>
                <li>• Combine with deep breathing</li>
              </ul>
              <ul className="space-y-2 text-text-secondary">
                <li>• Create personal playlists</li>
                <li>• Use music during study breaks</li>
                <li>• Practice active listening</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const getActiveClasses = () => 'bg-bg-tertiary border-border-primary';

  const activeTabData = wellnessTools.find(tool => tool.id === activeTab);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <FiHeart className="text-text-secondary text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
              Wellness Center
            </h1>
          </div>
          <p className="text-text-secondary text-lg">
            Your personal space for mental and physical wellbeing
          </p>
        </motion.div>
      </div>

      {/* Wellness Tools Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        {wellnessTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTab === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isActive
                  ? 'bg-bg-tertiary border-border-primary'
                  : 'bg-bg-secondary border-border-secondary hover:border-border-primary'
              }`}
            >
              <Icon className={`text-2xl mx-auto mb-2 ${
                isActive ? 'text-text-primary' : 'text-text-secondary'
              }`} />
              <h3 className={`font-semibold text-sm ${
                isActive ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                {tool.title}
              </h3>
            </button>
          );
        })}
      </motion.div>

      {/* Active Tool Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-bg-secondary rounded-2xl p-6 border border-border-primary"
      >
        {activeTabData?.component}
      </motion.div>

      {/* Wellness Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 bg-bg-secondary rounded-2xl p-6 border border-border-primary"
      >
        <h3 className="text-xl font-semibold text-text-primary mb-4">Daily Wellness Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-text-tertiary rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-text-secondary">Take regular breaks from screens to rest your eyes</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-text-tertiary rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-text-secondary">Practice deep breathing for 5 minutes daily</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-text-tertiary rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-text-secondary">Stay hydrated throughout the day</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-text-tertiary rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-text-secondary">Get adequate sleep (7-9 hours) for better mental health</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 

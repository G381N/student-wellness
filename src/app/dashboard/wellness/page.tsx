'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiSun, FiMoon, FiActivity, FiBookOpen, FiMusic } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import GuidedBreathing from '@/components/GuidedBreathing';

export default function WellnessPage() {
  const { user, loading: authLoading } = useAuth();
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading wellness center...</p>
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
          <div className="text-center mb-8">
            <FiSun className="text-yellow-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Meditation Center</h3>
            <p className="text-gray-300">Find your inner peace through guided meditation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mindfulness Session */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-yellow-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">🧘‍♀️ Mindfulness Meditation</h4>
              <p className="text-gray-300 mb-4">Focus on the present moment and cultivate awareness</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>⏱️ Duration: 10-20 minutes</p>
                <p>📱 Perfect for: Reducing anxiety, improving focus</p>
                <p>🎯 Level: Beginner friendly</p>
              </div>
              <button className="w-full mt-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors">
                Start Session
              </button>
            </div>
            
            {/* Body Scan */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-yellow-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">🌊 Body Scan Meditation</h4>
              <p className="text-gray-300 mb-4">Release tension and connect with your body</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>⏱️ Duration: 15-30 minutes</p>
                <p>📱 Perfect for: Stress relief, better sleep</p>
                <p>🎯 Level: All levels</p>
              </div>
              <button className="w-full mt-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors">
                Start Session
              </button>
            </div>
            
            {/* Loving Kindness */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-yellow-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">💝 Loving-Kindness Meditation</h4>
              <p className="text-gray-300 mb-4">Cultivate compassion for yourself and others</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>⏱️ Duration: 10-15 minutes</p>
                <p>📱 Perfect for: Self-compassion, relationships</p>
                <p>🎯 Level: Beginner friendly</p>
              </div>
              <button className="w-full mt-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors">
                Start Session
              </button>
            </div>
            
            {/* Stress Relief */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-yellow-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">🌿 Quick Stress Relief</h4>
              <p className="text-gray-300 mb-4">5-minute meditation for instant calm</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>⏱️ Duration: 5 minutes</p>
                <p>📱 Perfect for: Busy schedules, exam stress</p>
                <p>🎯 Level: Beginner friendly</p>
              </div>
              <button className="w-full mt-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors">
                Start Session
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 p-6 rounded-xl border border-yellow-600">
            <h4 className="text-lg font-semibold text-yellow-200 mb-3">✨ Today's Meditation Quote</h4>
            <p className="text-yellow-100 italic text-center text-lg">
              "Peace comes from within. Do not seek it without." - Buddha
            </p>
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
          <div className="text-center mb-8">
            <FiMoon className="text-blue-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Sleep Wellness Center</h3>
            <p className="text-gray-300">Optimize your sleep for better health and wellbeing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sleep Tracker */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-blue-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">📊 Sleep Quality Tracker</h4>
              <p className="text-gray-300 mb-4">Monitor your sleep patterns and quality</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last Night's Sleep:</span>
                  <span className="text-green-400 font-semibold">7h 32m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sleep Quality:</span>
                  <span className="text-blue-400 font-semibold">Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Weekly Average:</span>
                  <span className="text-yellow-400 font-semibold">7h 15m</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                Log Sleep
              </button>
            </div>
            
            {/* Sleep Stories */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-blue-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">📚 Bedtime Stories</h4>
              <p className="text-gray-300 mb-4">Calming stories to help you drift off to sleep</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <span className="text-2xl">🌙</span>
                  <span className="text-gray-300">The Moonlit Forest</span>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <span className="text-2xl">🌊</span>
                  <span className="text-gray-300">Ocean Waves</span>
                </div>
                <div className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <span className="text-2xl">⭐</span>
                  <span className="text-gray-300">Stargazing Journey</span>
                </div>
              </div>
            </div>
            
            {/* Sleep Hygiene Tips */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-blue-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">💡 Sleep Hygiene Tips</h4>
              <p className="text-gray-300 mb-4">Evidence-based tips for better sleep</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• Keep a consistent sleep schedule</p>
                <p>• Avoid screens 1 hour before bed</p>
                <p>• Keep bedroom cool and dark</p>
                <p>• Limit caffeine after 2 PM</p>
                <p>• Create a relaxing bedtime routine</p>
              </div>
            </div>
            
            {/* Sleep Sounds */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-blue-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">🎵 Sleep Sounds</h4>
              <p className="text-gray-300 mb-4">Soothing sounds for better sleep</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors">
                  🌧️ Rain
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors">
                  🌊 Waves
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors">
                  🔥 Fireplace
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors">
                  🌿 Forest
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-xl border border-blue-600">
            <h4 className="text-lg font-semibold text-blue-200 mb-3">🎯 Sleep Goal</h4>
            <p className="text-blue-100 mb-2">Weekly Sleep Target: 49 hours (7h/night)</p>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{width: '78%'}}></div>
            </div>
            <p className="text-blue-200 text-sm mt-2">38.5 / 49 hours completed this week</p>
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
          <div className="text-center mb-8">
            <FiActivity className="text-green-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Fitness Tracker</h3>
            <p className="text-gray-300">Track your physical activity and health goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Stats */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-green-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-green-400 mb-4">📊 Today's Stats</h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">8,547</div>
                  <div className="text-gray-400 text-sm">Steps</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-blue-400">6.2km</div>
                    <div className="text-gray-400 text-xs">Distance</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-yellow-400">420</div>
                    <div className="text-gray-400 text-xs">Calories</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weekly Progress */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-green-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-green-400 mb-4">📈 Weekly Progress</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Workouts:</span>
                  <span className="text-green-400 font-semibold">4/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Days:</span>
                  <span className="text-blue-400 font-semibold">6/7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Steps:</span>
                  <span className="text-yellow-400 font-semibold">52,430</span>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-400 mb-2">Weekly Goal Progress</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Workouts */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-green-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-green-400 mb-4">💪 Quick Workouts</h4>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏃‍♀️</span>
                    <div>
                      <div className="text-white font-medium">Morning Cardio</div>
                      <div className="text-gray-400 text-sm">15 mins</div>
                    </div>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💪</span>
                    <div>
                      <div className="text-white font-medium">Strength Training</div>
                      <div className="text-gray-400 text-sm">30 mins</div>
                    </div>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🧘‍♂️</span>
                    <div>
                      <div className="text-white font-medium">Yoga Flow</div>
                      <div className="text-gray-400 text-sm">20 mins</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Water Intake */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-blue-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-blue-400 mb-4">💧 Water Intake</h4>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-400">6/8</div>
                <div className="text-gray-400 text-sm">Glasses today</div>
              </div>
              <div className="flex space-x-2 justify-center">
                {[1,2,3,4,5,6,7,8].map((glass) => (
                  <div key={glass} className={`w-6 h-8 rounded ${glass <= 6 ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                Add Glass
              </button>
            </div>
            
            {/* Health Reminders */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">⏰ Health Reminders</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">Take a break</span>
                  <span className="text-green-400 text-sm">✓ Done</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">Drink water</span>
                  <span className="text-yellow-400 text-sm">In 30m</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">Evening walk</span>
                  <span className="text-blue-400 text-sm">Pending</span>
                </div>
              </div>
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
          <div className="text-center mb-8">
            <FiBookOpen className="text-purple-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Mood Journal</h3>
            <p className="text-gray-300">Track your emotions and mental wellbeing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Mood */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">😊 How are you feeling today?</h4>
              <div className="grid grid-cols-5 gap-3 mb-4">
                <button className="p-3 text-3xl hover:bg-gray-700 rounded-lg transition-colors">😢</button>
                <button className="p-3 text-3xl hover:bg-gray-700 rounded-lg transition-colors">😐</button>
                <button className="p-3 text-3xl bg-purple-600 rounded-lg">😊</button>
                <button className="p-3 text-3xl hover:bg-gray-700 rounded-lg transition-colors">😁</button>
                <button className="p-3 text-3xl hover:bg-gray-700 rounded-lg transition-colors">🤩</button>
              </div>
              <textarea 
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                placeholder="What's on your mind today? Share your thoughts..."
                rows={3}
              />
              <button className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                Save Entry
              </button>
            </div>
            
            {/* Mood Trends */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">📈 Mood Trends</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Week Average:</span>
                  <span className="text-green-400 font-semibold">Good 😊</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Most Common:</span>
                  <span className="text-blue-400 font-semibold">Happy 😁</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Entries This Month:</span>
                  <span className="text-yellow-400 font-semibold">23 days</span>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-400 mb-2">Weekly Mood Distribution</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span>😁</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{width: '40%'}}></div>
                      </div>
                      <span className="text-xs text-gray-400">40%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>😊</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-xs text-gray-400">35%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>😐</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-xs text-gray-400">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gratitude Section */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">🙏 Daily Gratitude</h4>
              <p className="text-gray-300 mb-4">What are you grateful for today?</p>
              <div className="space-y-3">
                <input 
                  type="text" 
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  placeholder="I'm grateful for..."
                />
                <input 
                  type="text" 
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  placeholder="Another thing I appreciate..."
                />
                <input 
                  type="text" 
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  placeholder="One more blessing..."
                />
              </div>
              <button className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                Save Gratitude
              </button>
            </div>
            
            {/* Emotional Insights */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">🧠 Emotional Insights</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-yellow-400 font-medium mb-1">✨ Positive Pattern</div>
                  <div className="text-gray-300 text-sm">You tend to feel better on days when you exercise!</div>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-blue-400 font-medium mb-1">🎯 Suggestion</div>
                  <div className="text-gray-300 text-sm">Try meditation when feeling stressed - it helped you last week.</div>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-green-400 font-medium mb-1">🏆 Achievement</div>
                  <div className="text-gray-300 text-sm">7-day journaling streak! Keep it up!</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-6 rounded-xl border border-purple-600">
            <h4 className="text-lg font-semibold text-purple-200 mb-3">💫 Motivational Quote</h4>
            <p className="text-purple-100 italic text-center text-lg">
              "The only way to make sense out of change is to plunge into it, move with it, and join the dance." - Alan Watts
            </p>
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
          <div className="text-center mb-8">
            <FiMusic className="text-pink-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Relaxing Music & Sounds</h3>
            <p className="text-gray-300">Curated playlists and ambient sounds for relaxation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nature Sounds */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-green-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-green-400 mb-4">🌿 Nature Sounds</h4>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🌧️</span>
                      <span className="text-white">Gentle Rain</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🌊</span>
                      <span className="text-white">Ocean Waves</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🏔️</span>
                      <span className="text-white">Mountain Wind</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🦅</span>
                      <span className="text-white">Forest Birds</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Instrumental Music */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-blue-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-blue-400 mb-4">🎵 Instrumental</h4>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🎹</span>
                      <span className="text-white">Piano Melodies</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🎻</span>
                      <span className="text-white">String Quartet</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🪕</span>
                      <span className="text-white">Acoustic Guitar</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🎶</span>
                      <span className="text-white">Ambient Sounds</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Meditation Music */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-purple-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">🧘‍♀️ Meditation</h4>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🕉️</span>
                      <span className="text-white">Tibetan Bowls</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🎋</span>
                      <span className="text-white">Bamboo Flute</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🔔</span>
                      <span className="text-white">Crystal Chimes</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">✨</span>
                      <span className="text-white">Binaural Beats</span>
                    </div>
                    <span className="text-gray-400 group-hover:text-white">▶️</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Music Player */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
            <h4 className="text-lg font-semibold text-pink-400 mb-4">🎧 Now Playing</h4>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FiMusic className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Gentle Rain & Piano</div>
                <div className="text-gray-400 text-sm">Nature Sounds Collection</div>
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">2:34</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-1">
                      <div className="bg-pink-400 h-1 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    <span className="text-xs text-gray-400">7:20</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-6">
              <button className="text-gray-400 hover:text-white transition-colors">⏮️</button>
              <button className="text-white text-2xl hover:text-pink-400 transition-colors">⏸️</button>
              <button className="text-gray-400 hover:text-white transition-colors">⏭️</button>
              <button className="text-gray-400 hover:text-white transition-colors">🔄</button>
              <button className="text-gray-400 hover:text-white transition-colors">🔉</button>
            </div>
          </div>
          
          {/* Custom Playlists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-pink-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-pink-400 mb-4">📚 Study Focus</h4>
              <p className="text-gray-300 mb-4">Background music for concentration and productivity</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• 12 tracks • 45 minutes</p>
                <p>• Lo-fi beats and ambient sounds</p>
                <p>• No lyrics to avoid distraction</p>
              </div>
              <button className="w-full mt-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors">
                Play Playlist
              </button>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 hover:border-pink-400 transition-all duration-300">
              <h4 className="text-lg font-semibold text-pink-400 mb-4">🌙 Sleep Sounds</h4>
              <p className="text-gray-300 mb-4">Calming sounds for better sleep quality</p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>• 8 tracks • 60 minutes each</p>
                <p>• White noise and nature sounds</p>
                <p>• Loop-friendly for all night</p>
              </div>
              <button className="w-full mt-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors">
                Play Playlist
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const getActiveClasses = () => 'bg-gray-700 border-gray-500';

  const activeTabData = wellnessTools.find(tool => tool.id === activeTab);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <FiHeart className="text-gray-400 text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Wellness Center
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
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
                  ? getActiveClasses()
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <Icon className={`text-2xl mx-auto mb-2 ${
                isActive ? 'text-white' : 'text-gray-400'
              }`} />
              <h3 className={`font-semibold text-sm ${
                isActive ? 'text-white' : 'text-gray-300'
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
        className="bg-gray-900 rounded-2xl p-6 border border-gray-700"
      >
        {activeTabData?.component}
      </motion.div>

      {/* Wellness Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 bg-gray-900 rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Daily Wellness Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Take regular breaks from screens to rest your eyes</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Practice deep breathing for 5 minutes daily</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Stay hydrated throughout the day</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Get adequate sleep (7-9 hours) for better mental health</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 
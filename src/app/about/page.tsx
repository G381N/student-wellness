'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiCalendar, FiStar, FiUser, FiBook, FiHeart, FiShield, FiUsers, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

interface Counselor {
  id: string;
  name: string;
  title: string;
  image: string;
  specialties: string[];
  bio: string;
  education: string[];
  experience: string;
  rating: number;
  availableHours: string;
}

interface Service {
  title: string;
  description: string;
  icon: any;
  color: string;
}

export default function AboutPage() {
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);

  const counselors: Counselor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Mitchell',
      title: 'Licensed Clinical Psychologist',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
      specialties: ['Anxiety Disorders', 'Depression', 'Academic Stress', 'ADHD'],
      bio: 'Dr. Mitchell has over 15 years of experience working with college students. She specializes in cognitive-behavioral therapy and mindfulness-based interventions.',
      education: [
        'Ph.D. in Clinical Psychology - Stanford University',
        'M.A. in Counseling Psychology - UCLA',
        'B.A. in Psychology - UC Berkeley'
      ],
      experience: '15+ years in student mental health',
      rating: 4.9,
      availableHours: 'Mon-Fri: 9 AM - 5 PM'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      title: 'Licensed Clinical Social Worker',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
      specialties: ['Crisis Intervention', 'Trauma Therapy', 'Substance Abuse', 'Family Therapy'],
      bio: 'Dr. Chen brings a holistic approach to mental health, incorporating cultural competency and trauma-informed care in his practice.',
      education: [
        'Ph.D. in Social Work - University of Chicago',
        'M.S.W. - Columbia University',
        'B.A. in Social Work - NYU'
      ],
      experience: '12+ years in crisis intervention',
      rating: 4.8,
      availableHours: 'Mon-Thu: 10 AM - 6 PM, Fri: 9 AM - 3 PM'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      title: 'Licensed Marriage & Family Therapist',
      image: 'https://images.unsplash.com/photo-1594824388853-d0294e15e50a?w=300&h=300&fit=crop&crop=face',
      specialties: ['Relationship Issues', 'Eating Disorders', 'Body Image', 'Self-Esteem'],
      bio: 'Dr. Rodriguez focuses on helping students develop healthy relationships with themselves and others, using evidence-based therapeutic approaches.',
      education: [
        'Ph.D. in Marriage & Family Therapy - USC',
        'M.A. in Clinical Psychology - Pepperdine',
        'B.A. in Psychology - UCLA'
      ],
      experience: '10+ years in relationship counseling',
      rating: 4.9,
      availableHours: 'Tue-Sat: 8 AM - 4 PM'
    },
    {
      id: '4',
      name: 'Dr. James Thompson',
      title: 'Psychiatrist',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
      specialties: ['Medication Management', 'Bipolar Disorder', 'Severe Depression', 'Anxiety Disorders'],
      bio: 'Dr. Thompson provides comprehensive psychiatric care, working closely with our therapy team to offer integrated treatment approaches.',
      education: [
        'M.D. - Harvard Medical School',
        'Psychiatry Residency - Johns Hopkins',
        'B.S. in Neuroscience - MIT'
      ],
      experience: '18+ years in psychiatry',
      rating: 4.7,
      availableHours: 'Mon, Wed, Fri: 9 AM - 5 PM'
    }
  ];

  const services: Service[] = [
    {
      title: 'Individual Therapy',
      description: 'One-on-one sessions tailored to your specific needs and goals',
      icon: FiUser,
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'Group Therapy',
      description: 'Supportive group sessions focusing on specific topics or challenges',
      icon: FiUsers,
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Crisis Support',
      description: '24/7 emergency support for students in mental health crisis',
      icon: FiPhone,
      color: 'from-red-400 to-red-600'
    },
    {
      title: 'Academic Coaching',
      description: 'Strategies to improve study habits, time management, and academic performance',
      icon: FiBook,
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
                <FiHeart className="text-white text-2xl" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About <span className="bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">Christ Wellness</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A dedicated platform designed exclusively for Christ University students to foster 
              mental health awareness, build community connections, and create a supportive 
              campus environment where every student thrives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Mission</h2>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-center mb-8 text-xl leading-relaxed">
                Christ Wellness is a dedicated platform designed to foster mental health awareness, 
                community building, and student support within the Christ University ecosystem.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="text-center p-6 rounded-2xl bg-blue-50 border border-blue-100">
                  <FiUsers className="text-blue-600 text-3xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Building</h3>
                  <p className="text-gray-600">
                    Connect students, faculty, and staff in a supportive environment where everyone can share experiences and build meaningful relationships.
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-green-50 border border-green-100">
                  <FiHeart className="text-green-600 text-3xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Mental Health Support</h3>
                  <p className="text-gray-600">
                    Provide accessible mental health resources, wellness activities, and a platform for students to express concerns and seek support.
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-purple-50 border border-purple-100">
                  <FiShield className="text-purple-600 text-3xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Safe Environment</h3>
                  <p className="text-gray-600">
                    Ensure a secure and private space where students can share concerns anonymously and receive community support through our upvoting system.
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-orange-50 border border-orange-100">
                  <FiUsers className="text-orange-600 text-3xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Campus Activities</h3>
                  <p className="text-gray-600">
                    Facilitate student-led activities, events, and initiatives that promote engagement and social connection across all campuses.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Login</h3>
                  <p className="text-gray-600">
                    Access the platform using your official Christ University email address (@christuniversity.in) to ensure a secure and verified community.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Share & Connect</h3>
                  <p className="text-gray-600">
                    Create activity posts for events, study groups, or social gatherings. Share concerns or issues you're facing for community support.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Support</h3>
                  <p className="text-gray-600">
                    Upvote concerns that resonate with you to help prioritize important issues. Engage with activities that interest you.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Resolution & Growth</h3>
                  <p className="text-gray-600">
                    University staff monitor highly upvoted concerns for resolution. Students build connections through shared activities and interests.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Get Support</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Support</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiMail className="text-blue-600" />
                    <span className="text-gray-700">wellness@christuniversity.in</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiClock className="text-blue-600" />
                    <span className="text-gray-700">24/7 Platform Access</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Christ University</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiPhone className="text-green-600" />
                    <span className="text-gray-700">+91 80 2259 7000</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiMapPin className="text-green-600 mt-1" />
                    <span className="text-gray-700">
                      Hosur Road, Bangalore<br />
                      Karnataka 560029, India
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Emergency Support</h4>
              <p className="text-gray-700 mb-4">
                If you're experiencing a mental health emergency, please contact emergency services immediately.
              </p>
              <div className="text-red-600 font-semibold">
                Emergency: 102 | KIRAN Mental Health: 1800-599-0019
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Community Today
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Be part of a supportive network that prioritizes student wellbeing and mental health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Access Student Portal
              </Link>
              <Link
                href="/"
                className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FiArrowLeft />
                <span>Back to Home</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 
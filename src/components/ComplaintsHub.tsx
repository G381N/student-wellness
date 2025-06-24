'use client';

import { motion } from 'framer-motion';
import { FiShield, FiBriefcase, FiUser, FiEye, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ComplaintsHub() {
  const router = useRouter();
  const { user, isAdmin, isDepartmentHead } = useAuth();

  const complaintOptions = [
    {
      id: 'anonymous',
      title: 'Anonymous Complaints',
      description: 'Submit a complaint anonymously without revealing your identity. Your privacy is protected.',
      icon: FiShield,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      route: '/complaints/anonymous',
      features: [
        'Complete anonymity',
        'No personal information required',
        'Secure and confidential',
        'Quick submission process'
      ]
    },
    {
      id: 'department',
      title: 'Department Complaints',
      description: 'Submit a complaint to a specific department with your contact information for direct resolution.',
      icon: FiBriefcase,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      route: '/complaints/department',
      features: [
        'Direct department contact',
        'Personal follow-up',
        'Faster resolution',
        'Department head review'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiAlertTriangle className="text-4xl text-red-400" />
            <h1 className="text-4xl font-bold text-white">Student Complaints</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Choose the type of complaint submission that best suits your needs. Whether you prefer anonymity or direct department contact, we're here to help resolve your concerns.
          </p>
        </motion.div>

        {(isAdmin || isDepartmentHead) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <FiEye className="text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                {isAdmin ? 'Admin Access' : 'Department Head Access'}
              </h3>
            </div>
            <p className="text-blue-300 mb-4">
              {isAdmin 
                ? 'You have access to review and manage all complaints across the platform.'
                : 'You can review and manage complaints for your assigned department.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/dashboard/anonymous-complaints')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiShield className="text-sm" />
                View Anonymous Complaints
              </button>
              <button
                onClick={() => router.push('/dashboard/department-complaints')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiBriefcase className="text-sm" />
                View Department Complaints
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {complaintOptions.map((option, index) => {
            const IconComponent = option.icon;
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => router.push(option.route)}
              >
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 h-full transition-all duration-300 hover:border-gray-600 hover:shadow-xl hover:shadow-gray-900/50">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${option.color} ${option.hoverColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="text-white text-2xl" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gray-100 transition-colors">
                    {option.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {option.description}
                  </p>
                  
                  <div className="mb-8">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <FiUser className="text-sm" />
                      Key Features:
                    </h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-gray-300">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${option.color} ${option.hoverColor} group-hover:shadow-lg transition-all`}>
                    <span className="text-white font-semibold">
                      Submit {option.title.split(' ')[0]} Complaint
                    </span>
                    <FiArrowRight className="text-white text-lg group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gray-900 border border-gray-700 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Need Help Choosing?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Choose Anonymous If:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• You want complete privacy protection</li>
                <li>• You're concerned about potential retaliation</li>
                <li>• You prefer not to provide personal details</li>
                <li>• Your concern is general or doesn't need follow-up</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Choose Department If:</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• You want direct communication with department heads</li>
                <li>• Your issue requires personal follow-up</li>
                <li>• You need faster resolution</li>
                <li>• You're comfortable sharing your contact information</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            All complaints are handled with utmost confidentiality and professionalism. 
            Our team is committed to creating a safe and supportive environment for all students.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 
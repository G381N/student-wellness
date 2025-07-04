const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - you'll need to add your config here
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const samplePosts = [
  {
    content: "Looking for study group members for Data Structures and Algorithms! Anyone interested in joining? We'll meet twice a week to solve problems and discuss concepts.",
    author: "Alice Johnson",
    authorId: "user123",
    authorName: "Alice Johnson",
    category: "Academic",
    type: "concern",
    isAnonymous: false,
    upvotes: 5,
    downvotes: 0,
    upvotedBy: ["user1", "user2", "user3", "user4", "user5"],
    downvotedBy: [],
    votedUsers: ["user1", "user2", "user3", "user4", "user5"],
    comments: []
  },
  {
    content: "Mental Health Workshop: Join us this Saturday at 2 PM in the auditorium for a session on stress management and mindfulness techniques. Free for all students!",
    author: "Wellness Team",
    authorId: "admin456",
    authorName: "Wellness Team",
    category: "Mental Health",
    type: "activity",
    eventType: "activity",
    isAnonymous: false,
    location: "Main Auditorium",
    maxParticipants: 50,
    participants: [],
    upvotes: 12,
    downvotes: 1,
    upvotedBy: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10", "user11", "user12"],
    downvotedBy: ["user13"],
    votedUsers: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10", "user11", "user12", "user13"],
    comments: [
      {
        id: "comment1",
        content: "This sounds great! Can't wait to attend.",
        author: "Bob Smith",
        authorId: "user2",
        timestamp: new Date(),
        isAnonymous: false
      }
    ]
  },
  {
    content: "Campus cleanup drive this Sunday! Let's make our campus beautiful together. Meet at the main gate at 8 AM. Refreshments will be provided.",
    author: "Environmental Club",
    authorId: "club789",
    authorName: "Environmental Club",
    category: "Community",
    type: "activity",
    eventType: "activity",
    isAnonymous: false,
    location: "Main Gate",
    maxParticipants: 30,
    participants: [
      {
        userId: "user1",
        userName: "John Doe",
        joinedAt: new Date()
      }
    ],
    upvotes: 8,
    downvotes: 0,
    upvotedBy: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8"],
    downvotedBy: [],
    votedUsers: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8"],
    comments: []
  }
];

const sampleDepartments = [
  {
    code: "MSC_AIML",
    name: "M.Sc. Artificial Intelligence and Machine Learning",
    headPhoneNumber: "+91-9876543210",
    email: "head.aiml@christ.edu",
    createdBy: "Admin",
    isActive: true
  },
  {
    code: "MSC_CS",
    name: "M.Sc. Computer Science",
    headPhoneNumber: "+91-9876543211",
    email: "head.cs@christ.edu",
    createdBy: "Admin",
    isActive: true
  },
  {
    code: "MBA",
    name: "Master of Business Administration",
    headPhoneNumber: "+91-9876543212",
    email: "head.mba@christ.edu",
    createdBy: "Admin",
    isActive: true
  }
];

const sampleMindWallIssues = [
  {
    title: "Better WiFi in Library",
    description: "The WiFi connection in the library is very slow, especially during peak hours. Students need better connectivity for online research and coursework.",
    category: "Infrastructure",
    icon: "📶",
    count: 15,
    votedBy: ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10", "user11", "user12", "user13", "user14", "user15"],
    authorId: "anonymous",
    isAnonymous: true,
    status: "Open",
    severity: "Medium"
  },
  {
    title: "Extended Library Hours",
    description: "Request to extend library hours until 10 PM during exam periods to provide more study time for students.",
    category: "Academic",
    icon: "📚",
    count: 23,
    votedBy: Array.from({length: 23}, (_, i) => `user${i+1}`),
    authorId: "anonymous",
    isAnonymous: true,
    status: "Open",
    severity: "Low"
  }
];

async function addTestData() {
  try {
    console.log('Adding sample posts...');
    for (const post of samplePosts) {
      await addDoc(collection(db, 'posts'), {
        ...post,
        timestamp: serverTimestamp()
      });
    }
    console.log('✅ Sample posts added');

    console.log('Adding sample departments...');
    for (const dept of sampleDepartments) {
      await addDoc(collection(db, 'departments'), {
        ...dept,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log('✅ Sample departments added');

    console.log('Adding sample mind wall issues...');
    for (const issue of sampleMindWallIssues) {
      await addDoc(collection(db, 'mindWallIssues'), {
        ...issue,
        timestamp: serverTimestamp()
      });
    }
    console.log('✅ Sample mind wall issues added');

    console.log('🎉 All test data added successfully!');
  } catch (error) {
    console.error('Error adding test data:', error);
  }
}

// Run the script
addTestData(); 
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set your service account key)
const serviceAccount = require('./service-account-key.json'); // Add your service account key file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://campuswell-b2c39-default-rtdb.firebaseio.com/"
});

const db = admin.firestore();

async function testDepartmentSystem() {
  try {
    console.log('🔧 Starting Department System Test...\n');

    // Test 1: Add sample departments
    console.log('📝 Adding sample departments...');
    const departments = [
      {
        name: 'Computer Science',
        description: 'All computer science and programming related issues',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Business Administration',
        description: 'Business studies, management, and administrative concerns',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Engineering',
        description: 'Engineering department issues and concerns',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Arts & Sciences',
        description: 'Liberal arts and sciences department',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Student Services',
        description: 'General student services and administrative issues',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const dept of departments) {
      const deptRef = await db.collection('departments').add(dept);
      console.log(`✅ Added department: ${dept.name} (ID: ${deptRef.id})`);
    }

    // Test 2: Add sample department heads
    console.log('\n👥 Adding sample department heads...');
    const deptSnapshot = await db.collection('departments').get();
    const departmentIds = deptSnapshot.docs.map(doc => doc.id);

    const departmentHeads = [
      {
        name: 'Dr. John Smith',
        email: 'john.smith@university.edu',
        phoneNumber: '+1234567890',
        departmentId: departmentIds[0], // Computer Science
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Prof. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        phoneNumber: '+1234567891',
        departmentId: departmentIds[1], // Business Administration
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Dr. Michael Brown',
        email: 'michael.brown@university.edu',
        phoneNumber: '+1234567892',
        departmentId: departmentIds[2], // Engineering
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const head of departmentHeads) {
      const headRef = await db.collection('departmentHeads').add(head);
      console.log(`✅ Added department head: ${head.name} (ID: ${headRef.id})`);
    }

    // Test 3: Add a sample department complaint
    console.log('\n📋 Adding sample department complaint...');
    const sampleComplaint = {
      studentId: 'test-student-123',
      studentName: 'Test Student',
      studentEmail: 'test.student@university.edu',
      departmentId: departmentIds[0],
      category: 'Academic',
      severity: 'Medium',
      title: 'Lab Equipment Issues',
      description: 'The computers in the CS lab are running very slowly and some are not working properly.',
      status: 'Pending',
      isResolved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const complaintRef = await db.collection('departmentComplaints').add(sampleComplaint);
    console.log(`✅ Added sample complaint: ${sampleComplaint.title} (ID: ${complaintRef.id})`);

    // Test 4: Add a sample anonymous complaint
    console.log('\n🔒 Adding sample anonymous complaint...');
    const anonymousComplaint = {
      studentPhone: '+1234567899', // Hidden from UI but stored for responses
      category: 'Safety',
      severity: 'High',
      title: 'Campus Safety Concern',
      description: 'Poor lighting in the parking lot makes it unsafe for students walking to their cars at night.',
      status: 'Pending',
      isResolved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const anonComplaintRef = await db.collection('anonymousComplaints').add(anonymousComplaint);
    console.log(`✅ Added anonymous complaint: ${anonymousComplaint.title} (ID: ${anonComplaintRef.id})`);

    // Test 5: Verify data retrieval
    console.log('\n🔍 Verifying data retrieval...');
    
    const deptCount = (await db.collection('departments').get()).size;
    console.log(`📊 Total departments: ${deptCount}`);
    
    const headCount = (await db.collection('departmentHeads').get()).size;
    console.log(`📊 Total department heads: ${headCount}`);
    
    const deptComplaintCount = (await db.collection('departmentComplaints').get()).size;
    console.log(`📊 Total department complaints: ${deptComplaintCount}`);
    
    const anonComplaintCount = (await db.collection('anonymousComplaints').get()).size;
    console.log(`📊 Total anonymous complaints: ${anonComplaintCount}`);

    console.log('\n✨ Department System Test Completed Successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Update your WhatsApp bot with the correct Firebase credentials');
    console.log('2. Deploy your web application');
    console.log('3. Test the WhatsApp bot with the populated departments');
    console.log('4. Create admin accounts to manage the system');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    // Clean up
    process.exit(0);
  }
}

// Function to test WhatsApp integration
async function testWhatsAppIntegration() {
  try {
    console.log('\n📱 Testing WhatsApp Integration...');
    
    // Test department loading
    const departments = await db.collection('departments')
      .where('isActive', '==', true)
      .get();
    
    console.log('📋 Available departments for WhatsApp:');
    departments.forEach((doc, index) => {
      const dept = doc.data();
      console.log(`  ${index + 1}. ${dept.name} - ${dept.description}`);
    });

    // Test department head lookup
    console.log('\n👥 Department heads for notifications:');
    const heads = await db.collection('departmentHeads')
      .where('isActive', '==', true)
      .get();
    
    for (const headDoc of heads.docs) {
      const head = headDoc.data();
      const deptDoc = await db.collection('departments').doc(head.departmentId).get();
      const dept = deptDoc.data();
      console.log(`  📞 ${head.name} (${dept?.name}) - ${head.phoneNumber}`);
    }

  } catch (error) {
    console.error('❌ WhatsApp integration test failed:', error);
  }
}

// Run tests
console.log('🚀 Student Wellness Department System Test Suite\n');
testDepartmentSystem().then(() => {
  return testWhatsAppIntegration();
}); 
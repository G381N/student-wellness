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

    // Test 1: Add sample departments with new schema
    console.log('📝 Adding sample departments...');
    const departments = [
      {
        code: 'CSE',
        name: 'Computer Science',
        headPhoneNumber: '+1234567890',
        isActive: true,
        createdBy: 'System Admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        code: 'MBA',
        name: 'Business Administration',
        headPhoneNumber: '+1234567891',
        isActive: true,
        createdBy: 'System Admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        code: 'ENG',
        name: 'Engineering',
        headPhoneNumber: '+1234567892',
        isActive: true,
        createdBy: 'System Admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        code: 'AS',
        name: 'Arts & Sciences',
        headPhoneNumber: '+1234567893',
        isActive: true,
        createdBy: 'System Admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        code: 'SS',
        name: 'Student Services',
        headPhoneNumber: '+1234567894',
        isActive: true,
        createdBy: 'System Admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const dept of departments) {
      const deptRef = await db.collection('departments').add(dept);
      console.log(`✅ Added department: ${dept.name} (Code: ${dept.code}, ID: ${deptRef.id})`);
    }

    // Test 2: Add sample department complaints with new schema
    console.log('\n📋 Adding sample department complaints...');
    const deptSnapshot = await db.collection('departments').get();
    const departmentIds = deptSnapshot.docs.map(doc => doc.id);
    const departmentCodes = deptSnapshot.docs.map(doc => doc.data().code);

    const sampleComplaints = [
      {
        studentId: 'test-student-123',
        studentName: 'Test Student',
        studentEmail: 'test.student@university.edu',
        studentPhone: '+1234567899',
        departmentId: departmentIds[0],
        departmentCode: departmentCodes[0],
        category: 'Academic',
        priority: 'Medium',
        title: 'Lab Equipment Issues',
        description: 'The computers in the CS lab are running very slowly and some are not working properly.',
        status: 'Pending',
        isResolved: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        studentId: 'test-student-456',
        studentName: 'Jane Doe',
        studentEmail: 'jane.doe@university.edu',
        studentPhone: '+1234567898',
        departmentId: departmentIds[1],
        departmentCode: departmentCodes[1],
        category: 'Administrative',
        priority: 'High',
        title: 'Course Registration Issues',
        description: 'Unable to register for required courses due to system errors.',
        status: 'Pending',
        isResolved: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const complaint of sampleComplaints) {
      const complaintRef = await db.collection('departmentComplaints').add(complaint);
      console.log(`✅ Added complaint: ${complaint.title} (ID: ${complaintRef.id})`);
    }

    // Test 3: Add a sample anonymous complaint
    console.log('\n🔒 Adding sample anonymous complaint...');
    const anonymousComplaint = {
      studentPhone: '+1234567899', // Hidden from UI but stored for responses
      category: 'Safety',
      priority: 'High',
      title: 'Campus Safety Concern',
      description: 'Poor lighting in the parking lot makes it unsafe for students walking to their cars at night.',
      status: 'Pending',
      isResolved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const anonComplaintRef = await db.collection('anonymousComplaints').add(anonymousComplaint);
    console.log(`✅ Added anonymous complaint: ${anonymousComplaint.title} (ID: ${anonComplaintRef.id})`);

    // Test 4: Verify data retrieval
    console.log('\n🔍 Verifying data retrieval...');
    
    const deptCount = (await db.collection('departments').get()).size;
    console.log(`📊 Total departments: ${deptCount}`);
    
    const deptComplaintCount = (await db.collection('departmentComplaints').get()).size;
    console.log(`📊 Total department complaints: ${deptComplaintCount}`);
    
    const anonComplaintCount = (await db.collection('anonymousComplaints').get()).size;
    console.log(`📊 Total anonymous complaints: ${anonComplaintCount}`);

    // Test 5: Test department filtering
    console.log('\n📋 Testing department filtering...');
    const activeDepts = await db.collection('departments')
      .where('isActive', '==', true)
      .get();
    
    console.log(`📊 Active departments: ${activeDepts.size}`);
    activeDepts.forEach(doc => {
      const dept = doc.data();
      console.log(`  - ${dept.name} (${dept.code}) - Head: ${dept.headPhoneNumber}`);
    });

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
      console.log(`  ${index + 1}. ${dept.name} (${dept.code}) - Head: ${dept.headPhoneNumber}`);
    });

    // Test department phone number lookup for notifications
    console.log('\n👥 Department heads for WhatsApp notifications:');
    for (const deptDoc of departments.docs) {
      const dept = deptDoc.data();
      console.log(`  📞 ${dept.name} Head - ${dept.headPhoneNumber}`);
    }

    // Test department code lookup
    console.log('\n🔍 Testing department code lookup:');
    const testCode = 'CSE';
    const deptByCode = await db.collection('departments')
      .where('code', '==', testCode)
      .where('isActive', '==', true)
      .get();
    
    if (!deptByCode.empty) {
      const dept = deptByCode.docs[0].data();
      console.log(`  ✅ Found department by code ${testCode}: ${dept.name} - ${dept.headPhoneNumber}`);
    }

  } catch (error) {
    console.error('❌ WhatsApp integration test failed:', error);
  }
}

// Function to clean up old data (optional)
async function cleanupOldData() {
  try {
    console.log('\n🧹 Cleaning up old department head collection...');
    
    const oldDeptHeads = await db.collection('departmentHeads').get();
    if (!oldDeptHeads.empty) {
      const batch = db.batch();
      oldDeptHeads.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Removed ${oldDeptHeads.size} old department head records`);
    } else {
      console.log('✅ No old department head records to clean up');
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run tests
console.log('🚀 Student Wellness Department System Test Suite\n');
testDepartmentSystem().then(() => {
  return testWhatsAppIntegration();
}).then(() => {
  return cleanupOldData();
}); 
 
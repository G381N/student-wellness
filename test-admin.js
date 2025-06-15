// Test script to create an admin user
// Run this in the browser console after logging in with a test account

const testCreateAdmin = async () => {
  try {
    // Get current user
    const user = firebase.auth().currentUser;
    if (!user) {
      console.log('Please log in first');
      return;
    }

    // Update user role to admin
    await firebase.firestore().collection('users').doc(user.uid).update({
      role: 'admin'
    });

    console.log('User role updated to admin successfully!');
    console.log('Please refresh the page to see the changes.');
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};

// To create a moderator instead:
const testCreateModerator = async () => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      console.log('Please log in first');
      return;
    }

    await firebase.firestore().collection('users').doc(user.uid).update({
      role: 'moderator'
    });

    console.log('User role updated to moderator successfully!');
    console.log('Please refresh the page to see the changes.');
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};

// To add a sample anonymous complaint:
const testAddComplaint = async () => {
  try {
    await firebase.firestore().collection('anonymousComplaints').add({
      title: 'Test Complaint',
      description: 'This is a test complaint for demonstration purposes.',
      category: 'Academic',
      isAnonymous: true,
      authorName: 'Anonymous',
      authorEmail: '',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'new',
      priority: 'medium',
      adminNotes: ''
    });

    console.log('Test complaint added successfully!');
  } catch (error) {
    console.error('Error adding test complaint:', error);
  }
};

console.log('Test functions loaded:');
console.log('- testCreateAdmin() - Make current user an admin');
console.log('- testCreateModerator() - Make current user a moderator');
console.log('- testAddComplaint() - Add a sample complaint'); 
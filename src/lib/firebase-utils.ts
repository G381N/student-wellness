import { db, auth, storage } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  deleteDoc,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function to ensure timestamp consistency
export const processTimestamp = (timestamp: any) => {
  if (!timestamp) return null;
  
  // If it's a Firestore Timestamp object with toDate method
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp;
  }
  
  // If it's a date string or number, convert to Date
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Default fallback
  return timestamp;
};

// Helper function to get display name and real name from email
export const getUserDisplayInfo = (user: any) => {
  const displayName = user?.displayName || 'User';
  let realName = '';
  
  if (user?.email) {
    // Extract real name from email format: firstname.lastname@course.christuniversity.in
    const emailParts = user.email.split('@')[0];
    if (emailParts.includes('.')) {
      const nameParts = emailParts.split('.');
      realName = nameParts.map((part: string) => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    }
  }
  
  return { displayName, realName };
};

// Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL?: string | null;
  role: 'user' | 'moderator' | 'admin';
  createdAt?: any;
  lastLogin?: any;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Timestamp;
}

export interface ActivityParticipant {
  uid: string;
  displayName: string;
  email: string;
  joinedAt: Timestamp;
}

export interface Post {
  id: string;
  type: 'activity' | 'concern' | 'tweet';
  authorId: string;
  authorName?: string; // Keep for backward compatibility, but will be deprecated
  content: string;
  timestamp: Timestamp;
  category: string;
  upvotes: number;
  upvotedBy: string[]; // Array of user IDs
  downvotes: number;
  downvotedBy: string[]; // Array of user IDs
  comments: Comment[];
  imageURL?: string; // Optional image URL for posts
  visibility?: 'public' | 'moderators'; // Post visibility
  
  // Activity specific fields
  location?: string;
  date?: string;
  time?: string;
  participants?: ActivityParticipant[];
  maxParticipants?: number;
  
  // Concern specific fields
  status?: 'new' | 'reviewing' | 'resolved';
  isAnonymous?: boolean;
}

// Mind Wall types
export interface MindWallIssue {
  id: string;
  title: string;
  description: string;
  count: number;
  category: string;
  icon: string;
  authorId: string;
  timestamp: Timestamp;
  votedBy: string[]; // Array of user IDs who voted
}

// Voting debounce tracking
const votingDebounce = new Map<string, number>();
const VOTE_DEBOUNCE_TIME = 300; // Reduced to 300ms (0.3 seconds)

// Helper function to check if voting is allowed
const canVote = (postId: string): boolean => {
  const lastVoteTime = votingDebounce.get(postId);
  const now = Date.now();
  
  if (lastVoteTime && (now - lastVoteTime) < VOTE_DEBOUNCE_TIME) {
    return false;
  }
  
  votingDebounce.set(postId, now);
  return true;
};

// Add a new post (activity or concern)
export const addPost = async (post: Omit<Post, 'id' | 'timestamp' | 'upvotes' | 'upvotedBy' | 'downvotes' | 'downvotedBy' | 'comments'>) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const newPost = {
      ...post,
      authorId: currentUser.uid,
      // Remove authorName from new posts - it will be fetched dynamically
      timestamp: serverTimestamp(),
      upvotes: 0,
      upvotedBy: [],
      downvotes: 0,
      downvotedBy: [],
      comments: []
    };

    if (post.type === 'activity') {
      newPost.participants = [];
    }

    const docRef = await addDoc(collection(db, 'posts'), newPost);
    return { id: docRef.id, ...newPost };
  } catch (error) {
    console.error('Error adding post:', error);
    throw error;
  }
};

// Get all posts
export const getPosts = async () => {
  try {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Process comments timestamps if they exist
      if (data.comments && Array.isArray(data.comments)) {
        data.comments = data.comments.map(comment => ({
          ...comment,
          timestamp: processTimestamp(comment.timestamp)
        }));
      }
      
      return {
        id: doc.id,
        ...data,
        timestamp: processTimestamp(data.timestamp)
      };
    }) as Post[];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Upvote a post
export const upvotePost = async (postId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Check debounce
    if (!canVote(postId)) {
      throw new Error('Please wait before voting again');
    }

    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) throw new Error('Post not found');
    
    const postData = postSnap.data() as Post;
    
    // Check if user has already upvoted
    if (postData.upvotedBy.includes(currentUser.uid)) {
      // Remove upvote
      await updateDoc(postRef, {
        upvotes: increment(-1),
        upvotedBy: arrayRemove(currentUser.uid)
      });
      return false; // Upvote removed
    } else {
      // Add upvote and remove from downvotes if needed
      const updates: any = {
        upvotes: increment(1),
        upvotedBy: arrayUnion(currentUser.uid)
      };
      
      // If user has downvoted, remove the downvote
      if (postData.downvotedBy.includes(currentUser.uid)) {
        updates.downvotes = increment(-1);
        updates.downvotedBy = arrayRemove(currentUser.uid);
      }
      
      await updateDoc(postRef, updates);
      return true; // Upvoted
    }
  } catch (error) {
    console.error('Error upvoting post:', error);
    throw error;
  }
};

// Downvote a post
export const downvotePost = async (postId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Check debounce
    if (!canVote(postId)) {
      throw new Error('Please wait before voting again');
    }

    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) throw new Error('Post not found');
    
    const postData = postSnap.data() as Post;
    
    // Check if user has already downvoted
    if (postData.downvotedBy.includes(currentUser.uid)) {
      // Remove downvote
      await updateDoc(postRef, {
        downvotes: increment(-1),
        downvotedBy: arrayRemove(currentUser.uid)
      });
      return false; // Downvote removed
    } else {
      // Add downvote and remove from upvotes if needed
      const updates: any = {
        downvotes: increment(1),
        downvotedBy: arrayUnion(currentUser.uid)
      };
      
      // If user has upvoted, remove the upvote
      if (postData.upvotedBy.includes(currentUser.uid)) {
        updates.upvotes = increment(-1);
        updates.upvotedBy = arrayRemove(currentUser.uid);
      }
      
      await updateDoc(postRef, updates);
      return true; // Downvoted
    }
  } catch (error) {
    console.error('Error downvoting post:', error);
    throw error;
  }
};

// Join an activity
export const joinActivity = async (postId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) throw new Error('Activity not found');
    
    const postData = postSnap.data() as Post;
    
    if (postData.type !== 'activity') throw new Error('Post is not an activity');
    
    // Check if user is already a participant
    const isParticipant = postData.participants?.some(p => p.uid === currentUser.uid);
    
    if (isParticipant) {
      throw new Error('You are already participating in this activity');
    }
    
    // Check if activity has a max participants limit
    if (postData.maxParticipants && postData.participants && postData.participants.length >= postData.maxParticipants) {
      throw new Error('This activity has reached its maximum number of participants');
    }
    
    // Add user as participant
    const participant: ActivityParticipant = {
      uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous User',
      email: currentUser.email || '',
      joinedAt: Timestamp.now()
    };
    
    await updateDoc(postRef, {
      participants: arrayUnion(participant)
    });
    
    return participant;
  } catch (error) {
    console.error('Error joining activity:', error);
    throw error;
  }
};

// Leave an activity
export const leaveActivity = async (postId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) throw new Error('Activity not found');
    
    const postData = postSnap.data() as Post;
    
    if (postData.type !== 'activity') throw new Error('Post is not an activity');
    
    // Find the user's participant record
    const participant = postData.participants?.find(p => p.uid === currentUser.uid);
    
    if (!participant) {
      throw new Error('You are not participating in this activity');
    }
    
    // Remove user from participants
    await updateDoc(postRef, {
      participants: arrayRemove(participant)
    });
    
    return true;
  } catch (error) {
    console.error('Error leaving activity:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId: string, content: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    
    const comment: Omit<Comment, 'id'> = {
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
      content,
      timestamp: Timestamp.now()
    };
    
    // Generate a unique ID for the comment
    const commentId = Date.now().toString();
    
    await updateDoc(postRef, {
      comments: arrayUnion({
        id: commentId,
        ...comment
      })
    });
    
    return {
      id: commentId,
      ...comment
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Upload an image to Firebase Storage and get the download URL
export const uploadImage = async (file: File): Promise<string> => {
  try {
    if (!file) throw new Error('No file provided');
    
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Create a unique filename
    const timestamp = new Date().getTime();
    const filename = `${currentUser.uid}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `post_images/${filename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete a post (only by the author)
export const deletePost = async (postId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // First check if the user is the author of the post
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) throw new Error('Post not found');
    
    const postData = postSnap.data() as Post;
    
    if (postData.authorId !== currentUser.uid) {
      throw new Error('You can only delete your own posts');
    }

    // Delete the post
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Mind Wall Functions

// Add a new issue to Mind Wall
export const addMindWallIssue = async (issue: Omit<MindWallIssue, 'id' | 'timestamp' | 'count' | 'votedBy' | 'authorId'>) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const newIssue = {
      ...issue,
      authorId: currentUser.uid,
      timestamp: serverTimestamp(),
      count: 1, // Creator automatically votes
      votedBy: [currentUser.uid]
    };

    const docRef = await addDoc(collection(db, 'mindwall-issues'), newIssue);
    return { id: docRef.id, ...newIssue };
  } catch (error) {
    console.error('Error adding Mind Wall issue:', error);
    throw error;
  }
};

// Get all Mind Wall issues
export const getMindWallIssues = async () => {
  try {
    const q = query(collection(db, 'mindwall-issues'), orderBy('count', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: processTimestamp(doc.data().timestamp)
    })) as MindWallIssue[];
  } catch (error) {
    console.error('Error getting Mind Wall issues:', error);
    throw error;
  }
};

// Vote for a Mind Wall issue
export const voteMindWallIssue = async (issueId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Check debounce with a more user-friendly message
    if (!canVote(`mindwall-${issueId}`)) {
      console.log('Vote debounced, ignoring rapid click');
      return null; // Return null instead of throwing error for rapid clicks
    }

    const issueRef = doc(db, 'mindwall-issues', issueId);
    const issueSnap = await getDoc(issueRef);
    
    if (!issueSnap.exists()) throw new Error('Issue not found');
    
    const issueData = issueSnap.data() as MindWallIssue;
    
    // Check if user has already voted
    if (issueData.votedBy.includes(currentUser.uid)) {
      // Remove vote
      await updateDoc(issueRef, {
        count: increment(-1),
        votedBy: arrayRemove(currentUser.uid)
      });
      return false; // Vote removed
    } else {
      // Add vote
      await updateDoc(issueRef, {
        count: increment(1),
        votedBy: arrayUnion(currentUser.uid)
      });
      return true; // Voted
    }
  } catch (error) {
    console.error('Error voting on Mind Wall issue:', error);
    throw error;
  }
};

// Delete a Mind Wall issue (owner, moderator, or admin only)
export const deleteMindWallIssue = async (issueId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Get the issue to check ownership
    const issueRef = doc(db, 'mindwall-issues', issueId);
    const issueSnap = await getDoc(issueRef);
    
    if (!issueSnap.exists()) throw new Error('Issue not found');
    
    const issueData = issueSnap.data() as MindWallIssue;
    
    // Check if user can delete (owner, moderator, or admin)
    const isOwner = issueData.authorId === currentUser.uid;
    const canDeleteAsModOrAdmin = await isModerator(currentUser.uid);
    
    if (!isOwner && !canDeleteAsModOrAdmin) {
      throw new Error('You do not have permission to delete this issue');
    }

    // Delete the issue
    await deleteDoc(issueRef);
    return true;
  } catch (error) {
    console.error('Error deleting Mind Wall issue:', error);
    throw error;
  }
};

export interface Moderator {
  id: string;
  email: string;
  addedBy: string; // Admin who added this moderator
  addedAt: any;
  isActive: boolean;
}

// Anonymous Complaint interface
export interface AnonymousComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: Timestamp;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Closed';
  adminNotes?: string;
  resolved?: boolean;
}

// Role Management Functions

// Get user role
export const getUserRole = async (userId: string): Promise<string> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role || 'user';
    }
    
    return 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

// Check if user is moderator
export const isModerator = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'moderator' || role === 'admin';
};

// Check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};

// Add a new moderator (admin only)
export const addModerator = async (email: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Check if current user is admin
    const isCurrentUserAdmin = await isAdmin(currentUser.uid);
    if (!isCurrentUserAdmin) {
      throw new Error('Only admins can add moderators');
    }

    // Check if email already exists as moderator
    const moderatorsRef = collection(db, 'moderators');
    const q = query(moderatorsRef, orderBy('addedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const existingModerator = querySnapshot.docs.find(doc => 
      doc.data().email === email && doc.data().isActive
    );
    
    if (existingModerator) {
      throw new Error('User is already a moderator');
    }

    // Add to moderators collection
    const newModerator = {
      email,
      addedBy: currentUser.uid,
      addedAt: serverTimestamp(),
      isActive: true
    };

    const docRef = await addDoc(collection(db, 'moderators'), newModerator);

    // Update user role if they exist in users collection
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef);
    const userSnapshot = await getDocs(userQuery);
    
    const userDoc = userSnapshot.docs.find(doc => doc.data().email === email);
    if (userDoc) {
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: 'moderator'
      });
    }

    return { id: docRef.id, ...newModerator };
  } catch (error) {
    console.error('Error adding moderator:', error);
    throw error;
  }
};

// Get all moderators (admin only)
export const getModerators = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Check if current user is admin
    const isCurrentUserAdmin = await isAdmin(currentUser.uid);
    if (!isCurrentUserAdmin) {
      throw new Error('Only admins can view moderators');
    }

    const q = query(collection(db, 'moderators'), orderBy('addedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      addedAt: processTimestamp(doc.data().addedAt)
    })) as Moderator[];
  } catch (error) {
    console.error('Error getting moderators:', error);
    throw error;
  }
};

// Remove moderator (admin only)
export const removeModerator = async (moderatorId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Check if current user is admin
    const isCurrentUserAdmin = await isAdmin(currentUser.uid);
    if (!isCurrentUserAdmin) {
      throw new Error('Only admins can remove moderators');
    }

    // Get moderator data
    const moderatorRef = doc(db, 'moderators', moderatorId);
    const moderatorSnap = await getDoc(moderatorRef);
    
    if (!moderatorSnap.exists()) {
      throw new Error('Moderator not found');
    }

    const moderatorData = moderatorSnap.data();

    // Deactivate moderator
    await updateDoc(moderatorRef, {
      isActive: false
    });

    // Update user role back to 'user' if they exist in users collection
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef);
    const userSnapshot = await getDocs(userQuery);
    
    const userDoc = userSnapshot.docs.find(doc => doc.data().email === moderatorData.email);
    if (userDoc) {
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: 'user'
      });
    }

    return true;
  } catch (error) {
    console.error('Error removing moderator:', error);
    throw error;
  }
};

// Enhanced delete post function (for moderators and admins)
export const deletePostAsModeratorOrAdmin = async (postId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    // Check if user is moderator or admin
    const canDelete = await isModerator(currentUser.uid);
    if (!canDelete) {
      throw new Error('Only moderators and admins can delete any post');
    }

    // Delete the post
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error('Error deleting post as moderator/admin:', error);
    throw error;
  }
};

// Anonymous Complaints Functions (Admin Only)
export const addAnonymousComplaint = async (complaint: {
  title: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}): Promise<AnonymousComplaint> => {
  try {
    const docRef = await addDoc(collection(db, 'anonymousComplaints'), {
      ...complaint,
      timestamp: serverTimestamp(),
      status: 'Open',
      resolved: false
    });

    return {
      id: docRef.id,
      ...complaint,
      timestamp: Timestamp.now(),
      status: 'Open',
      resolved: false
    } as AnonymousComplaint;
  } catch (error) {
    console.error('Error adding anonymous complaint:', error);
    throw new Error('Failed to submit complaint');
  }
};

export const getAnonymousComplaints = async (): Promise<AnonymousComplaint[]> => {
  try {
    const q = query(
      collection(db, 'anonymousComplaints'),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnonymousComplaint[];
  } catch (error) {
    console.error('Error fetching anonymous complaints:', error);
    throw new Error('Failed to fetch complaints');
  }
};

export const updateComplaintStatus = async (
  complaintId: string, 
  status: 'Open' | 'Under Review' | 'Resolved' | 'Closed',
  adminNotes?: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  try {
    const complaintRef = doc(db, 'anonymousComplaints', complaintId);
    await updateDoc(complaintRef, {
      status,
      adminNotes: adminNotes || '',
      resolved: status === 'Resolved',
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw new Error('Failed to update complaint status');
  }
};

// Auto-deletion function for expired activities
export const deleteExpiredActivities = async () => {
  try {
    const now = new Date();
    
    // Get all activity posts
    const q = query(
      collection(db, 'posts'), 
      where('type', '==', 'activity')
    );
    
    const querySnapshot = await getDocs(q);
    const expiredActivities: string[] = [];
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const activityDate = data.date;
      const activityTime = data.time;
      
      if (activityDate && activityTime) {
        // Parse the activity datetime
        const activityDateTime = new Date(`${activityDate}T${activityTime}`);
        
        // Check if the activity has passed
        if (activityDateTime < now) {
          expiredActivities.push(doc.id);
        }
      }
    });
    
    // Delete expired activities
    const deletePromises = expiredActivities.map(async (activityId) => {
      try {
        await deleteDoc(doc(db, 'posts', activityId));
        console.log(`Deleted expired activity: ${activityId}`);
      } catch (error) {
        console.error(`Error deleting activity ${activityId}:`, error);
      }
    });
    
    await Promise.all(deletePromises);
    
    if (expiredActivities.length > 0) {
      console.log(`Successfully deleted ${expiredActivities.length} expired activities`);
    }
    
    return expiredActivities.length;
  } catch (error) {
    console.error('Error deleting expired activities:', error);
    throw error;
  }
};

// Function to start periodic cleanup
export const startActivityCleanup = () => {
  // Run cleanup immediately
  deleteExpiredActivities();
  
  // Set up periodic cleanup every 10 minutes
  const cleanupInterval = setInterval(() => {
    deleteExpiredActivities();
  }, 10 * 60 * 1000); // 10 minutes
  
  // Return the interval ID so it can be cleared if needed
  return cleanupInterval;
};

// Function to stop periodic cleanup
export const stopActivityCleanup = (intervalId: NodeJS.Timeout) => {
  clearInterval(intervalId);
};

// Manual cleanup trigger - can be called from UI
export const manualCleanupExpiredActivities = async () => {
  try {
    const deletedCount = await deleteExpiredActivities();
    return {
      success: true,
      deletedCount,
      message: deletedCount > 0 
        ? `Successfully cleaned up ${deletedCount} expired activities` 
        : 'No expired activities found'
    };
  } catch (error) {
    console.error('Manual cleanup failed:', error);
    return {
      success: false,
      deletedCount: 0,
      message: 'Failed to clean up expired activities'
    };
  }
}; 
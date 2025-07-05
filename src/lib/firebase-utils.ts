import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  getDoc,
  onSnapshot,
  DocumentReference,
  QuerySnapshot,
  Timestamp,
  FieldValue,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// WhatsApp notification function (imported from WhatsApp bot)
let sendWhatsAppNotification: Function | null = null;

try {
  // Dynamically import the notification function from WhatsApp bot
  if (typeof window === 'undefined') {
    // Only require in Node.js environment
    const whatsappNotifications = eval('require')('../../WhatsapWellness/config/firebase');
  sendWhatsAppNotification = whatsappNotifications.sendComplaintStatusNotification;
  }
} catch (error) {
  console.log('WhatsApp notifications not available in this environment');
  sendWhatsAppNotification = null;
}

// Helper function to ensure timestamp consistency
export const processTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

// Helper function to get user display info
export const getUserDisplayInfo = (userData: any): { displayName: string; realName: string } => {
  if (!userData) return { displayName: 'Unknown User', realName: '' };
  
  const displayName = userData.displayName || userData.email?.split('@')[0] || 'Unknown User';
  const realName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || displayName;
  
  return { displayName, realName };
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface User {
  uid: string;  // Firebase user ID
  email: string;
  displayName?: string;
  firstName?: string;  // Add firstName
  lastName?: string;   // Add lastName
  photoURL?: string;
  isAdmin?: boolean;
  isModerator?: boolean;
  bio?: string;
  createdAt: any;
  lastLogin?: any;  // Add lastLogin
  department?: string;  // Add department field
  role?: 'user' | 'student' | 'moderator' | 'admin' | 'department_head';
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorName?: string;  // Add authorName field for backward compatibility
  timestamp: any;
  isAnonymous: boolean;
}

export interface ActivityParticipant {
  uid: string;  // Change from userId
  displayName: string;  // Change from userName
  email?: string;
  joinedAt: any;
}

export interface Post {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorName?: string;  // Add this field for display names
  timestamp: any;
  category: string;
  upvotes: number;
  downvotes: number;
  votedUsers: string[]; // Keep this for backward compatibility
  upvotedBy: string[];  // Add this for upvote tracking
  downvotedBy: string[]; // Add this for downvote tracking
  comments: Comment[];
  isAnonymous: boolean;
  participants?: ActivityParticipant[];
  maxParticipants?: number;
  date?: any;  // Add date field
  time?: string;  // Add time field
  location?: string;
  imageURL?: string;  // Add imageURL field
  eventType?: 'activity' | 'post';
  type?: 'activity' | 'concern' | 'post' | 'moderator-announcement';  // Add moderator-announcement type
  status?: 'Open' | 'Under Review' | 'Resolved' | 'Closed';  // Add status field for concerns
  title?: string;  // Add title field for activities
  priority?: 'urgent';  // Add priority field for concerns
  visibility?: 'public' | 'moderators';  // Add visibility field for moderator announcements
}

export interface MindWallIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;  // Add icon field
  count: number;  // Change from upvotes to count
  votedBy: string[];  // Change from votedUsers to votedBy
  timestamp: any;  // Change from createdAt to timestamp
  authorId: string;
  isAnonymous?: boolean;
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  updatedAt?: any;
  resolvedAt?: any;
  resolvedBy?: string;
  adminNotes?: string;
}

export interface Moderator {
  id: string;
  userId: string;
  email: string;
  name: string;
  assignedAt: any;
  isActive: boolean;
}

export interface Department {
  id: string;
  code: string;           // Unique department code (e.g., "MSC_AIML")
  name: string;           // Full department name with program detail
  headPhoneNumber: string; // Contact number of department head
  email?: string;         // Add email field for department head login
  createdBy: string;      // Name of admin/faculty who created the entry
  isActive: boolean;      // Whether the department is active or disabled
  createdAt: any;         // Timestamp when the department was created
  updatedAt?: any;
}

export interface DepartmentComplaint {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  departmentId: string;
  departmentCode?: string;  // Added for new schema
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';  // Changed from severity to priority
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  isResolved: boolean;
  createdAt: any;
  updatedAt: any;
  resolvedAt?: any;
  resolvedBy?: string;
  adminNotes?: string;
}

export interface AnonymousComplaint {
  id: string;
  studentPhone?: string; // Hidden from UI, used for responses
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Closed';  // Fix status values
  resolved?: boolean;  // Add resolved field
  timestamp: any;      // Change from createdAt to timestamp for consistency
  createdAt?: any;     // Keep for backward compatibility
  updatedAt: any;
  resolvedAt?: any;
  resolvedBy?: string;
  adminNotes?: string;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const checkUserRole = async (userId: string): Promise<{ isAdmin: boolean; isModerator: boolean }> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        isAdmin: userData.isAdmin || false,
        isModerator: userData.isModerator || false
      };
    }
    return { isAdmin: false, isModerator: false };
  } catch (error) {
    console.error('Error checking user role:', error);
    return { isAdmin: false, isModerator: false };
  }
};

// Check if user is department head by email
export const checkDepartmentHeadStatus = async (email: string): Promise<{ isDepartmentHead: boolean; department?: Department }> => {
  try {
    const deptQuery = query(
      collection(db, 'departments'),
      where('email', '==', email),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(deptQuery);
    
    if (!querySnapshot.empty) {
      const departmentDoc = querySnapshot.docs[0];
      const department: Department = {
        id: departmentDoc.id,
        ...departmentDoc.data()
      } as Department;
      
      return {
        isDepartmentHead: true,
        department
      };
    }
    
    return { isDepartmentHead: false };
  } catch (error) {
    console.error('Error checking department head status:', error);
    return { isDepartmentHead: false };
  }
};

// ============================================================================
// VOTING SYSTEM
// ============================================================================

export const upvotePost = async (postId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    const upvotedBy = postData.upvotedBy || [];
    const downvotedBy = postData.downvotedBy || [];
    const hasUpvoted = upvotedBy.includes(user.uid);
    const hasDownvoted = downvotedBy.includes(user.uid);
    
    let newUpvotedBy = [...upvotedBy];
    let newDownvotedBy = [...downvotedBy];
    let upvoteCount = postData.upvotes || 0;
    let downvoteCount = postData.downvotes || 0;
    
    if (hasUpvoted) {
      // Remove upvote
      newUpvotedBy = upvotedBy.filter((id: string) => id !== user.uid);
      upvoteCount = Math.max(0, upvoteCount - 1);
    } else {
      // Add upvote
      newUpvotedBy.push(user.uid);
      upvoteCount += 1;
      
      // Remove downvote if exists
      if (hasDownvoted) {
        newDownvotedBy = downvotedBy.filter((id: string) => id !== user.uid);
        downvoteCount = Math.max(0, downvoteCount - 1);
      }
    }
    
    await updateDoc(postRef, {
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      upvotedBy: newUpvotedBy,
      downvotedBy: newDownvotedBy,
      votedUsers: [...new Set([...newUpvotedBy, ...newDownvotedBy])] // Update legacy field
    });
    
    return !hasUpvoted; // Return true if user upvoted, false if removed upvote
  } catch (error) {
    console.error('Error upvoting post:', error);
    throw error;
  }
};

export const downvotePost = async (postId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    const upvotedBy = postData.upvotedBy || [];
    const downvotedBy = postData.downvotedBy || [];
    const hasUpvoted = upvotedBy.includes(user.uid);
    const hasDownvoted = downvotedBy.includes(user.uid);
    
    let newUpvotedBy = [...upvotedBy];
    let newDownvotedBy = [...downvotedBy];
    let upvoteCount = postData.upvotes || 0;
    let downvoteCount = postData.downvotes || 0;
    
    if (hasDownvoted) {
      // Remove downvote
      newDownvotedBy = downvotedBy.filter((id: string) => id !== user.uid);
      downvoteCount = Math.max(0, downvoteCount - 1);
    } else {
      // Add downvote
      newDownvotedBy.push(user.uid);
      downvoteCount += 1;
      
      // Remove upvote if exists
      if (hasUpvoted) {
        newUpvotedBy = upvotedBy.filter((id: string) => id !== user.uid);
        upvoteCount = Math.max(0, upvoteCount - 1);
      }
    }
    
    await updateDoc(postRef, {
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      upvotedBy: newUpvotedBy,
      downvotedBy: newDownvotedBy,
      votedUsers: [...new Set([...newUpvotedBy, ...newDownvotedBy])] // Update legacy field
    });
    
    return !hasDownvoted; // Return true if user downvoted, false if removed downvote
  } catch (error) {
    console.error('Error downvoting post:', error);
    throw error;
  }
};

// ============================================================================
// POST MANAGEMENT
// ============================================================================

export const getPosts = async (): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'), 
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as Post));
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

export const addPost = async (postData: Omit<Post, 'id'>): Promise<string> => {
  try {
    // Get current user
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Get user's display name from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    // Use the first available name option
    const displayName = postData.isAnonymous 
      ? 'Anonymous' 
      : userData?.displayName || user.displayName || user.email?.split('@')[0] || 'Unknown User';

    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      author: displayName,  // Set author field
      authorName: displayName,  // Set authorName field for backward compatibility
      authorId: user.uid,
      timestamp: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      votedUsers: [],
      comments: [],
      participants: [],
      type: postData.type || 'post',
      eventType: postData.type === 'activity' ? 'activity' : undefined
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding post:', error);
    throw error;
  }
};

export const updatePost = async (postId: string, updateData: Partial<Post>): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Join activity
export const joinActivity = async (postId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const participants = postData.participants || [];
      
      // Check if user is already participating
      const isAlreadyParticipating = participants.some((p: ActivityParticipant) => p.uid === user.uid);
      
      // Allow joining if maxParticipants is null (unlimited) or if limit not reached
      if (!isAlreadyParticipating && (postData.maxParticipants === null || participants.length < postData.maxParticipants)) {
        const newParticipant: ActivityParticipant = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
          email: user.email || undefined,
          joinedAt: serverTimestamp()
        };
        
        await updateDoc(postRef, {
          participants: [...participants, newParticipant]
        });
      } else if (!isAlreadyParticipating) {
        throw new Error('Activity has reached maximum participants limit');
      }
    }
  } catch (error) {
    console.error('Error joining activity:', error);
    throw error;
  }
};

// Leave activity
export const leaveActivity = async (postId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const participants = postData.participants || [];
      
      const updatedParticipants = participants.filter((p: ActivityParticipant) => p.uid !== user.uid);
      
      await updateDoc(postRef, {
        participants: updatedParticipants
      });
    }
  } catch (error) {
    console.error('Error leaving activity:', error);
    throw error;
  }
};

// Add comment to post
export const addComment = async (
  postId: string, 
  content: string,
  isAnonymous: boolean = false
): Promise<Comment> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const comments = postData.comments || [];
      
      const newComment: Comment = {
        id: Date.now().toString(),
        content,
        author: isAnonymous ? 'Anonymous' : (user.displayName || user.email?.split('@')[0] || 'Unknown User'),
        authorId: user.uid,
        timestamp: serverTimestamp(),
        isAnonymous
      };
      
      await updateDoc(postRef, {
        comments: [...comments, newComment]
      });

      return {
        ...newComment,
        timestamp: new Date() // Return current date for immediate UI update
      };
    }
    throw new Error('Post not found');
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Delete post as moderator or admin
export const deletePostAsModeratorOrAdmin = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error('Error deleting post as moderator/admin:', error);
    throw error;
  }
};

// Upload image
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const imageRef = ref(storage, path);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// ============================================================================
// MIND WALL ISSUES
// ============================================================================

export const getMindWallIssues = async (): Promise<MindWallIssue[]> => {
  try {
    const issuesQuery = query(
      collection(db, 'mindwall-issues'), 
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(issuesQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as MindWallIssue));
  } catch (error) {
    console.error('Error getting mind wall issues:', error);
    return [];
  }
};

export const addMindWallIssue = async (issueData: Omit<MindWallIssue, 'id'>): Promise<MindWallIssue> => {
  try {
    const newIssue = {
      ...issueData,
      timestamp: serverTimestamp(),
      count: 0,
      votedBy: [],
      authorId: auth.currentUser?.uid || '',
      isAnonymous: true
    };
    
    const docRef = await addDoc(collection(db, 'mindwall-issues'), newIssue);
    
    return {
      id: docRef.id,
      ...newIssue,
      timestamp: new Date()  // Return current date for immediate UI update
    } as MindWallIssue;
  } catch (error) {
    console.error('Error adding mind wall issue:', error);
    throw error;
  }
};

// Fix voteMindWallIssue to return proper result and match expected signature
export const voteMindWallIssue = async (issueId: string): Promise<boolean | null> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  // Simple debouncing - return null if called too frequently
  const now = Date.now();
  const lastVoteKey = `lastVote_${issueId}_${userId}`;
  const lastVoteTime = localStorage.getItem(lastVoteKey);
  
  if (lastVoteTime && (now - parseInt(lastVoteTime)) < 1000) {
    return null; // Debounce votes within 1 second
  }
  
  localStorage.setItem(lastVoteKey, now.toString());

  try {
    const issueRef = doc(db, 'mindwall-issues', issueId);
    const issueDoc = await getDoc(issueRef);
    
    if (issueDoc.exists()) {
      const issueData = issueDoc.data();
      const votedBy = issueData.votedBy || [];
      const hasVoted = votedBy.includes(userId);
      
      if (hasVoted) {
        // Remove vote
        await updateDoc(issueRef, {
          count: Math.max(0, (issueData.count || 0) - 1),
          votedBy: votedBy.filter((id: string) => id !== userId)
        });
        return false;
      } else {
        // Add vote
        await updateDoc(issueRef, {
          count: (issueData.count || 0) + 1,
          votedBy: [...votedBy, userId]
        });
        return true;
      }
    }
    return null;
  } catch (error) {
    console.error('Error voting on mind wall issue:', error);
    throw error;
  }
};

// Delete mind wall issue
export const deleteMindWallIssue = async (issueId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'mindwall-issues', issueId));
  } catch (error) {
    console.error('Error deleting mind wall issue:', error);
    throw error;
  }
};

// ============================================================================
// MODERATOR MANAGEMENT
// ============================================================================

export const getModerators = async (): Promise<Moderator[]> => {
  try {
    const moderatorsQuery = query(
      collection(db, 'moderators'), 
      orderBy('assignedAt', 'desc')
    );
    const querySnapshot = await getDocs(moderatorsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as Moderator));
  } catch (error) {
    console.error('Error getting moderators:', error);
    return [];
  }
};

export const addModerator = async (moderatorData: Omit<Moderator, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'moderators'), {
      ...moderatorData,
      assignedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding moderator:', error);
    throw error;
  }
};

// Remove moderator
export const removeModerator = async (moderatorId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'moderators', moderatorId));
  } catch (error) {
    console.error('Error removing moderator:', error);
    throw error;
  }
};

// ============================================================================
// DEPARTMENT MANAGEMENT
// ============================================================================

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const deptQuery = query(
      collection(db, 'departments'), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(deptQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as Department));
  } catch (error) {
    console.error('Error getting departments:', error);
    return [];
  }
};

export const addDepartment = async (departmentData: Omit<Department, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'departments'), {
      ...departmentData,
      createdAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

export const updateDepartment = async (departmentId: string, updateData: Partial<Department>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'departments', departmentId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

// Save department (alias for addDepartment)
export const saveDepartment = async (departmentData: Omit<Department, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'departments'), {
      ...departmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving department:', error);
    throw error;
  }
};

// ============================================================================
// DEPARTMENT COMPLAINT MANAGEMENT
// ============================================================================

export const getDepartmentComplaints = async (): Promise<DepartmentComplaint[]> => {
  try {
    const complaintsQuery = query(
      collection(db, 'departmentComplaints'), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(complaintsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as DepartmentComplaint));
  } catch (error) {
    console.error('Error getting department complaints:', error);
    return [];
  }
};

export const addDepartmentComplaint = async (complaintData: Omit<DepartmentComplaint, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'departmentComplaints'), {
      ...complaintData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'Pending',
      isResolved: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding department complaint:', error);
    throw error;
  }
};

export const updateDepartmentComplaintStatus = async (
  complaintId: string, 
  status: string, 
  notes?: string, 
  resolvedBy?: string
): Promise<void> => {
  try {
    // Get the current complaint data for notification
    const complaintDoc = await getDoc(doc(db, 'departmentComplaints', complaintId));
    const complaintData = complaintDoc.data();
    
    const updateData: any = {
      status,
      isResolved: status === 'Resolved',
      updatedAt: serverTimestamp()
    };
    
    if (notes) {
      updateData.hodNotes = notes;
    }
    
    if (status === 'Resolved' && resolvedBy) {
      updateData.resolvedAt = serverTimestamp();
      updateData.resolvedBy = resolvedBy;
    }
    
    await updateDoc(doc(db, 'departmentComplaints', complaintId), updateData);

    // Send WhatsApp notification if student has phone number
    if (sendWhatsAppNotification && complaintData?.studentPhone) {
      try {
        await sendWhatsAppNotification(
          complaintData.studentPhone,
          {
            department: complaintData.department,
            category: complaintData.category,
            title: complaintData.title
          },
          status,
          notes
        );
      } catch (notificationError) {
        console.log('WhatsApp notification failed, but status update succeeded:', notificationError);
      }
    }
  } catch (error) {
    console.error('Error updating department complaint status:', error);
    throw error;
  }
};

// Get department complaints for specific department (for department heads)
export const getDepartmentComplaintsByDepartment = async (departmentId: string): Promise<DepartmentComplaint[]> => {
  try {
    const complaintsQuery = query(
      collection(db, 'departmentComplaints'),
      where('departmentId', '==', departmentId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(complaintsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as DepartmentComplaint));
  } catch (error) {
    console.error('Error getting department complaints by department:', error);
    return [];
  }
};

// ============================================================================
// ANONYMOUS COMPLAINT MANAGEMENT
// ============================================================================

export const getAnonymousComplaints = async (): Promise<AnonymousComplaint[]> => {
  try {
    const complaintsQuery = query(
      collection(db, 'anonymousComplaints'), 
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(complaintsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as AnonymousComplaint));
  } catch (error) {
    console.error('Error getting anonymous complaints:', error);
    return [];
  }
};

export const addAnonymousComplaint = async (complaintData: Omit<AnonymousComplaint, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'anonymousComplaints'), {
      ...complaintData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),  // Keep for backward compatibility
      updatedAt: serverTimestamp(),
      status: 'Open',  // Use correct status value
      resolved: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding anonymous complaint:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (
  complaintId: string, 
  status: string, 
  adminNotes?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    if (status === 'Resolved') {
      updateData.resolved = true;
      updateData.resolvedAt = serverTimestamp();
      updateData.resolvedBy = auth.currentUser?.uid || '';
    }
    
    await updateDoc(doc(db, 'anonymousComplaints', complaintId), updateData);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw error;
  }
};

// ============================================================================
// ACTIVITY MANAGEMENT
// ============================================================================

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export const deleteExpiredActivities = async (): Promise<void> => {
  try {
    const now = new Date();
    const activitiesQuery = query(
      collection(db, 'posts'),
      where('eventType', '==', 'activity')
    );
    
    const querySnapshot = await getDocs(activitiesQuery);
    const expiredActivities: string[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      if (data.activityDate) {
        const activityDate = processTimestamp(data.activityDate);
        if (activityDate < now) {
          expiredActivities.push(doc.id);
        }
      }
    });
    
    for (const activityId of expiredActivities) {
      await deleteDoc(doc(db, 'posts', activityId));
    }
    
    if (expiredActivities.length > 0) {
      console.log(`Deleted ${expiredActivities.length} expired activities`);
    }
  } catch (error) {
    console.error('Error deleting expired activities:', error);
  }
};

export const startActivityCleanup = (): void => {
  if (cleanupInterval) return;
  
  cleanupInterval = setInterval(() => {
    deleteExpiredActivities();
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
  
  deleteExpiredActivities();
};

export const stopActivityCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}; 
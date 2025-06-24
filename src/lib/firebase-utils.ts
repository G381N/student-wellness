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
  FieldValue
} from 'firebase/firestore';
import { db, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Helper function to ensure timestamp consistency
export const processTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

// Helper function to get user display info
export const getUserDisplayInfo = (email: string | undefined): string => {
  if (!email) return 'Unknown User';
  return email.split('@')[0];
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  isModerator?: boolean;
  bio?: string;
  createdAt: any;
  role?: 'student' | 'moderator' | 'admin' | 'department_head';
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: any;
  isAnonymous: boolean;
}

export interface ActivityParticipant {
  userId: string;
  userName: string;
  joinedAt: any;
}

export interface Post {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: any;
  category: string;
  upvotes: number;
  downvotes: number;
  votedUsers: string[];
  comments: Comment[];
  isAnonymous: boolean;
  participants?: ActivityParticipant[];
  maxParticipants?: number;
  activityDate?: any;
  location?: string;
  eventType?: 'activity' | 'post';
}

export interface MindWallIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  authorId: string;
  isAnonymous: boolean;
  upvotes: number;
  downvotes: number;
  votedUsers: string[];
  createdAt: any;
  updatedAt: any;
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
  name: string;
  description: string;
  isActive: boolean;
  createdAt: any;
  updatedAt?: any;
}

export interface DepartmentHead {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  departmentId: string;
  isActive: boolean;
  createdAt: any;
  updatedAt?: any;
}

export interface DepartmentComplaint {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  departmentId: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed';
  isResolved: boolean;
  createdAt: any;
  updatedAt: any;
  resolvedAt?: any;
  resolvedBy?: string;
  adminNotes?: string;
  hodNotes?: string;
}

export interface AnonymousComplaint {
  id: string;
  studentPhone?: string; // Hidden from UI, used for responses
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
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

// ============================================================================
// VOTING SYSTEM
// ============================================================================

export const upvotePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const votedUsers = postData.votedUsers || [];
      
      if (!votedUsers.includes(userId)) {
        await updateDoc(postRef, {
          upvotes: (postData.upvotes || 0) + 1,
          votedUsers: [...votedUsers, userId]
        });
      }
    }
  } catch (error) {
    console.error('Error upvoting post:', error);
    throw error;
  }
};

export const downvotePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const votedUsers = postData.votedUsers || [];
      
      if (!votedUsers.includes(userId)) {
        await updateDoc(postRef, {
          downvotes: (postData.downvotes || 0) + 1,
          votedUsers: [...votedUsers, userId]
        });
      }
    }
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
    return querySnapshot.docs.map(doc => ({
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
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      timestamp: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      votedUsers: [],
      comments: []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding post:', error);
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
export const joinActivity = async (postId: string, userId: string, userName: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const participants = postData.participants || [];
      
      // Check if user is already participating
      const isAlreadyParticipating = participants.some((p: any) => p.userId === userId);
      
      if (!isAlreadyParticipating && participants.length < (postData.maxParticipants || 10)) {
        const newParticipant = {
          userId,
          userName,
          joinedAt: serverTimestamp()
        };
        
        await updateDoc(postRef, {
          participants: [...participants, newParticipant]
        });
      }
    }
  } catch (error) {
    console.error('Error joining activity:', error);
    throw error;
  }
};

// Leave activity
export const leaveActivity = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const participants = postData.participants || [];
      
      const updatedParticipants = participants.filter((p: any) => p.userId !== userId);
      
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
  comment: Omit<Comment, 'id'>
): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const comments = postData.comments || [];
      
      const newComment = {
        ...comment,
        id: Date.now().toString(),
        timestamp: serverTimestamp()
      };
      
      await updateDoc(postRef, {
        comments: [...comments, newComment]
      });
    }
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
      collection(db, 'mindWallIssues'), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(issuesQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MindWallIssue));
  } catch (error) {
    console.error('Error getting mind wall issues:', error);
    return [];
  }
};

export const addMindWallIssue = async (issueData: Omit<MindWallIssue, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'mindWallIssues'), {
      ...issueData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      votedUsers: []
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding mind wall issue:', error);
    throw error;
  }
};

// Vote on mind wall issue
export const voteMindWallIssue = async (
  issueId: string, 
  userId: string, 
  voteType: 'upvote' | 'downvote'
): Promise<void> => {
  try {
    const issueRef = doc(db, 'mindWallIssues', issueId);
    const issueDoc = await getDoc(issueRef);
    
    if (issueDoc.exists()) {
      const issueData = issueDoc.data();
      const votedUsers = issueData.votedUsers || [];
      
      if (!votedUsers.includes(userId)) {
        const updateData: any = {
          votedUsers: [...votedUsers, userId]
        };
        
        if (voteType === 'upvote') {
          updateData.upvotes = (issueData.upvotes || 0) + 1;
        } else {
          updateData.downvotes = (issueData.downvotes || 0) + 1;
        }
        
        await updateDoc(issueRef, updateData);
      }
    }
  } catch (error) {
    console.error('Error voting on mind wall issue:', error);
    throw error;
  }
};

// Delete mind wall issue
export const deleteMindWallIssue = async (issueId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'mindWallIssues', issueId));
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
    return querySnapshot.docs.map(doc => ({
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
    return querySnapshot.docs.map(doc => ({
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
  return await addDepartment(departmentData);
};

// ============================================================================
// DEPARTMENT HEAD MANAGEMENT
// ============================================================================

export const getDepartmentHeads = async (): Promise<DepartmentHead[]> => {
  try {
    const headsQuery = query(
      collection(db, 'departmentHeads'), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(headsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DepartmentHead));
  } catch (error) {
    console.error('Error getting department heads:', error);
    return [];
  }
};

export const addDepartmentHead = async (headData: Omit<DepartmentHead, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'departmentHeads'), {
      ...headData,
      createdAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding department head:', error);
    throw error;
  }
};

export const removeDepartmentHead = async (headId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'departmentHeads', headId));
  } catch (error) {
    console.error('Error removing department head:', error);
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
    return querySnapshot.docs.map(doc => ({
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
  } catch (error) {
    console.error('Error updating department complaint status:', error);
    throw error;
  }
};

// ============================================================================
// ANONYMOUS COMPLAINT MANAGEMENT
// ============================================================================

export const getAnonymousComplaints = async (): Promise<AnonymousComplaint[]> => {
  try {
    const complaintsQuery = query(
      collection(db, 'anonymousComplaints'), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(complaintsQuery);
    return querySnapshot.docs.map(doc => ({
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'Pending',
      isResolved: false
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
      isResolved: status === 'Resolved',
      updatedAt: serverTimestamp()
    };
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    if (status === 'Resolved') {
      updateData.resolvedAt = serverTimestamp();
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

let cleanupInterval: NodeJS.Timeout | null = null;

export const deleteExpiredActivities = async (): Promise<void> => {
  try {
    const now = new Date();
    const activitiesQuery = query(
      collection(db, 'posts'),
      where('eventType', '==', 'activity')
    );
    
    const querySnapshot = await getDocs(activitiesQuery);
    const expiredActivities: string[] = [];
    
    querySnapshot.forEach((doc) => {
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
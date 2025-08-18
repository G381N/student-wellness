
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export const joinActivity = async (postId: string) => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to join an activity.');
  }
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error('Activity not found.');
  }

  const postData = postSnap.data();
  const participants = postData.participants || [];

  if (
    postData.maxParticipants &&
    participants.length >= postData.maxParticipants
  ) {
    throw new Error('This activity is already full.');
  }

  if (participants.some((p: any) => p.uid === auth.currentUser!.uid)) {
    // User is already a participant, do nothing.
    return;
  }

  await updateDoc(postRef, {
    participants: arrayUnion({
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || 'Anonymous',
      photoURL: auth.currentUser.photoURL,
      joinedAt: new Date(),
    }),
  });
};

export const leaveActivity = async (postId: string) => {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to leave an activity.');
  }
  const postRef = doc(db, 'posts', postId);

  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) {
    throw new Error('Activity not found.');
  }
  const postData = postSnap.data();
  const participantToRemove = (postData.participants || []).find(
    (p: any) => p.uid === auth.currentUser!.uid
  );

  if (!participantToRemove) {
    // User is not a participant, do nothing.
    return;
  }

  await updateDoc(postRef, {
    participants: arrayRemove(participantToRemove),
  });
};

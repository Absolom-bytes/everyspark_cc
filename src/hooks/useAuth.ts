import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Check for Admin status concurrently
          const adminRef = doc(db, 'admins', firebaseUser.uid);
          getDoc(adminRef).then(adminSnap => {
            setIsAdmin(adminSnap.exists());
          }).catch(err => console.error("Admin check failed:", err));

          const profileRef = doc(db, 'users', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            setProfile({ id: profileSnap.id, ...profileSnap.data() } as UserProfile);
          } else {
            // Create initial profile
            const newProfile = {
              displayName: firebaseUser.displayName || 'Anonymous',
              photoURL: firebaseUser.photoURL || '',
              bio: '',
              createdAt: serverTimestamp()
            };
            try {
              await setDoc(profileRef, newProfile);
              // Use local data for immediate feedback since serverTimestamp isn't a date yet
              setProfile({ id: firebaseUser.uid, ...newProfile, createdAt: { toDate: () => new Date() } } as any);
            } catch (err) {
              console.error("Profile creation failed:", err);
            }
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, isAdmin, loading };
}

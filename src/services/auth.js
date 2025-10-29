import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  query,
  where,
  getDocs 
} from 'firebase/firestore';

const OWNER_EMAIL = 'owner@brothergold.com';
const OWNER_PASSWORD = 'B2rother-GoL!D2';

export const AuthService = {
  // Owner login
  async ownerLogin(email, password) {
    try {
      if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Create or update owner document
        const ownerDoc = {
          email: email,
          role: 'owner',
          status: 'approved',
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), ownerDoc, { merge: true });
        
        return { success: true, user: userCredential.user, role: 'owner' };
      } else {
        throw new Error('Invalid owner credentials');
      }
    } catch (error) {
      console.error('Owner login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Manager signup
  async managerSignup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const managerDoc = {
        email: email,
        name: name,
        role: 'manager_pending',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), managerDoc);
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Manager signup error:', error);
      return { success: false, error: error.message };
    }
  },

  // Manager login
  async managerLogin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check user role and status
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      if (userData.role === 'owner') {
        return { success: true, user: userCredential.user, role: 'owner' };
      } else if (userData.role === 'manager' && userData.status === 'approved') {
        return { success: true, user: userCredential.user, role: 'manager', userData };
      } else if (userData.role === 'manager_pending' || userData.status === 'pending') {
        await signOut(auth);
        return { success: false, error: 'Account pending approval' };
      } else {
        await signOut(auth);
        return { success: false, error: 'Unauthorized access' };
      }
    } catch (error) {
      console.error('Manager login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      return { ...user, ...userDoc.data() };
    }
    return null;
  },

  // Get pending managers (for owner)
  async getPendingManagers() {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'manager_pending'),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting pending managers:', error);
      return [];
    }
  }
};
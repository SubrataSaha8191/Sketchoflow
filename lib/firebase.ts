import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAb6WgU1stjkCx_IEz4MyO5r-TzOmmfG2U",
  authDomain: "sketchoflow.firebaseapp.com",
  projectId: "sketchoflow",
  storageBucket: "sketchoflow.firebasestorage.app",
  messagingSenderId: "500974158192",
  appId: "1:500974158192:web:edeef6d9e0e57a2e448fb5",
  measurementId: "G-RWJV1YG5RM"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics (only on client side)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

// Auth Functions

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { user: null, error: getErrorMessage(firebaseError.code) };
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { user: null, error: getErrorMessage(firebaseError.code) };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { user: null, error: getErrorMessage(firebaseError.code) };
  }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return { user: result.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { user: null, error: getErrorMessage(firebaseError.code) };
  }
};

// GitHub Sign In
export const signInWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return { user: result.user, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { user: null, error: getErrorMessage(firebaseError.code) };
  }
};

// Sign Out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { error: getErrorMessage(firebaseError.code) };
  }
};

// Password Reset
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    return { error: getErrorMessage(firebaseError.code) };
  }
};

// Auth State Observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Update User Avatar
export const updateUserAvatar = async (file: File) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: 'No user logged in' };
    }

    // Create a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatars/${user.uid}/avatar.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Update user profile
    await updateProfile(user, { photoURL: downloadURL });

    return { photoURL: downloadURL, error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Avatar upload error:', firebaseError);
    return { photoURL: null, error: 'Failed to upload avatar. Please try again.' };
  }
};

// Remove User Avatar
export const removeUserAvatar = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: 'No user logged in' };
    }

    // Try to delete the old avatar from storage if it exists
    if (user.photoURL && user.photoURL.includes('firebasestorage')) {
      try {
        // Extract the path from the URL
        const urlPath = user.photoURL.split('/o/')[1]?.split('?')[0];
        if (urlPath) {
          const decodedPath = decodeURIComponent(urlPath);
          const oldRef = ref(storage, decodedPath);
          await deleteObject(oldRef);
        }
      } catch {
        // Ignore errors deleting old avatar - it might not exist
        console.log('No previous avatar to delete');
      }
    }

    // Update user profile to remove photo URL
    await updateProfile(user, { photoURL: '' });

    return { error: null };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Avatar removal error:', firebaseError);
    return { error: 'Failed to remove avatar. Please try again.' };
  }
};

// Error message helper
const getErrorMessage = (errorCode?: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Authentication failed, try again.';
    case 'auth/cancelled-popup-request':
      return 'Authentication failed, try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    default:
      return 'An error occurred. Please try again.';
  }
};

export { app, auth, storage, analytics };

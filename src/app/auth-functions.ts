import { auth, googleProvider } from '@/app/firebase-config';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    getAuth,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    UserCredential
} from 'firebase/auth';

export const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result; // Contains user details and token
    } catch (error) {
        console.error("Google login error:", error);
        throw error;
    }
};

export const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const logout = async () => {
    const auth = getAuth();
    try {
        await signOut(auth); // Firebase's signOut method
        console.log('Logged out successfully');
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

export const subscribeToAuthChanges = (callback: (user: unknown) => void) => {
    return onAuthStateChanged(auth, callback);
};
export { auth };


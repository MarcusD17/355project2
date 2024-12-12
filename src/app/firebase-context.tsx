"use client"
// lib/fb-context.tsx


import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase-config'; // Firebase configuration file
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe; // Cleanup on component unmount
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
    {children}
    </AuthContext.Provider>
);
};

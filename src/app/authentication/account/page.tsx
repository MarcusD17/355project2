'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/firebase-context';
import { logout } from '@/app/auth-functions';
import Link from 'next/link'; // Import Link from Next.js

const AccountPage: React.FC = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/authentication/login'); // Redirect to login page if user is not authenticated
        }
    }, [user, loading, router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/'); // Redirect to the home page after logout
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return null; // While waiting for redirect, render nothing
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800">Account</h1>
                <div className="mt-4">
                    <p className="text-gray-600">
                        Welcome, <span className="font-semibold">{user.email}</span>!
                    </p>
                    <p className="mt-2 text-gray-500">UID: {user.uid}</p>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 bg-red-800 text-white font-semibold rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Logout
                    </button>
                </div>
                {/* Links to backend and budget pages */}
                <div className="mt-4 text-center">
                    <Link
                        href="/backend" // Link to the backend page
                        className="text-blue-600 hover:underline block"
                    >
                        Go to Backend
                    </Link>
                    <Link
                        href="/backend/budget" // Link to the backend/budget page
                        className="text-blue-600 hover:underline block mt-2"
                    >
                        Go to Budget Visualizer
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;

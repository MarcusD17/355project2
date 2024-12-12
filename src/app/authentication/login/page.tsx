"use client"; // Ensure this is a client-side component

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuth } from "@/app/firebase-context";
import { auth } from "@/app/firebase-config"; // Import the Firebase auth instance

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [dropdownActive, setDropdownActive] = useState(false); // For dropdown visibility
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Redirect to account page if the user is already logged in
            router.push('/authentication/account');
        }
    }, [user, loading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset error before each attempt

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard'); // Redirect to a protected page (e.g., dashboard)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: unknown) {
            setError('Invalid credentials. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/'); // Redirect to the homepage after logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleDropdown = () => {
        if (dropdownActive) {
            // Navigate directly to account page if dropdown is active
            router.push('authentication/account');
        } else {
            // Otherwise, toggle dropdown visibility
            setDropdownActive(true);
        }
    };

    const closeDropdown = () => setDropdownActive(false);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-gray-800">Login</h1>
                <form onSubmit={handleLogin} className="mt-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        />
                    </div>
                    {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="mt-6 w-full py-3 px-4 bg-red-800 text-white font-semibold rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Login
                    </button>
                </form>

                {user && (
                    <div className="relative mt-6">
                        <button
                            onClick={toggleDropdown}
                            className="w-full py-3 px-4 bg-blue-800 text-white font-semibold rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Account
                        </button>
                        {dropdownActive && (
                            <div
                                className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10"
                                onBlur={closeDropdown}
                            >
                                <ul className="py-1 text-gray-700">
                                    <li
                                        className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => router.push('/account')}
                                    >
                                        Account Page
                                    </li>
                                    <li
                                        className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don&#39;t have an account?{' '}
                    <a href="/authentication/sign-up" className="text-red-800 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

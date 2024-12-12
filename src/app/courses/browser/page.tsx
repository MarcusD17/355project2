'use client'; // Mark this as a client-side component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useFirebasePagination } from "@/app/lib/pagination"; // Updated import

type Course = {
    id: string;
    title: string;
    description: string;
    instructor: string;
    created_at: Date;
};

const CoursesPage = () => {
    const router = useRouter(); // For navigation
    const [redirecting, setRedirecting] = useState<boolean>(false);
    const [fetchedData, setFetchedData] = useState<boolean>(false);

    // Use the Firebase pagination hook
    const {
        items: courses,
        loading,
        currentPage,
        totalPages,
        fetchNextPage,
        fetchPrevPage,
        error
    } = useFirebasePagination<Course>('courses', 15, 'created_at');

    // Authentication and redirection effect
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setRedirecting(true);
                router.push('../authentication/login');
            } else {
                setFetchedData(true);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Loading Skeleton Component
    const SkeletonLoader = () => (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Courses</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(15)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-md rounded-lg p-6 animate-pulse"
                    >
                        <div className="h-8 bg-gray-300 rounded mb-4"></div>
                        <div className="h-4 bg-gray-400 rounded mb-2"></div>
                        <div className="h-3 bg-gray-400 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    // If we are in the process of redirecting, show a loading message
    if (redirecting) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Redirecting to login...</p>
            </div>
        );
    }

    // Show Skeleton Loader only if data is not fetched yet, and prevent flashing between skeleton and content
    if (loading && !fetchedData) {
        return <SkeletonLoader />;
    }

    // Handle course click navigation
    const handleCourseClick = (courseId: string) => {
        router.push(`/courses/${courseId}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Courses</h1>

            {/* Error handling */}
            {error && (
                <div className="text-red-500 text-center mb-4">
                    Error loading courses: {error.message}
                </div>
            )}

            {/* Render actual courses data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() => handleCourseClick(course.id)}
                        className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                    >
                        <h3 className="text-2xl text-gray-500 font-semibold">{course.title}</h3>
                        <p className="text-lg text-gray-500 mt-2">{course.description}</p>
                        <p className="text-sm text-gray-500 mt-2">Instructor: {course.instructor}</p>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={fetchPrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-red-800 text-white rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-white">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={fetchNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-red-800 text-white rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CoursesPage;
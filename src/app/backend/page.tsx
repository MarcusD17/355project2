'use client'; // Mark this as a client-side component

import React, { useState, useCallback } from 'react';
import { db, auth } from '@/app/firebase-config';
import { addDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import SkeletonLoader from "@/app/ui/skeleton-loader";
import { useFirebasePagination } from "@/app/lib/pagination"; // Updated import

interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    created_at?: Date;
}

const AddCoursePage = () => {
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        instructor: '',
    });

    const [coursesToDelete, setCoursesToDelete] = useState<string[]>([]);
    const [user, setUser] = useState<User | null>(null);

    // Use the custom Firebase pagination hook
    const {
        items: courses,
        loading,
        currentPage,
        totalPages,
        fetchNextPage,
        fetchPrevPage,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error
    } = useFirebasePagination<Course>('courses', 15, 'created_at');

    // Authentication state listener
    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const addCourse = useCallback(async () => {
        if (!user) {
            alert('Please log in to add a course');
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'courses'), {
                title: newCourse.title,
                description: newCourse.description,
                instructor: newCourse.instructor,
                created_at: new Date(),
            });
            console.log('Course added with ID: ', docRef.id);
            // No need to manually fetch courses, the hook will handle updates
        } catch (e) {
            console.error('Error adding course: ', e);
        }
    }, [user, newCourse]);

    const removeCourses = useCallback(async () => {
        if (!user) {
            alert('Please log in to remove courses');
            return;
        }

        try {
            for (const courseId of coursesToDelete) {
                const courseRef = doc(db, 'courses', courseId);
                await deleteDoc(courseRef);
                console.log('Course deleted with ID: ', courseId);
            }
            setCoursesToDelete([]);
            // No need to manually fetch courses, the hook will handle updates
        } catch (e) {
            console.error('Error deleting courses: ', e);
        }
    }, [user, coursesToDelete]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCourse({
            ...newCourse,
            [e.target.name]: e.target.value,
        });
    };

    const handleCourseClick = (courseId: string) => {
        setCoursesToDelete((prevCoursesToDelete) => {
            if (prevCoursesToDelete.includes(courseId)) {
                return prevCoursesToDelete.filter(id => id !== courseId);
            } else {
                return [...prevCoursesToDelete, courseId];
            }
        });
    };

    // Handle user sign out
    const handleSignOut = useCallback(() => {
        signOut(auth)
            .then(() => {
                alert('Signed out successfully');
            })
            .catch((error) => {
                console.error('Sign out error:', error);
            });
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 mt-32">
            {user ? (
                <>
                    {/* Add Course Form */}
                    <h2 className="text-2xl text-center font-semibold mb-4">Add a New Course</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            addCourse();
                        }}
                        className="space-y-4"
                    >
                        <input
                            type="text"
                            name="title"
                            value={newCourse.title}
                            onChange={handleChange}
                            placeholder="Course Title"
                            className="w-full p-3 border-2 border-blue-300 text-gray-600 rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            name="description"
                            value={newCourse.description}
                            onChange={handleChange}
                            placeholder="Course Description"
                            className="w-full p-3 border-2 border-blue-300 text-gray-600 rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            name="instructor"
                            value={newCourse.instructor}
                            onChange={handleChange}
                            placeholder="Instructor Name"
                            className="w-full p-3 border-2 border-blue-300 text-gray-600 rounded-lg"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
                        >
                            Add Course
                        </button>
                    </form>
                </>
            ) : (
                <p className="text-center">Please log in to manage courses.</p>
            )}

            {user && (
                <div className="mb-10">
                    <h2 className="text-2xl text-center font-semibold mt-4 mb-4">Remove Courses</h2>
                    <button
                        onClick={removeCourses}
                        className="w-full p-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
                    >
                        Remove Selected Courses
                    </button>

                    {/* Courses Grid */}
                    {loading ? (
                        <SkeletonLoader />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className={`p-4 border-2 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 ${coursesToDelete.includes(course.id) ? 'border-blue-500' : 'border-gray-300'}`}
                                    onClick={() => handleCourseClick(course.id)}
                                >
                                    <div>
                                        <h3 className="text-xl font-semibold">{course.title}</h3>
                                        <p className="text-gray-600">{course.instructor}</p>
                                        <p className="text-sm text-gray-500">{course.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    <div className="flex justify-between mt-4">
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
            )}

            {/* Sign-out button for logged-in users */}
            {user && (
                <button
                    onClick={handleSignOut}
                    className="w-full p-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
                >
                    Sign Out
                </button>
            )}
        </div>
    );
};

export default AddCoursePage;
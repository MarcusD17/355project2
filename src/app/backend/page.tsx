'use client'; // Mark this as a client-side component

import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '@/app/firebase-config';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import SkeletonLoader from "@/app/ui/skeleton-loader";
import Pagination from "@/app/lib/pagination"; // Import Pagination component

interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
}

const AddCoursePage = () => {
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        instructor: '',
    });

    const [courses, setCourses] = useState<Course[]>([]);
    const [coursesToDelete, setCoursesToDelete] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [totalCourses, setTotalCourses] = useState(0);
    const [user, setUser] = useState<User | null>(null); // Properly type user state

    // Fetch the authentication state of the user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Set the user to state when auth state changes
        });
        return unsubscribe; // Cleanup the listener when the component unmounts
    }, []);

    // Fetch courses from Firestore with pagination
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const coursesQuery = query(
                collection(db, 'courses'),
                orderBy('created_at'),
                limit(itemsPerPage),
                startAfter((currentPage - 1) * itemsPerPage)
            );

            const querySnapshot = await getDocs(coursesQuery);
            const coursesData: Course[] = [];
            querySnapshot.forEach((doc) => {
                coursesData.push({ id: doc.id, ...doc.data() } as Course);
            });
            setCourses(coursesData);

            const totalQuery = await getDocs(collection(db, 'courses'));
            setTotalCourses(totalQuery.size);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage]);

    // Fetch courses when the page loads or when page changes
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

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
            fetchCourses();
        } catch (e) {
            console.error('Error adding course: ', e);
        }
    }, [user, newCourse, fetchCourses]);

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
            fetchCourses();
        } catch (e) {
            console.error('Error deleting courses: ', e);
        }
    }, [user, coursesToDelete, fetchCourses]);

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

    // Calculate total number of pages for pagination
    const totalPages = Math.ceil(totalCourses / itemsPerPage);

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
                    <h2 className="text-2xl text-center font-semibold mb-4">Remove Courses</h2>
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
                                    onClick={() => handleCourseClick(course.id)} // Highlight on click
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
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                    />
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

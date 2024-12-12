'use client'; // Mark this as a client-side component

import { useState, useEffect, useCallback} from 'react';
import { useRouter } from 'next/navigation'; // For redirecting
import { db } from '@/app/firebase-config'; // Make sure the path is correct
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Pagination from "@/app/lib/pagination"; // Import Firebase Auth functions

type Course = {
    title: string;
    description: string;
    instructor: string;
    created_at: unknown;
};

const CoursesPage = () => {
    const router = useRouter(); // For navigation
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [redirecting, setRedirecting] = useState<boolean>(false); // To handle fast redirecting
    const [lastVisible, setLastVisible] = useState<unknown>(null); // Last document for pagination
    const [currentPage, setCurrentPage] = useState<number>(1); // Current page number
    const [totalCourses, setTotalCourses] = useState<number>(0); // Total number of courses in the collection

    const coursesPerPage = 15; // Number of courses per page (max 7)

    useEffect(() => {
        // Check if the user is logged in
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setRedirecting(true); // Start the redirect process
                router.push('../authentication/login'); // Redirect to the login page
            } else {
                // If the user is logged in, fetch courses
                fetchTotalCourses();
            }
        });

        return () => unsubscribe(); // Clean up the subscription on unmount
    }, [router]);

    const fetchTotalCourses = useCallback(async () => {
        try {
            const coursesQuery = query(collection(db, 'courses'));
            const querySnapshot = await getDocs(coursesQuery);
            setTotalCourses(querySnapshot.size); // Set the total number of courses
            fetchCourses(); // Ensure this is correctly defined elsewhere
        } catch (error) {
            console.error('Error fetching total courses: ', error);
        }
    }, []); // Add any dependencies if required
 // Add any dependencies if required

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setRedirecting(true); // Start the redirect process
                router.push('../authentication/login'); // Redirect to the login page
            } else {
                fetchTotalCourses(); // Fetch total courses if logged in
            }
        });

        return () => unsubscribe(); // Clean up the subscription on unmount
    }, [router, fetchTotalCourses]);

    const fetchCourses = async () => {
        try {
            setLoading(true);

            let q = query(
                collection(db, 'courses'),
                orderBy('created_at'),
                limit(coursesPerPage)
            );

            if (currentPage > 1 && lastVisible) {
                q = query(
                    collection(db, 'courses'),
                    orderBy('created_at'),
                    startAfter(lastVisible),
                    limit(coursesPerPage)
                );
            }

            const querySnapshot = await getDocs(q);
            const coursesList: Course[] = [];
            querySnapshot.forEach((doc) => {
                coursesList.push(doc.data() as Course);
            });

            setCourses(coursesList);

            // Update lastVisible for pagination
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            setLastVisible(lastDoc);
        } catch (error) {
            console.error('Error fetching courses: ', error);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setLastVisible(null); // Reset lastVisible to load from the start
        fetchCourses();
    };

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCourses / coursesPerPage);

    // Loading Skeleton Component
    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(coursesPerPage)].map((_, index) => (
                <div
                    key={index}
                    className="bg-gray-300 rounded-lg p-6 animate-pulse"
                >
                    <div className="h-8 bg-gray-400 rounded mb-4"></div>
                    <div className="h-4 bg-gray-400 rounded mb-2"></div>
                    <div className="h-3 bg-gray-400 rounded"></div>
                </div>
            ))}
        </div>
    );

    // If we are in the process of redirecting, show a loading message or spinner
    if (redirecting) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Courses</h1>

            {loading ? (
                <SkeletonLoader />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <div
                            key={index}
                            className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-all"
                        >
                            <h3 className="text-2xl text-gray-500 font-semibold">{course.title}</h3>
                            <p className="text-lg text-gray-500 mt-2">{course.description}</p>
                            <p className="text-sm text-gray-500 mt-2">Instructor: {course.instructor}</p>
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
    );
};

export default CoursesPage;

'use client'; // Mark this as a client-side component

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/app/firebase-config';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import SkeletonLoader from "@/app/ui/skeleton-loader";
import Pagination from "@/app/lib/pagination"; // Import Pagination component

// Define the Course type
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

    const [courses, setCourses] = useState<Course[]>([]); // To store fetched courses
    const [coursesToDelete, setCoursesToDelete] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Loading state

    const [currentPage, setCurrentPage] = useState(1); // Current page
    const [itemsPerPage] = useState(15); // Updated items per page to 15
    const [totalCourses, setTotalCourses] = useState(0); // Total number of courses for pagination

    // State to track selected course (for highlighting)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

    // Fetch courses from Firestore with pagination
    const fetchCourses = useCallback(async () => {
        setLoading(true); // Set loading to true while fetching
        try {
            // Pagination logic
            const coursesQuery = query(
                collection(db, 'courses'),
                orderBy('created_at'),
                limit(itemsPerPage),
                startAfter((currentPage - 1) * itemsPerPage)
            );

            const querySnapshot = await getDocs(coursesQuery);
            const coursesData: Course[] = []; // Use the Course type
            querySnapshot.forEach((doc) => {
                coursesData.push({ id: doc.id, ...doc.data() } as Course); // Ensure the data matches the Course type
            });
            setCourses(coursesData);

            // Get total courses for pagination
            const totalQuery = await getDocs(collection(db, 'courses'));
            setTotalCourses(totalQuery.size);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    }, [currentPage, itemsPerPage]); // Dependencies

    // Fetch courses when currentPage changes
    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const addCourse = async () => {
        try {
            const docRef = await addDoc(collection(db, 'courses'), {
                title: newCourse.title,
                description: newCourse.description,
                instructor: newCourse.instructor,
                created_at: new Date(),
            });
            console.log('Course added with ID: ', docRef.id);
            fetchCourses(); // Refresh the course list after adding
        } catch (e) {
            console.error('Error adding course: ', e);
        }
    };

    const removeCourses = async () => {
        try {
            for (const courseId of coursesToDelete) {
                const courseRef = doc(db, 'courses', courseId);
                await deleteDoc(courseRef);
                console.log('Course deleted with ID: ', courseId);
            }
            setCoursesToDelete([]);
            fetchCourses(); // Refresh the course list after deletion
        } catch (e) {
            console.error('Error deleting courses: ', e);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCourse({
            ...newCourse,
            [e.target.name]: e.target.value,
        });
    };

    // Function to handle course selection/deselection (like checkbox)
    const handleCourseClick = (courseId: string) => {
        setCoursesToDelete((prevCoursesToDelete) => {
            if (prevCoursesToDelete.includes(courseId)) {
                // If the course is already selected, remove it from the list
                return prevCoursesToDelete.filter(id => id !== courseId);
            } else {
                // Otherwise, add it to the list
                return [...prevCoursesToDelete, courseId];
            }
        });
    };

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCourses / itemsPerPage);

    return (
        <div className="max-w-4xl mx-auto p-6 mt-32">

            {/* Add Course Form */}
            <div className="mb-10">
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
            </div>

            {/* Remove Course Form */}
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
                    <SkeletonLoader/>
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

                {/* Pagination Controls - Now using the Pagination component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default AddCoursePage;

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';  // Change from useRouter to useParams
import { db } from '@/app/firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

type Course = {
    id: string;
    title: string;
    description: string;
    instructor: string;
    created_at: Timestamp | Date;  // Handle both Timestamp and Date types
};

const CoursePage = () => {
    const params = useParams();  // Use useParams instead of useRouter
    const courseId = params.id as string;  // Get the id from params

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) return;

        const fetchCourse = async () => {
            try {
                const courseRef = doc(db, 'courses', courseId);
                const courseSnapshot = await getDoc(courseRef);

                if (courseSnapshot.exists()) {
                    const courseData = courseSnapshot.data() as Course;
                    // Safely convert timestamp to Date if it's a Firebase Timestamp
                    if (courseData.created_at instanceof Timestamp) {
                        courseData.created_at = courseData.created_at.toDate();
                    }

                    setCourse(courseData);
                } else {
                    setError('Course not found');
                }
            } catch (err) {
                console.error('Error fetching course:', err);
                setError('An error occurred while fetching the course data');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    if (!course) return <div className="text-center py-8 text-gray-500">No course found</div>;

    return (
        <div className="mt-32 max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-semibold text-gray-800 mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <p className="text-gray-700 font-medium">Instructor: <span className="font-normal">{course.instructor}</span></p>
            <p className="text-gray-500 mt-2">
                Created on: <span className="font-medium">{(course.created_at as Date)?.toLocaleDateString()}</span>
            </p>
        </div>
    );
};

export default CoursePage;

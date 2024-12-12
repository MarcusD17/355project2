import { db } from '@/app/firebase-config'; // Adjust the import path
import { collection, addDoc } from 'firebase/firestore';

const addCourse = async () => {
    try {
        const docRef = await addDoc(collection(db, 'courses'), {
            title: 'Introduction to Firebase',
            description: 'Learn how to use Firebase in your apps',
            instructor: 'John Doe',
            created_at: new Date(),
        });
        console.log('Course added with ID: ', docRef.id);
    } catch (e) {
        console.error('Error adding course: ', e);
    }
};

addCourse(); // Call this function to add a course

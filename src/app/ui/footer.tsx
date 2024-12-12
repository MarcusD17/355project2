'use client';

import Link from 'next/link'; // Import Link from Next.js

export default function Footer() {
    return (
        <footer className="bg-red-900 backdrop-blur-sm p-4 text-center text-white fixed left-0 bottom-0 w-full z-50">
            <p>
                &copy; 2024 Our Website. Jahid Hasan, Marcus Dawodu,
                <Link href="/easter-egg" className="relative group inline-block ml-2">
                    <span className="font-bold cursor-pointer">All rights reserved.</span>
                    <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 p-2 bg-gray-700 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Go to the Easter Egg page!
                    </span>
                </Link>
            </p>
        </footer>
    );
}

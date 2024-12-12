import Link from 'next/link';
import { FaUniversity } from "react-icons/fa";
import NavLinks from './nav-links';

export default function Navbar() {
    return (
        <div className="fixed left-0 right-0 p-3 flex bg-red-900 shadow-2xl text-white">
            <div className="flex items-center mr-auto">
                <Link href="/" className="flex items-center">
                    <FaUniversity size="48" className="mr-2" /> {/* Icon */}
                    <span className="text-lg font-semibold">The University of Alexandria</span> {/* Text */}
                </Link>
            </div>
            <NavLinks />
        </div>
    );
}

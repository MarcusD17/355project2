'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HiHome, HiAcademicCap, HiCloud, HiOutlineUserCircle, HiOutlineUser } from 'react-icons/hi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/app/firebase-context';
import { logout } from '@/app/auth-functions';

// Map of links to display in the side navigation.
const links = [
    { name: 'Home', href: '/', icon: HiHome },
    { name: 'Courses', href: '/courses/browser', icon: HiAcademicCap },
    { name: 'Weather', href: '/weather', icon: HiCloud },
];

export default function NavLinks() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth(); // Assuming `loading` is a boolean from useAuth indicating if user data is still loading
    const [dropdownActive, setDropdownActive] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        if (dropdownActive) {
            router.push('/authentication/account');
        } else {
            setDropdownActive(true);
        }
    };

    const closeDropdown = () => {
        setDropdownActive(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            closeDropdown();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        if (dropdownActive) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownActive]);

    useEffect(() => {
        if (dropdownActive) {
            const timer = setTimeout(closeDropdown, 3000);
            return () => clearTimeout(timer);
        }
    }, [dropdownActive]);

    // Early return while loading the user data
    if (loading) {
        return null;  // or you could display a loading spinner here
    }

    return (
        <>
            {links.map((link) => {
                const LinkIcon = link.icon;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'items-center justify-center gap-1 rounded-full bg-red-900 p-3 text-white text-sm font-medium ' +
                            'transition duration-200 hover:bg-red-700 md:flex-none md:justify-start md:p-2 md:px-3',
                            {
                                'bg-red-700': pathname === link.href,
                            }
                        )}
                    >
                        <LinkIcon size={32} />
                        <p className="hidden md:block"></p>
                    </Link>
                );
            })}

            {user ? (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className={clsx(
                            'items-center justify-center gap-1 rounded-full p-3 text-white text-sm font-medium ' +
                            'transition duration-200 hover:bg-red-700 md:flex-none md:justify-start md:p-2 md:px-3'
                        )}
                    >
                        <HiOutlineUserCircle size={32} />  {/* Render this when logged in */}
                        <p className="hidden md:block"></p>
                    </button>

                    {/* Dropdown menu with red theme and smooth animation */}
                    <div
                        className={clsx(
                            'absolute right-0 mt-2 w-48 bg-red-900 text-white border border-red-700 rounded-md shadow-lg z-10',
                            dropdownActive ? 'opacity-100 scale-100 transition-all duration-300' : 'opacity-0 scale-95 pointer-events-none'
                        )}
                    >
                        <ul className="py-1">
                            <li
                                className="block px-4 py-2 hover:bg-red-700 cursor-pointer"
                                onClick={() => router.push('/authentication/account')}
                            >
                                Account Page
                            </li>
                            <li
                                className="block px-4 py-2 hover:bg-red-700 cursor-pointer"
                                onClick={handleLogout}
                            >
                                Logout
                            </li>
                        </ul>
                    </div>
                </div>
            ) : (
                <Link
                    href="/authentication/login"
                    className={clsx(
                        'items-center justify-center gap-1 rounded-full bg-red-900 p-3 text-white text-sm font-medium ' +
                        'transition duration-200 hover:bg-red-700 md:flex-none md:justify-start md:p-2 md:px-3'
                    )}
                >
                    <HiOutlineUser size={32} />  {/* Render this when not logged in */}
                </Link>
            )}
        </>
    );
}

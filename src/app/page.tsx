import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 bg-cover bg-center bg-[linear-gradient(to_right,rgba(186,56,26,0.5),rgba(186,26,92,0.5)),url('/university.jpg')]">
            {/* Header Section */}
            <header className="flex flex-col items-center justify-center text-center mb-10">
                <Image
                    src="/uni-logo.png"
                    alt="University Logo"
                    width={640}
                    height={760}
                    className="mb-4"
                />
                <h1 className="text-5xl font-bold text-white">
                    Welcome to The University of Alexandria
                </h1>
                <p className="text-2xl font-bold text-white mt-2">
                    Empowering your future through education
                </p>
            </header>

            {/* Main Content */}
            <main className="flex flex-col items-center justify-center text-center">
                <p className="text-white text-lg mb-8">
                    Explore our wide range of courses and embark on your academic journey.
                </p>
                <Link
                    href="/courses/browser"
                    className="px-6 py-3 bg-red-800 text-white text-lg rounded-full shadow-md hover:bg-red-900 transition duration-200"
                >
                    Browse Courses
                </Link>
            </main>
        </div>
    );
}

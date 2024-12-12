import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
        {/* Header Section */}
        <header className="text-center mb-12">
          <Image
              src="/uni-logo.png"
              alt="University Logo"
              width={640}
              height={760}
              className="mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to The University of Alexandria
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Empowering your future through education
          </p>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center text-center">
          <p className="text-gray-700 text-lg mb-8">
            Explore our wide range of courses and embark on your academic journey.
          </p>
          <Link
              href="/courses/browser"
              className="px-6 py-3 bg-red-800 text-white text-lg rounded-full shadow-md hover:bg-blue-700 transition duration-200"
          >
            Browse Courses
          </Link>
        </main>
      </div>
  );
}

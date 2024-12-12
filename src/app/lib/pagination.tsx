import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, setCurrentPage }) => {
    if (totalPages <= 1) return null; // Don't show pagination if only one page

    return (
        <div className="flex justify-center items-center mt-6 space-x-3">
            <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-gray-300 text-gray-600 rounded-lg hover:bg-gray-400"
            >
                &lt;
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`p-2 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'} rounded-lg hover:bg-gray-400`}
                >
                    {index + 1}
                </button>
            ))}
            <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-300 text-gray-600 rounded-lg hover:bg-gray-400"
            >
                &gt;
            </button>
        </div>
    );
};

export default Pagination;

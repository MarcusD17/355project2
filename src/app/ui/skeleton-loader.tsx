const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[...Array(15)].map((_, index) => (
            <div key={index} className="bg-gray-300 rounded-lg p-6 animate-pulse">
                <div className="h-8 bg-gray-400 rounded mb-4"></div>
                <div className="h-4 bg-gray-400 rounded mb-2"></div>
                <div className="h-3 bg-gray-400 rounded"></div>
            </div>
        ))}
    </div>
);

export default SkeletonLoader;

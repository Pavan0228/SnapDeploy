import React from "react";

const Dashboard = () => {
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add your dashboard content here */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">
                        Active Hosting
                    </h2>
                    <p className="text-gray-600">
                        Your active hosting services will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

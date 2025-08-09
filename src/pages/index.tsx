import React from 'react';
import Header from '@/components/Header';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to ExpertLink
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Connect with experts and grow your knowledge
                    </p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Get Started
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Home;
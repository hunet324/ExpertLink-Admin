import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">ExpertLink</h1>
                <nav>
                    <ul className="flex space-x-6">
                        <li><Link href="/" className="hover:text-blue-200 transition-colors">Home</Link></li>
                        <li><Link href="/about" className="hover:text-blue-200 transition-colors">About</Link></li>
                        <li><Link href="/contact" className="hover:text-blue-200 transition-colors">Contact</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
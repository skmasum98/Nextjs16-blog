// blog-application/frontend/src/components/SearchBar.jsx
'use client';

import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm); // Call the function passed from the parent
    };

    return (
        <form onSubmit={handleSubmit} className="flex max-w-lg mx-auto mb-10 shadow-lg rounded-lg overflow-hidden">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts by title..."
                className="grow px-5 py-3 text-lg border-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar;
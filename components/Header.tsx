
import React from 'react';

interface HeaderProps {
  currentPage: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onMenuClick }) => {
  return (
    <header className="py-4 flex items-center">
       <button onClick={onMenuClick} className="lg:hidden text-gray-300 hover:text-white mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
       </button>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-100">{currentPage}</h1>
    </header>
  );
};

export default Header;
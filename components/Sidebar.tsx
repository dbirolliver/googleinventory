
import React from 'react';
import type { User } from '../types';

interface SidebarProps {
  currentUser: User;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center space-x-4 px-4 h-12 rounded-lg transition-colors group-hover:justify-start justify-center ${isActive ? 'bg-blue-500/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>
        <div className="shrink-0">{icon}</div>
        <span className="font-medium truncate transition-opacity opacity-0 group-hover:opacity-100 delay-200">{label}</span>
    </button>
);

const ICONS = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    Supplies: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8a2 2 0 110-4h10a2 2 0 110 4H5z" /><path fillRule="evenodd" d="M3 8a2 2 0 012-2h10a2 2 0 110 4H5a2 2 0 01-2-2zm2 2a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H5z" clipRule="evenodd" /></svg>,
    Suppliers: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
    'Supplier Insights': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3zm3 1a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
    'Audit Log': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    'Branch Admin': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    'User Admin': <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>,
};


const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout, currentPage, setCurrentPage, isMobileOpen, setMobileOpen }) => {
    const isAdmin = currentUser.role === 'Admin';
    const NAV_ITEMS = ['Dashboard', 'Supplies', 'Suppliers', 'Supplier Insights', 'Audit Log'];
    const ADMIN_NAV_ITEMS = ['Branch Admin', 'User Admin'];

    const handleNavClick = (page: string) => {
        setCurrentPage(page);
        setMobileOpen(false);
    }
  
    return (
    <aside className={`fixed top-0 left-0 h-screen bg-gray-950/70 backdrop-blur-lg p-4 flex flex-col justify-between border-r border-white/10 z-40
                        group hover:w-64 lg:w-20 transition-all duration-300
                        ${isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div>
        <div className="flex items-center space-x-3 mb-10 h-12 px-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-white truncate transition-opacity opacity-0 group-hover:opacity-100 delay-200">Invo AI</h1>
        </div>
        
        <nav className="space-y-2">
            {NAV_ITEMS.map(item => (
                <NavItem key={item} label={item} icon={ICONS[item as keyof typeof ICONS]} isActive={currentPage === item} onClick={() => handleNavClick(item)} />
            ))}
            {isAdmin && <hr className="border-white/10 my-4" />}
            {isAdmin && ADMIN_NAV_ITEMS.map(item => (
                <NavItem key={item} label={item} icon={ICONS[item as keyof typeof ICONS]} isActive={currentPage === item} onClick={() => handleNavClick(item)} />
            ))}
        </nav>
      </div>
      
      <div>
        <div className="bg-white/10 p-3 rounded-lg mb-4 overflow-hidden">
            <p className="font-bold text-gray-100 text-sm truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-300 truncate transition-opacity opacity-0 group-hover:opacity-100 delay-200">{currentUser.role}</p>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 bg-red-500/20 text-red-300 font-bold h-12 px-4 rounded-lg border border-red-400/50 hover:bg-red-500/40 focus:outline-none focus:ring-4 focus:ring-red-300/50 transition-all duration-300"
        >
          <span className="shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="truncate transition-opacity opacity-0 group-hover:opacity-100 delay-200">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

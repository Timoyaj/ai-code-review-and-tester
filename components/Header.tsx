
import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
    onCloseApp: () => void;
    isExplorerCollapsed: boolean;
    setIsExplorerCollapsed: (isCollapsed: boolean) => void;
    isChatCollapsed: boolean;
    setIsChatCollapsed: (isCollapsed: boolean) => void;
}

const ViewIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ onCloseApp, isExplorerCollapsed, setIsExplorerCollapsed, isChatCollapsed, setIsChatCollapsed }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const showMenu = isExplorerCollapsed || isChatCollapsed;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-20 flex items-center px-4 py-2 select-none">
            <div className="flex items-center space-x-2">
                <button onClick={onCloseApp} className="w-3 h-3 bg-red-500 rounded-full cursor-pointer" aria-label="Close Application"></button>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
             {showMenu && (
                <div className="relative ml-4" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-1 px-2 py-0.5 rounded-md text-sm text-gray-300 hover:bg-gray-700">
                        <ViewIcon />
                        <span>View</span>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1">
                           {isExplorerCollapsed && (
                             <button onClick={() => {setIsExplorerCollapsed(false); setIsMenuOpen(false);}} className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50">Show File Explorer</button>
                           )}
                           {isChatCollapsed && (
                             <button onClick={() => {setIsChatCollapsed(false); setIsMenuOpen(false);}} className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50">Show Agent Chat</button>
                           )}
                        </div>
                    )}
                </div>
            )}
            <div className="flex-grow text-center">
                 <h1 className="text-lg font-medium text-gray-300">
                    CodeSage AI Reviewer
                </h1>
            </div>
             <div className="w-32"></div> {/* Spacer to help with centering */}
        </header>
    );
};

export default Header;

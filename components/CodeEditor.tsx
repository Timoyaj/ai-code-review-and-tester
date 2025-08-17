
import React from 'react';

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    language: string;
    openFiles: string[];
    activeFile: string | null;
    onSelectFile: (path: string) => void;
    onCloseFile: (path: string) => void;
}

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, openFiles, activeFile, onSelectFile, onCloseFile }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            <div className="flex items-center border-b border-gray-700 overflow-x-auto">
                {openFiles.map(path => (
                    <div
                        key={path}
                        onClick={() => onSelectFile(path)}
                        className={`flex items-center justify-between py-2 px-4 cursor-pointer border-r border-gray-700 whitespace-nowrap text-sm
                            ${activeFile === path ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`
                        }
                    >
                        <span className="mr-3" title={path}>{path.split('/').pop()}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseFile(path);
                            }}
                            className="p-0.5 rounded-full hover:bg-gray-600"
                            title={`Close ${path.split('/').pop()}`}
                        >
                            <CloseIcon />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex-grow p-1">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-3 bg-transparent text-gray-300 font-mono resize-none focus:outline-none placeholder-gray-500"
                    placeholder={openFiles.length === 0 ? "Import a file or folder to start editing." : "Select a file to edit..."}
                    aria-label="Code Editor"
                    disabled={!activeFile}
                />
            </div>
        </div>
    );
};

export default CodeEditor;

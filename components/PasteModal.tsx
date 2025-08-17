import React, { useState, useEffect } from 'react';

interface PasteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (filename: string, code: string) => void;
    existingFiles: string[];
}

const PasteModal: React.FC<PasteModalProps> = ({ isOpen, onClose, onImport, existingFiles }) => {
    const [filename, setFilename] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFilename('');
            setCode('');
            setError(null);
        }
    }, [isOpen]);

    const handleImport = () => {
        const trimmedFilename = filename.trim();
        setError(null);
        if (!trimmedFilename) {
            setError("Filename cannot be empty.");
            return;
        }
        if (!code.trim()) {
            setError("Code content cannot be empty.");
            return;
        }
        if (existingFiles.includes(trimmedFilename)) {
            setError("A file with this name already exists. Please choose a different name.");
            return;
        }
        if (trimmedFilename.includes('/') || trimmedFilename.includes('\\')) {
            setError("Filename cannot contain slashes.");
            return;
        }
        onImport(trimmedFilename, code);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all flex flex-col h-[70vh]" role="document">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Paste Code Snippet</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none" aria-label="Close modal">&times;</button>
                </div>
                <div className="flex-grow flex flex-col gap-4 min-h-0">
                    <div>
                        <label htmlFor="filename" className="block text-sm font-medium text-gray-300 mb-2">
                            Filename (e.g., `my-snippet.js`)
                        </label>
                        <input
                            type="text"
                            id="filename"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            placeholder="my-snippet.js"
                            className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                            aria-describedby="error-message"
                        />
                    </div>
                    <div className="flex-grow flex flex-col min-h-0">
                         <label htmlFor="code-content" className="block text-sm font-medium text-gray-300 mb-2">
                            Code Content
                        </label>
                        <textarea
                            id="code-content"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste your code here..."
                            className="w-full h-full p-3 bg-gray-900 border border-gray-600 text-gray-300 font-mono resize-none focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 rounded-md"
                            aria-label="Code Content"
                        />
                    </div>
                </div>
                {error && <p id="error-message" className="text-red-400 text-sm mt-2">{error}</p>}
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={!filename || !code}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-900 disabled:cursor-not-allowed transition flex items-center"
                    >
                        Import Snippet
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasteModal;

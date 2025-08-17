import React, { useState, useEffect } from 'react';
import { fetchCodeFromGitHub } from '../services/githubService';

interface GitHubImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess: (files: Record<string, string>) => void;
}

const GitHubImportModal: React.FC<GitHubImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setUrl('');
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleImport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const files = await fetchCodeFromGitHub(url);
            onImportSuccess(files);
            onClose();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" aria-modal="true" role="dialog">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all" role="document">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Import from GitHub</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none" aria-label="Close modal">&times;</button>
                </div>
                <div>
                    <label htmlFor="github-url" className="block text-sm font-medium text-gray-300 mb-2">
                        Public GitHub File or Folder URL
                    </label>
                    <input
                        type="url"
                        id="github-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://github.com/user/repo/tree/main/src"
                        className="w-full bg-gray-900 border border-gray-600 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        aria-describedby="error-message"
                    />
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
                        disabled={!url || isLoading}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-900 disabled:cursor-not-allowed transition flex items-center"
                    >
                        {isLoading ? (
                             <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>Importing...</>
                        ) : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GitHubImportModal;

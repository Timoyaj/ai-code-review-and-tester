import React, { useMemo } from 'react';
import { diffLines, type Change } from 'diff';

interface DiffViewerProps {
    originalCode: string;
    regeneratedCode: string;
    onAccept: () => void;
    onReject: () => void;
}

const AcceptIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const RejectIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const DiffViewer: React.FC<DiffViewerProps> = ({ originalCode, regeneratedCode, onAccept, onReject }) => {
    const changes = useMemo(() => diffLines(originalCode, regeneratedCode), [originalCode, regeneratedCode]);

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            <div className="p-3 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">Suggested Changes</h2>
                <p className="text-sm text-gray-400">Review the changes below and choose to accept or reject them.</p>
            </div>
            <div className="flex-grow p-4 overflow-auto font-mono text-sm">
                <pre className="whitespace-pre-wrap">
                    <code>
                        {changes.map((part, index) => {
                            const partClass = part.added
                                ? 'bg-green-900/40'
                                : part.removed
                                ? 'bg-red-900/40'
                                : 'bg-transparent';
                            
                            const prefix = part.added ? '+' : part.removed ? '-' : ' ';

                            return (
                                <div key={index} className={partClass}>
                                    {part.value.split('\n').map((line, i, arr) => {
                                        // Don't render the last empty line if the part ends with a newline
                                        if (line === '' && i === arr.length - 1) {
                                            return null;
                                        }
                                        return (
                                            <div key={i}>
                                                <span className="text-gray-500 select-none w-5 inline-block">{prefix}</span>
                                                <span>{line}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </code>
                </pre>
            </div>
            <div className="p-3 border-t border-gray-700 flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onAccept}
                    className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    <AcceptIcon /> Accept Changes
                </button>
                <button
                    onClick={onReject}
                    className="flex-1 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    <RejectIcon /> Reject Changes
                </button>
            </div>
        </div>
    );
};

export default DiffViewer;

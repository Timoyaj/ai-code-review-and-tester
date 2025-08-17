
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../services/agentService';
import Loader from './Loader';

interface AgentChatProps {
    history: Message[];
    onSendMessage: (message: string) => void;
    isThinking: boolean;
    onViewChanges: (suggestion: { filePath: string; newCode: string; }) => void;
    activeFile: string | null;
    onOpenGitHubImport: () => void;
    onOpenFileImport: () => void;
    onOpenFolderImport: () => void;
    onOpenPasteModal: () => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

const WandIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.121l.672-.388a1 1 0 011.342 1.342l-.388.672H15a1 1 0 010 2h-1.121l.388.672a1 1 0 01-1.342 1.342l-.672-.388V10a1 1 0 11-2 0V8.879l-.672.388a1 1 0 01-1.342-1.342l.388-.672H7a1 1 0 010-2h1.121l-.388-.672a1 1 0 011.342-1.342l.672.388V2a1 1 0 01.7-.954zM10 12a1 1 0 011 1v6a1 1 0 11-2 0v-6a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const GithubIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>);
const FileUploadIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6-11a1 1 0 011 1v7a1 1 0 11-2 0V7a1 1 0 011-1zm3.293 2.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L12 10.414V13a1 1 0 11-2 0v-2.586l-.293.293a1 1 0 01-1.414-1.414l2-2z" clipRule="evenodd" /><path d="M5 4a1 1 0 011-1h8a1 1 0 011 1v1a1 1 0 01-1 1H6a1 1 0 01-1-1V4z" /></svg>);
const FolderUploadIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V7m0 4v2m-2-2h4" /></svg>);
const PasteIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>);
const CollapseChatIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>);


const AgentMessage: React.FC<{ message: Message, onViewChanges: (suggestion: { filePath: string; newCode: string; }) => void }> = ({ message, onViewChanges }) => {
    const formattedContent = message.content.split('```').map((part, index) => {
        if (index % 2 === 1) { // This is a code block
            const codeContent = part.startsWith('json\n') ? part.substring(5) : part;
            return (
                <pre key={index} className="bg-gray-900 rounded-md p-4 my-4 overflow-x-auto">
                    <code className="text-sm font-mono">{codeContent.trim()}</code>
                </pre>
            );
        }
        // This is regular text
        return part.split('\n').map((line, lineIndex) => {
            if (line.startsWith('### ')) {
                return <h3 key={`${index}-${lineIndex}`} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={`${index}-${lineIndex}`} className="text-xl font-bold mt-6 mb-3 border-b border-gray-600 pb-2">{line.substring(3)}</h2>;
            }
            if (line.startsWith('* ')) {
                return <li key={`${index}-${lineIndex}`} className="ml-5 list-disc">{line.substring(2)}</li>;
            }
            return <p key={`${index}-${lineIndex}`} className="my-1 whitespace-pre-wrap">{line}</p>;
        });
    });

    return (
        <div className="flex items-start space-x-3 my-4">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div className="flex-1 bg-gray-700 rounded-lg p-3 text-sm">
                {formattedContent}
                {message.type === 'suggestion' && message.suggestion && (
                     <div className="mt-4 pt-3 border-t border-gray-600">
                        <button
                            onClick={() => onViewChanges(message.suggestion!)}
                            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        >
                           <WandIcon /> View & Apply Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
};

const QuickActionButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button onClick={onClick} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-full transition-colors">
        {children}
    </button>
);


const AgentChat: React.FC<AgentChatProps> = ({ history, onSendMessage, isThinking, onViewChanges, activeFile, onOpenGitHubImport, onOpenFileImport, onOpenFolderImport, onOpenPasteModal, setIsCollapsed }) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const hasFiles = !!activeFile;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isThinking]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    {hasFiles && <button onClick={() => setIsCollapsed(true)} title="Collapse Chat" className="text-gray-400 hover:text-white transition"><CollapseChatIcon /></button> }
                    <h2 className="text-lg font-semibold text-white">CodeSage Agent</h2>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={onOpenGitHubImport} title="Import from GitHub" className="text-gray-400 hover:text-white transition"><GithubIcon /></button>
                    <button onClick={onOpenFileImport} title="Import from file" className="text-gray-400 hover:text-white transition"><FileUploadIcon /></button>
                    <button onClick={onOpenFolderImport} title="Import folder" className="text-gray-400 hover:text-white transition"><FolderUploadIcon /></button>
                    <button onClick={onOpenPasteModal} title="Paste code snippet" className="text-gray-400 hover:text-white transition"><PasteIcon /></button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {history.map((msg, index) => {
                    if (msg.role === 'user') {
                        return (<div key={index} className="flex justify-end my-2"><div className="bg-cyan-600 rounded-lg p-3 text-sm max-w-lg"><p className="whitespace-pre-wrap">{msg.content}</p></div></div>)
                    }
                    if (msg.role === 'agent') {
                        return <AgentMessage key={index} message={msg} onViewChanges={onViewChanges} />
                    }
                     if (msg.role === 'system') {
                        return (<div key={index} className="text-center my-3"><span className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded-full">{msg.content}</span></div>)
                    }
                    return null;
                })}
                {isThinking && (
                    <div className="flex items-start space-x-3 my-4">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm">A</div>
                        <div className="flex-1 bg-gray-700 rounded-lg p-3 text-sm flex items-center space-x-2">
                           <Loader />
                           <span>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-gray-700">
                {hasFiles && <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <QuickActionButton onClick={() => onSendMessage('Review the entire project.')}>Review Project</QuickActionButton>
                    <QuickActionButton onClick={() => onSendMessage(`Find potential bugs in ${activeFile || 'the current file'}.`)}>Find Bugs</QuickActionButton>
                    <QuickActionButton onClick={() => onSendMessage(`Write unit tests for ${activeFile || 'the current file'}.`)}>Write Tests</QuickActionButton>
                </div>}
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask CodeSage a question..."
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 pr-20 resize-none focus:ring-cyan-500 focus:border-cyan-500"
                        rows={2}
                        disabled={isThinking}
                    />
                    <button onClick={handleSend} disabled={isThinking || !input.trim()} className="absolute right-2 bottom-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-900 disabled:cursor-not-allowed text-white font-bold py-1.5 px-3 rounded-md transition-colors text-sm">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentChat;


import React, { useState, useMemo, useEffect, useRef } from 'react';
import JSZip from 'jszip';

// --- Icons ---
const FileIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
const FolderIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">{isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />}</svg>);
const DownloadIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const NewFileIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>);
const NewFolderIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>);
const CollapseIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);
const RenameIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>);
const DeleteIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const AddIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>);


// --- Types ---
interface FileTreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children: FileTreeNode[];
}

interface FileExplorerProps {
    files: Record<string, string>;
    selectedNode: string | null;
    onSelectFile: (path: string) => void;
    onSelectNode: (path: string) => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
    onCreateNode: (type: 'file' | 'folder') => void;
    onRenameNode: (path: string, isFolder: boolean) => void;
    onDeleteNode: (path: string, isFolder: boolean) => void;
    onMoveNode: (draggedPath: string, dropTargetPath: string) => void;
}

// --- Helper Functions ---
const buildFileTree = (files: Record<string, string>): FileTreeNode[] => {
    const root: { [key: string]: FileTreeNode } = {};

    Object.keys(files).sort().forEach(path => {
        const parts = path.split('/');
        let currentNode = root;

        parts.forEach((part, index) => {
            if (!part) return;
            const isLastPart = index === parts.length - 1;
            const currentPath = parts.slice(0, index + 1).join('/');

            if (!currentNode[part]) {
                const isFile = isLastPart && !path.endsWith('/.gitkeep');
                currentNode[part] = {
                    name: part,
                    path: currentPath,
                    type: isFile ? 'file' : 'folder',
                    children: [],
                };
            }
            if (!isLastPart) {
                currentNode = (currentNode[part].children as any);
            }
        });
    });

    const treeToArray = (node: { [key: string]: FileTreeNode }): FileTreeNode[] => {
        return Object.values(node).map(child => ({
            ...child,
            children: child.children ? treeToArray(child.children as any) : [],
        }));
    };
    
    return treeToArray(root);
};


// --- Sub-components ---
const TreeNodeComponent: React.FC<{
    node: FileTreeNode;
    level: number;
    openFolders: Set<string>;
    toggleFolder: (path: string) => void;
    selectedNode: string | null;
    onSelectFile: (path: string) => void;
    onSelectNode: (path: string) => void;
    onRenameNode: (path: string, isFolder: boolean) => void;
    onDeleteNode: (path: string, isFolder: boolean) => void;
    setDraggedItem: (path: string | null) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, dropTargetNode: FileTreeNode) => void;
}> = ({ node, level, ...props }) => {

    const isFolder = node.type === 'folder';
    const isOpen = isFolder && props.openFolders.has(node.path);
    const isSelected = props.selectedNode === node.path;
    const [isHovered, setIsHovered] = useState(false);
    const [isDropTarget, setIsDropTarget] = useState(false);

    const handleClick = () => {
        if (isFolder) {
            props.toggleFolder(node.path);
        } else {
            props.onSelectFile(node.path);
        }
        props.onSelectNode(node.path);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        props.setDraggedItem(node.path);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFolder) {
            setIsDropTarget(true);
        }
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropTarget(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropTarget(false);
        props.handleDrop(e, node);
    };

    return (
        <div>
            <div
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                draggable
                onDragStart={handleDragStart}
                className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-sm
                    ${isSelected ? 'bg-cyan-600/30' : 'hover:bg-gray-700/50'}
                    ${isDropTarget ? 'outline outline-1 outline-cyan-400' : ''}`
                }
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                <div className="flex items-center truncate">
                    {isFolder ? <FolderIcon isOpen={isOpen} /> : <FileIcon />}
                    <span className="truncate">{node.name}</span>
                </div>
                 {isHovered && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); props.onRenameNode(node.path, isFolder); }} title="Rename" className="text-gray-400 hover:text-white"><RenameIcon /></button>
                        <button onClick={(e) => { e.stopPropagation(); props.onDeleteNode(node.path, isFolder); }} title="Delete" className="text-gray-400 hover:text-white"><DeleteIcon /></button>
                    </div>
                )}
            </div>
            {isOpen && node.children.map(child => (
                <TreeNodeComponent key={child.path} node={child} level={level + 1} {...props} />
            ))}
        </div>
    );
};


// --- Main Component ---
const FileExplorer: React.FC<FileExplorerProps> = (props) => {
    const { files, setIsCollapsed, onCreateNode, onMoveNode } = props;
    const fileTree = useMemo(() => buildFileTree(files), [files]);
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
                setIsAddMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleFolder = (path: string) => {
        setOpenFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    const handleDownload = async () => {
        const zip = new JSZip();
        Object.entries(files).forEach(([path, content]) => {
            // Don't include the placeholder for empty folders
            if (!path.endsWith('.gitkeep')) {
                zip.file(path, content);
            }
        });
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "codesage-project.zip";
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropTargetNode: FileTreeNode) => {
        if (draggedItem && dropTargetNode.type === 'folder' && draggedItem !== dropTargetNode.path) {
            onMoveNode(draggedItem, dropTargetNode.path);
        }
        setDraggedItem(null);
    };

    const treeNodeProps = {
        ...props,
        openFolders,
        toggleFolder,
        setDraggedItem,
        handleDrop,
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center select-none">
                <h2 className="text-lg font-semibold text-white">Explorer</h2>
                <div className="flex items-center space-x-2">
                    <div className="relative" ref={addMenuRef}>
                        <button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} title="Add File or Folder" className="text-gray-400 hover:text-white transition"><AddIcon /></button>
                        {isAddMenuOpen && (
                             <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg py-1 z-10">
                                <button onClick={() => {onCreateNode('file'); setIsAddMenuOpen(false);}} className="w-full flex items-center text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50"><NewFileIcon /> New File</button>
                                <button onClick={() => {onCreateNode('folder'); setIsAddMenuOpen(false);}} className="w-full flex items-center text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700/50"><NewFolderIcon /> New Folder</button>
                            </div>
                        )}
                    </div>
                    <button onClick={handleDownload} title="Download Project as .zip" className="text-gray-400 hover:text-white transition"><DownloadIcon /></button>
                    <button onClick={() => setIsCollapsed(true)} title="Collapse Explorer" className="text-gray-400 hover:text-white transition"><CollapseIcon /></button>
                </div>
            </div>
            <div className="flex-grow p-2 overflow-y-auto">
                {fileTree.map(node => (
                    <TreeNodeComponent key={node.path} node={node} level={0} {...treeNodeProps} />
                ))}
            </div>
        </div>
    );
};

export default FileExplorer;
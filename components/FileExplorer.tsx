
import React, { useState, useMemo, useEffect } from 'react';
import JSZip from 'jszip';

// --- Icons ---
const FileIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
const FolderIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">{isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />}</svg>);
const DownloadIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>);
const NewFileIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" /></svg>);
const NewFolderIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V7m-2 2h4" /></svg>);
const CollapseIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>);
const RenameIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>);
const DeleteIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);


interface FileExplorerProps {
  files: Record<string, string>;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  onCreateNode: (path: string, type: 'file' | 'folder') => void;
  onRenameNode: (path: string, isFolder: boolean) => void;
  onDeleteNode: (path: string, isFolder: boolean) => void;
  onMoveNode: (draggedPath: string, dropTargetPath: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  children?: Record<string, TreeNode>;
}

const buildFileTree = (files: Record<string, string>): Record<string, TreeNode> => {
    const tree: Record<string, TreeNode> = {};
    Object.keys(files).sort().forEach(path => {
        let currentLevel = tree;
        const parts = path.split('/');
        parts.forEach((part, index) => {
            if (!currentLevel[part]) {
                const isFile = index === parts.length - 1 && part !== '.gitkeep';
                if (part === '.gitkeep') return;
                currentLevel[part] = {
                    name: part,
                    path: parts.slice(0, index + 1).join('/'),
                    ...(isFile ? {} : { children: {} }),
                };
            }
            if (currentLevel[part]?.children) {
                 currentLevel = currentLevel[part].children!;
            }
        });
    });
    return tree;
};

const TreeNodeComponent: React.FC<{
    node: TreeNode,
    activeFile: string | null,
    onSelectFile: (path: string) => void,
    level: number,
    openFolders: Record<string, boolean>,
    toggleFolder: (path: string) => void,
    onRenameNode: (path: string, isFolder: boolean) => void,
    onDeleteNode: (path: string, isFolder: boolean) => void,
    onMoveNode: (draggedPath: string, dropTargetPath: string) => void,
}> = ({ node, activeFile, onSelectFile, level, openFolders, toggleFolder, onRenameNode, onDeleteNode, onMoveNode }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDropTarget, setIsDropTarget] = useState(false);
    const isFolder = !!node.children;
    const isOpen = openFolders[node.path] ?? false;

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', node.path);
        e.stopPropagation();
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFolder) setIsDropTarget(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.stopPropagation();
        setIsDropTarget(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropTarget(false);
        if (!isFolder) return;
        const draggedPath = e.dataTransfer.getData('text/plain');
        if (draggedPath && draggedPath !== node.path) {
            onMoveNode(draggedPath, node.path);
        }
    };

    return (
        <li
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-md ${isDropTarget ? 'bg-cyan-800/50' : ''}`}
            draggable="true"
            onDragStart={handleDragStart}
        >
            <div
                onClick={isFolder ? () => toggleFolder(node.path) : () => onSelectFile(node.path)}
                className={`w-full text-left px-3 py-1.5 text-sm truncate transition-colors flex items-center justify-between rounded-md cursor-pointer ${
                    activeFile === node.path
                        ? 'bg-cyan-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700/50'
                }`}
                style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
                title={node.path}
            >
                <div className="flex items-center truncate">
                    {isFolder ? <FolderIcon isOpen={isOpen} /> : <FileIcon />}
                    <span className="truncate">{node.name}</span>
                </div>
                {isHovered && (
                    <div className="flex items-center space-x-2 pr-1">
                        <button onClick={(e) => { e.stopPropagation(); onRenameNode(node.path, isFolder);}} title="Rename" className="text-gray-400 hover:text-white"><RenameIcon/></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteNode(node.path, isFolder);}} title="Delete" className="text-gray-400 hover:text-white"><DeleteIcon/></button>
                    </div>
                )}
            </div>
            {isFolder && isOpen && (
                <ul>
                    {Object.values(node.children!).sort((a, b) => {
                        if (a.children && !b.children) return -1;
                        if (!a.children && b.children) return 1;
                        return a.name.localeCompare(b.name);
                    }).map(childNode => (
                        <TreeNodeComponent
                            key={childNode.path}
                            node={childNode}
                            activeFile={activeFile}
                            onSelectFile={onSelectFile}
                            level={level + 1}
                            openFolders={openFolders}
                            toggleFolder={toggleFolder}
                            onRenameNode={onRenameNode}
                            onDeleteNode={onDeleteNode}
                            onMoveNode={onMoveNode}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const FileExplorer: React.FC<FileExplorerProps> = (props) => {
    const { files, activeFile, onSelectFile, setIsCollapsed, onCreateNode } = props;
    const fileTree = useMemo(() => buildFileTree(files), [files]);
    const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const topLevelFolders = Object.values(fileTree)
            .filter(node => !!node.children)
            .reduce((acc, node) => ({...acc, [node.path]: true }), {});
        setOpenFolders(prev => ({ ...prev, ...topLevelFolders}));
    }, [fileTree]);

    const toggleFolder = (path: string) => {
        setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const handleDownload = async () => {
        if (Object.keys(files).length === 0) return;
        const zip = new JSZip();
        for (const path in files) {
            zip.file(path, files[path]);
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'codesage-project.zip';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">File Explorer</h2>
                <div className="flex items-center space-x-2 text-gray-400">
                    <button onClick={() => onCreateNode('', 'file')} title="New File" className="hover:text-white"><NewFileIcon /></button>
                    <button onClick={() => onCreateNode('', 'folder')} title="New Folder" className="hover:text-white"><NewFolderIcon /></button>
                    <button onClick={handleDownload} title="Download project as .zip" disabled={Object.keys(files).length === 0} className="hover:text-white disabled:text-gray-600"><DownloadIcon /></button>
                    <button onClick={() => setIsCollapsed(true)} title="Collapse Explorer" className="hover:text-white"><CollapseIcon /></button>
                </div>
            </div>
            <div className="flex-grow p-2 overflow-y-auto">
                {Object.keys(fileTree).length > 0 ? (
                    <ul>
                        {Object.values(fileTree).sort((a, b) => {
                            if (a.children && !b.children) return -1;
                            if (!a.children && b.children) return 1;
                            return a.name.localeCompare(b.name);
                        }).map(node => (
                            <TreeNodeComponent 
                                key={node.path}
                                node={node}
                                activeFile={activeFile}
                                onSelectFile={onSelectFile}
                                level={0}
                                openFolders={openFolders}
                                toggleFolder={toggleFolder}
                                onRenameNode={props.onRenameNode}
                                onDeleteNode={props.onDeleteNode}
                                onMoveNode={props.onMoveNode}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-gray-500 p-4 text-sm">No files imported.</div>
                )}
            </div>
        </div>
    );
};

export default FileExplorer;

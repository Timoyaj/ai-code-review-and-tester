
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import FileExplorer from './components/FileExplorer';
import GitHubImportModal from './components/GitHubImportModal';
import PasteModal from './components/PasteModal';
import DiffViewer from './components/DiffViewer';
import AgentChat from './components/AgentChat';
import { sendMessageToAgent, parseAgentResponse, Message } from './services/agentService';
import { LANGUAGE_EXTENSIONS } from './constants';


const App: React.FC = () => {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('Text');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [agentIsThinking, setAgentIsThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [diffData, setDiffData] = useState<{ original: string; regenerated: string; filePath: string; } | null>(null);
  const [isExplorerCollapsed, setIsExplorerCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const code = currentFile ? files[currentFile] ?? '' : '';

  const getLanguageFromExtension = (filename: string): string => {
    const extension = filename.split('?')[0].split('.').pop()?.toLowerCase();
    return extension ? LANGUAGE_EXTENSIONS[extension] || 'Text' : 'Text';
  };

  const handleFileSelect = useCallback((path: string | null) => {
    if (path && files[path] !== undefined) {
        if (!openFiles.includes(path)) {
            setOpenFiles(prev => [...prev, path]);
        }
        setCurrentFile(path);
        setSelectedNode(path); // Sync selection
        const detectedLanguage = getLanguageFromExtension(path);
        setLanguage(detectedLanguage);
    } else if (path === null) {
        setCurrentFile(null);
        setSelectedNode(null);
    }
  }, [files, openFiles]);

  const handleNodeSelect = useCallback((path: string) => {
    setSelectedNode(path);
  }, []);

  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem('codeSage_files');
      const savedOpenFiles = localStorage.getItem('codeSage_openFiles');
      const savedCurrentFile = localStorage.getItem('codeSage_currentFile');
      const savedChatHistory = localStorage.getItem('codeSage_chatHistory');

      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles);
        if (Object.keys(parsedFiles).length > 0) {
            setFiles(parsedFiles);
            
            const parsedOpenFiles = savedOpenFiles ? JSON.parse(savedOpenFiles) : [];
            setOpenFiles(parsedOpenFiles);

            if (savedCurrentFile && parsedOpenFiles.includes(savedCurrentFile) && parsedFiles[savedCurrentFile] !== undefined) {
                handleFileSelect(savedCurrentFile);
            } else if (parsedOpenFiles.length > 0) {
                const firstValidOpenFile = parsedOpenFiles.find((f:string) => parsedFiles[f] !== undefined);
                handleFileSelect(firstValidOpenFile || Object.keys(parsedFiles).sort()[0]);
            } else if (Object.keys(parsedFiles).length > 0) {
                handleFileSelect(Object.keys(parsedFiles).sort()[0]);
            }
        }
      }

      if (savedChatHistory) {
        setChatHistory(JSON.parse(savedChatHistory));
      } else {
        setChatHistory([{
            role: 'agent',
            type: 'text',
            content: "Hello! I'm CodeSage, your AI code assistant. Import a repository or start writing code. Then, ask me to review it, find bugs, or generate tests!"
        }]);
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (Object.keys(files).length > 0) {
        localStorage.setItem('codeSage_files', JSON.stringify(files));
        localStorage.setItem('codeSage_openFiles', JSON.stringify(openFiles));
        localStorage.setItem('codeSage_currentFile', currentFile || '');
      } else {
        localStorage.removeItem('codeSage_files');
        localStorage.removeItem('codeSage_openFiles');
        localStorage.removeItem('codeSage_currentFile');
      }
      localStorage.setItem('codeSage_chatHistory', JSON.stringify(chatHistory));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [files, openFiles, currentFile, chatHistory]);
  
  const handleCodeChange = (newCode: string) => {
    if (currentFile) {
      setFiles(prev => ({ ...prev, [currentFile]: newCode }));
    }
  };

  const handleImportSuccess = (importedFiles: Record<string, string>) => {
    if (Object.keys(importedFiles).length > 0) {
      const mergedFiles = { ...files, ...importedFiles };
      setFiles(mergedFiles);
      const firstFile = Object.keys(importedFiles).sort()[0];
      handleFileSelect(firstFile);
      setChatHistory(prev => [...prev, { role: 'system', type: 'text', content: `Imported ${Object.keys(importedFiles).length} files.` }]);
    } else {
      setError("The imported folder is empty or no files could be read.");
    }
  };

  const handlePasteSuccess = (filename: string, code: string) => {
      const newFiles = { ...files, [filename]: code };
      setFiles(newFiles);
      handleFileSelect(filename);
      setChatHistory(prev => [...prev, { role: 'system', type: 'text', content: `Added new file from paste: ${filename}.` }]);
      setIsPasteModalOpen(false);
  };

  const handleCloseFile = (filePathToClose: string) => {
      const fileIndex = openFiles.indexOf(filePathToClose);
      if (fileIndex === -1) return;
  
      const newOpenFiles = openFiles.filter(p => p !== filePathToClose);
      setOpenFiles(newOpenFiles);
  
      if (filePathToClose !== currentFile) {
          return;
      }
  
      if (newOpenFiles.length === 0) {
          setCurrentFile(null);
          setLanguage('Text');
          setSelectedNode(null); // Also clear selection
      } else {
          const newIndex = Math.max(0, fileIndex - 1);
          const newFileToOpen = newOpenFiles[newIndex];
          handleFileSelect(newFileToOpen);
      }
  };

  const handleFileImportClick = () => fileInputRef.current?.click();
  const handleFolderImportClick = () => folderInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
          const newFiles: Record<string, string> = {};
          const readerPromises = Array.from(selectedFiles).map(file => {
              return new Promise<void>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                      const text = e.target?.result;
                      if (typeof text === 'string') {
                          newFiles[file.name] = text;
                      }
                      resolve();
                  };
                  reader.onerror = reject;
                  reader.readAsText(file);
              });
          });
          Promise.all(readerPromises).then(() => {
              handleImportSuccess(newFiles);
          });
      }
      if(event.target) event.target.value = '';
  };

  const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = event.target.files;
    if (inputFiles && inputFiles.length > 0) {
        const fileMap: Record<string, string> = {};
        await Promise.all(
            Array.from(inputFiles).map(file => {
                return new Promise<void>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        const text = e.target?.result;
                        if (typeof text === 'string') {
                            const path = (file as any).webkitRelativePath || file.name;
                            fileMap[path] = text;
                        }
                        resolve();
                    };
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
            })
        );
        handleImportSuccess(fileMap);
    }
    if (event.target) event.target.value = '';
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const newUserMessage: Message = { role: 'user', type: 'text', content: message };
    const currentChatHistory = [...chatHistory, newUserMessage];
    
    setChatHistory([...currentChatHistory, { role: 'agent', type: 'text', content: '' }]);
    setAgentIsThinking(true);
    setError(null);

    let fullResponse = '';
    try {
        const stream = sendMessageToAgent(currentChatHistory, files, currentFile);
        
        for await (const chunk of stream) {
            fullResponse += chunk;
            setChatHistory(prev => {
                const newHistory = [...prev];
                if (newHistory.length > 0 && newHistory[newHistory.length - 1].role === 'agent') {
                    newHistory[newHistory.length - 1].content = fullResponse;
                }
                return newHistory;
            });
        }
        
        const parsedMessage = parseAgentResponse(fullResponse);
        
        setChatHistory(prev => {
            const newHistory = [...prev];
             if (newHistory.length > 0 && newHistory[newHistory.length - 1].role === 'agent') {
                newHistory[newHistory.length - 1] = parsedMessage;
            }
            return newHistory;
        });

    } catch (err) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Agent failed to respond: ${errorMsg}`);
      setChatHistory(prev => {
          const historyWithoutPlaceholder = prev.slice(0, -1);
          return [...historyWithoutPlaceholder, { role: 'system', type: 'text', content: `Error: ${errorMsg}` }];
      });
    } finally {
      setAgentIsThinking(false);
    }
  }, [chatHistory, files, currentFile]);

  const handleViewChanges = (suggestion: { filePath: string; newCode: string; }) => {
    const original = files[suggestion.filePath];
    if (original !== undefined) {
      setDiffData({
        original,
        regenerated: suggestion.newCode,
        filePath: suggestion.filePath,
      });
      setIsDiffModalOpen(true);
    } else {
        setChatHistory(prev => [...prev, { role: 'system', type: 'text', content: `Error: Could not find file ${suggestion.filePath} to apply changes.`}]);
    }
  };

  const handleAcceptChanges = () => {
    if (diffData) {
      setFiles(prev => ({ ...prev, [diffData.filePath]: diffData.regenerated }));
      setChatHistory(prev => [...prev, { role: 'system', type: 'text', content: `Changes applied to ${diffData.filePath}.` }]);
    }
    setIsDiffModalOpen(false);
    setDiffData(null);
  };

  const handleRejectChanges = () => {
    setIsDiffModalOpen(false);
    setDiffData(null);
  };

  const handleAppClose = () => {
      setFiles({});
      setOpenFiles([]);
      setCurrentFile(null);
      setSelectedNode(null);
      setChatHistory([{
            role: 'agent',
            type: 'text',
            content: "Hello! I'm CodeSage, your AI code assistant. Import a repository or start writing code. Then, ask me to review it, find bugs, or generate tests!"
        }]);
      localStorage.removeItem('codeSage_files');
      localStorage.removeItem('codeSage_openFiles');
      localStorage.removeItem('codeSage_currentFile');
      localStorage.removeItem('codeSage_chatHistory');
  };

  // --- File Operations ---

    const handleCreateNode = (type: 'file' | 'folder') => {
        let parentDir = '';
        
        if (selectedNode) {
            // If the selected node path exists as a file, its parent is the directory.
            // If it doesn't, it must be a folder path, so it IS the directory.
            if (files[selectedNode] !== undefined) { // It's a file
                const parts = selectedNode.split('/');
                if (parts.length > 1) {
                    parentDir = parts.slice(0, -1).join('/');
                }
            } else { // It's a folder
                parentDir = selectedNode;
            }
        }

        const name = prompt(`Enter name for new ${type}:`);
        if (!name || !name.trim()) {
            return;
        }

        if (name.includes('/') || name.includes('\\')) {
            alert("Name cannot contain slashes. To create in a subdirectory, please create the folder first.");
            return;
        }
        
        const trimmedName = name.trim();
        const newPath = parentDir ? `${parentDir}/${trimmedName}` : trimmedName;

        const checkPathPrefix = `${newPath}/`;
        if (Object.keys(files).some(p => p === newPath || (p.startsWith(checkPathPrefix)))) {
            alert(`A file or folder with the name "${trimmedName}" already exists in this directory.`);
            return;
        }

        const finalPath = type === 'folder' ? `${newPath}/.gitkeep` : newPath;
        setFiles(prev => ({ ...prev, [finalPath]: '' }));
        
        if (type === 'file') {
            handleFileSelect(finalPath);
        } else {
            setSelectedNode(newPath);
        }
    };

    const handleRenameNode = (oldPath: string, isFolder: boolean) => {
        const newName = prompt(`Enter new name for "${oldPath}":`, oldPath);
        if (!newName || newName === oldPath || !newName.trim()) return;

        let newFiles = { ...files };
        if (isFolder) {
            Object.keys(files).forEach(p => {
                if (p.startsWith(oldPath + '/')) {
                    const content = newFiles[p];
                    delete newFiles[p];
                    const newPath = p.replace(oldPath, newName);
                    newFiles[newPath] = content;
                }
            });
        } else {
            const content = newFiles[oldPath];
            delete newFiles[oldPath];
            newFiles[newName] = content;
        }

        setFiles(newFiles);
        
        const newOpenFiles = openFiles.map(p => p.startsWith(oldPath) ? p.replace(oldPath, newName) : p);
        setOpenFiles(newOpenFiles);

        if (currentFile && currentFile.startsWith(oldPath)) {
            setCurrentFile(currentFile.replace(oldPath, newName));
        }
        if (selectedNode && selectedNode.startsWith(oldPath)) {
            setSelectedNode(selectedNode.replace(oldPath, newName));
        }
    };

    const handleDeleteNode = (path: string, isFolder: boolean) => {
        if (!confirm(`Are you sure you want to delete "${path}"?`)) return;

        let newFiles = { ...files };
        let pathsToDelete: string[] = [];
        const folderPrefix = path + '/';
        if (isFolder) {
            pathsToDelete = Object.keys(files).filter(p => p.startsWith(folderPrefix));
        }
        pathsToDelete.push(path); // Add the file itself or the folder's .gitkeep if it exists

        Object.keys(files).forEach(p => {
            if (p === path || (isFolder && p.startsWith(folderPrefix))) {
                delete newFiles[p];
            }
        })
        
        setFiles(newFiles);
        
        const newOpenFiles = openFiles.filter(p => !p.startsWith(path));
        setOpenFiles(newOpenFiles);

        if (currentFile && currentFile.startsWith(path)) {
            handleCloseFile(currentFile);
        }
        if (selectedNode && selectedNode.startsWith(path)) {
            setSelectedNode(null);
        }
    };

    const handleMoveNode = (draggedPath: string, dropTargetPath: string) => {
        const isDraggedFolder = Object.keys(files).some(p => p.startsWith(draggedPath + '/'));
        const fileName = draggedPath.split('/').pop() || '';
        const newPath = `${dropTargetPath}/${fileName}`;

        if (newPath === draggedPath || newPath.startsWith(draggedPath + '/')) {
             console.error("Cannot move a folder into itself.");
             return;
        }

        let newFiles = { ...files };
        if (isDraggedFolder) {
            Object.keys(files).forEach(p => {
                if (p.startsWith(draggedPath + '/')) {
                    const content = newFiles[p];
                    delete newFiles[p];
                    const newFilePath = p.replace(draggedPath, newPath);
                    newFiles[newFilePath] = content;
                }
            });
        } else {
            const content = newFiles[draggedPath];
            delete newFiles[draggedPath];
            newFiles[newPath] = content;
        }
        setFiles(newFiles);

        const newOpenFiles = openFiles.map(p => p.startsWith(draggedPath) ? p.replace(draggedPath, newPath) : p);
        setOpenFiles(newOpenFiles);

        if (currentFile && currentFile.startsWith(draggedPath)) {
            setCurrentFile(currentFile.replace(draggedPath, newPath));
        }
        if (selectedNode && selectedNode.startsWith(draggedPath)) {
            setSelectedNode(selectedNode.replace(draggedPath, newPath));
        }
    };


  const agentChatProps = {
    history: chatHistory,
    onSendMessage: handleSendMessage,
    isThinking: agentIsThinking,
    onViewChanges: handleViewChanges,
    activeFile: currentFile,
    onOpenGitHubImport: () => setIsModalOpen(true),
    onOpenFileImport: handleFileImportClick,
    onOpenFolderImport: handleFolderImportClick,
    onOpenPasteModal: () => setIsPasteModalOpen(true),
    isCollapsed: isChatCollapsed,
    setIsCollapsed: setIsChatCollapsed,
  };

  let editorColSpanClass;
    if (!isExplorerCollapsed && !isChatCollapsed) editorColSpanClass = 'lg:col-span-5';
    else if (isExplorerCollapsed && !isChatCollapsed) editorColSpanClass = 'lg:col-span-7';
    else if (!isExplorerCollapsed && isChatCollapsed) editorColSpanClass = 'lg:col-span-8';
    else editorColSpanClass = 'lg:col-span-10';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <Header 
        onCloseApp={handleAppClose}
        isExplorerCollapsed={isExplorerCollapsed}
        setIsExplorerCollapsed={setIsExplorerCollapsed}
        isChatCollapsed={isChatCollapsed}
        setIsChatCollapsed={setIsChatCollapsed}
        />
      <GitHubImportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onImportSuccess={handleImportSuccess}
      />
      <PasteModal 
          isOpen={isPasteModalOpen}
          onClose={() => setIsPasteModalOpen(false)}
          onImport={handlePasteSuccess}
          existingFiles={Object.keys(files)}
      />
       {isDiffModalOpen && diffData && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
             <div className="w-full max-w-4xl h-[90vh]">
                 <DiffViewer
                    originalCode={diffData.original}
                    regeneratedCode={diffData.regenerated}
                    onAccept={handleAcceptChanges}
                    onReject={handleRejectChanges}
                />
             </div>
         </div>
      )}
       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={Object.keys(LANGUAGE_EXTENSIONS).map(ext => `.${ext}`).join(',')} multiple/>
       <input type="file" ref={folderInputRef} onChange={handleFolderChange} className="hidden" {...{ webkitdirectory: "", mozdirectory: "" }} multiple />
      
      <main className="flex-grow container mx-auto px-4 py-4 flex justify-center items-start h-[calc(100vh-45px)]">
        {Object.keys(files).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 h-full w-full">
                {!isExplorerCollapsed && (
                    <div className="lg:col-span-2 h-full min-h-64 lg:min-h-0">
                        <FileExplorer
                            files={files}
                            selectedNode={selectedNode}
                            onSelectFile={handleFileSelect}
                            onSelectNode={handleNodeSelect}
                            isCollapsed={isExplorerCollapsed}
                            setIsCollapsed={setIsExplorerCollapsed}
                            onCreateNode={handleCreateNode}
                            onRenameNode={handleRenameNode}
                            onDeleteNode={handleDeleteNode}
                            onMoveNode={handleMoveNode}
                        />
                    </div>
                )}

                {!isChatCollapsed && (
                    <div className="lg:col-span-3 flex flex-col h-full min-h-[500px] lg:min-h-0">
                        <AgentChat {...agentChatProps} />
                    </div>
                )}
                
                <div className={`${editorColSpanClass} h-full min-h-96 lg:min-h-0`}>
                    <CodeEditor
                        code={code}
                        setCode={handleCodeChange}
                        language={language}
                        openFiles={openFiles}
                        activeFile={currentFile}
                        onSelectFile={handleFileSelect}
                        onCloseFile={handleCloseFile}
                    />
                </div>
            </div>
        ) : (
            <div className="w-full max-w-3xl h-full py-4">
                <AgentChat {...agentChatProps} />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;

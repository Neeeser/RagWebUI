import React, { useState, useRef, useEffect } from 'react';
import { useDropzone, DropzoneProps } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import FileUrlItem from './FileUrlItem';
import { FaPlus } from 'react-icons/fa';
import { usePopup } from '../Context/PopupContext';
import JSZip from 'jszip';
import { useUser } from '@auth0/nextjs-auth0/client';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/router';

interface UploadDocumentsProps {
  collectionId: string;
}

const UploadDocuments: React.FC<UploadDocumentsProps> = ({ collectionId }) => {
  const { user } = useUser();
  const router = useRouter();
  
  const [collectionName, setCollectionName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [urlError, setUrlError] = useState('');
  const [fileError, setFileError] = useState('');
  const [nameExists, setNameExists] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [finishedProcessing, setFinishedProcessing] = useState(false);

  const { showMessage } = usePopup();

  const maxFileSize = 25 * 1024 * 1024; // 25MB in bytes
  const acceptedFileTypes = ['text/plain', 'text/html', 'application/zip'];

  const fileUrlItemsRef = useRef<{ [key: string]: { documentId: string, startProcessing: () => boolean, completeProcessing: () => boolean, isError: () => boolean } }>({});

  useEffect(() => {
    const handleRouteChange = () => {
      if (!finishedProcessing) {
        handleUndo();
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [finishedProcessing, router.events]);

  const handleUndo = async () => {
    try {
      const response = await fetch('/api/collections/delete_collection/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection_id: collectionId }),
      });
      const result = await response.json();
      console.log('Cleanup response:', result.message);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const handleDrop: DropzoneProps['onDrop'] = (acceptedFiles, rejectedFiles) => {
    // console.log(acceptedFiles);
    const validFiles = acceptedFiles.filter(
      (file) => file.size <= maxFileSize && acceptedFileTypes.includes(file.type)
    );
  
    const invalidFiles = rejectedFiles.length > 0 ? rejectedFiles : acceptedFiles.filter(
      (file) => file.size > maxFileSize || !acceptedFileTypes.includes(file.type)
    );
  
    if (invalidFiles.length > 0) {
      setFileError('Please upload files under 25MB and only TXT, HTML, or ZIP formats.');
    } else {
      setFiles((prevFiles) => {
        const newFiles = [...prevFiles];
        validFiles.forEach((file) => {
          const existingIndex = newFiles.findIndex((f) => f.name === file.name);
          if (existingIndex !== -1) {
            newFiles[existingIndex] = file;
          } else {
            newFiles.push(file);
          }
          fileUrlItemsRef.current[file.name] = {
            documentId: '',
            startProcessing: () => false,
            completeProcessing: () => false,
            isError: () => false,
          };
        });
        return newFiles;
      });
      setFileError('');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleDrop });

  const isValidUrl = (url: string): boolean => {
    if (url.includes(' ')) {
      return false;
    }
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleUrlAdd = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<SVGElement, MouseEvent>) => {
    let inputElement: HTMLInputElement | null = null;

    if (e.type === 'keydown' && (e as React.KeyboardEvent<HTMLInputElement>).key === 'Enter') {
      inputElement = e.target as HTMLInputElement;
    } else if (e.type === 'click') {
      inputElement = (e.currentTarget as SVGElement).previousSibling as HTMLInputElement;
    }

    if (inputElement) {
      const url = inputElement.value.trim();
      if (url !== '') {
        if (isValidUrl(url)) {
          fileUrlItemsRef.current[url] = {
            documentId: '',
            startProcessing: () => false,
            completeProcessing: () => false,
            isError: () => false,
          };
          setUrls(prevUrls => {
            const newUrls = [...prevUrls];
            const existingIndex = newUrls.findIndex(u => u === url);
            if (existingIndex !== -1) {
              newUrls[existingIndex] = url; // Overwrite existing URL
            } else {
              newUrls.push(url);
            }
            return newUrls;
          });
          setUrlError('');
        } else {
          setUrlError('Invalid URL. Please enter a valid URL. IE: https://example.com');
        }
        inputElement.value = '';
      }
    }
  };

  const handleDeleteFile = async (index: number) => {
    const fileToDelete = files[index];
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles); // update state first to ensure UI is updated
    if (fileToDelete && fileUrlItemsRef.current[fileToDelete.name]) {
      const documentId = fileUrlItemsRef.current[fileToDelete.name].documentId;
      delete fileUrlItemsRef.current[fileToDelete.name]; // then remove from ref
      if (documentId !== '') {
        await fetch('/api/collections/delete_document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ document_id: documentId })
        });
      }
    }
  };

  const handleDeleteUrl = async (index: number) => {
    const urlToDelete = urls[index];
    const updatedUrls = urls.filter((_, i) => i !== index);
    setUrls(updatedUrls); // update state first to ensure UI is updated
    if (urlToDelete && fileUrlItemsRef.current[urlToDelete]) {
      const documentId = fileUrlItemsRef.current[urlToDelete].documentId;
      delete fileUrlItemsRef.current[urlToDelete]; // then remove from ref
      if (documentId !== '') {
        await fetch('/api/collections/delete_document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ document_id: documentId })
        });
      }
    }
  };

  const validateUploadedDocuments = async () => {
    // validate all URLs and show errors in real-time
    urls.forEach(async (url) => {
      const validationResult = validateUrl(url);
      if (validationResult !== "valid") {
        showMessage(validationResult, 'error');
        if (fileUrlItemsRef.current[url]) {
          fileUrlItemsRef.current[url].isError = () => true;
        }
      } else {
        if (fileUrlItemsRef.current[url]) {
          fileUrlItemsRef.current[url].isError = () => false;
        }
      }
    });

    files.forEach(async (file) => {
      const validationResult = await validateFile(file);
      if (validationResult !== "valid") {
        showMessage(validationResult, 'error');
        if (fileUrlItemsRef.current[file.name]) {
          fileUrlItemsRef.current[file.name].isError = () => true;
        }
      } else {
        if (fileUrlItemsRef.current[file.name]) {
          fileUrlItemsRef.current[file.name].isError = () => false;
        }
      }
    });

    // check if all validations are passed then proceed with collection creation
    const urlValidationResults = await Promise.all(urls.map(validateUrl));
    const fileValidationResults = await Promise.all(files.map(validateFile));
    if (urlValidationResults.every(result => result === "valid") && fileValidationResults.every(result => result === "valid")) {
      return true;
    }
    return false;
  };

  const handleCreateCollection = async () => {
    setIsCreating(true);
    try {
      const isValid = await validateUploadedDocuments();
      if (!isValid) {
        return; // end early if validation fails
      }

      let collectionCreationSuccessful = false;

      if (user) {
        // we will begin by creating the collection, if later the file processing fails, we can undo the collection creation
        try {
          const response = await fetch("/api/collections/add_collection", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user.sub, name: collectionName, collection_id: collectionId }),
          });
          const result = await response.json();
          if (response.ok) {
            if (result.collection_id === "exists") {
              setNameExists(true);
              console.error(`Collection with this name already exists: ${collectionName}`);
            } else {
              console.log(`Collection ${collectionName} processed successfully:`, result.collection_id);
              collectionCreationSuccessful = true;
            }
          } else {
            console.error(`Failed to process collection ${collectionName}`);
          }
        } catch (error) {
          console.error(`Error adding collection ${collectionName}:`, error);
        }

        if (collectionCreationSuccessful) {
          console.log("Collection created successfully, processing files...");
          console.log("Files:", files);
          console.log("URLs:", urls);
          // send validated files to the backend for processing
          const processItem = async (item: File | string, type: 'file' | 'url') => {
            const itemName = typeof item === 'string' ? item : item.name;
            if (fileUrlItemsRef.current[itemName]) {
              if (!fileUrlItemsRef.current[itemName].startProcessing() && !fileUrlItemsRef.current[itemName].completeProcessing()) {
                const formData = new FormData();
                formData.append('collection_id', collectionId);
                if (type === 'file' && item instanceof File) {
                  formData.append('file', item, itemName);
                  console.log(`Processing file: ${itemName}`);
                  fileUrlItemsRef.current[itemName].isError = () => false;
                  fileUrlItemsRef.current[itemName].startProcessing = () => true;
                  try {
                    const response = await fetch('http://localhost:8000/process_file/', {
                      method: 'POST',
                      body: formData,
                    });
                    const result = await response.json();
                    if (result.status === "success") {
                      console.log(`File ${itemName} processed successfully:`, result);
                      fileUrlItemsRef.current[itemName].completeProcessing = () => true;
                      fileUrlItemsRef.current[itemName].isError = () => false;
                      fileUrlItemsRef.current[itemName].documentId = result.document_id;
                      // showMessage(`File ${itemName} processed successfully`, 'success');
                    } else {
                      console.error(`Failed to process file ${itemName}:`, result.message);
                      fileUrlItemsRef.current[itemName].isError = () => true;
                      fileUrlItemsRef.current[itemName].completeProcessing = () => true;
                      showMessage(`Failed to process file ${itemName}: ${result.message}`, 'error');
                    }
                    fileUrlItemsRef.current[itemName].completeProcessing = () => true;
                  } catch (error) {
                    console.error(`Error processing file ${itemName}:`, error);
                    fileUrlItemsRef.current[itemName].completeProcessing = () => true;
                    fileUrlItemsRef.current[itemName].isError = () => true;
                    showMessage(`Error processing file ${itemName}: ${error}`, 'error');
                  }
                } else if (type === 'url') {
                  formData.append('url', itemName);
                  console.log(`Processing url: ${itemName}`);
                  fileUrlItemsRef.current[itemName].isError = () => false;
                  fileUrlItemsRef.current[itemName].startProcessing = () => true;
                  try {
                    const response = await fetch('http://localhost:8000/process_url/', {
                      method: 'POST',
                      body: formData,
                    });
                    const result = await response.json();
                    if (result.status === "success") {
                      console.log(`URL ${itemName} processed successfully:`, result);
                      fileUrlItemsRef.current[itemName].completeProcessing = () => true;
                      fileUrlItemsRef.current[itemName].isError = () => false;
                      fileUrlItemsRef.current[itemName].documentId = result.document_id;
                      showMessage(`URL ${itemName} processed successfully`, 'success');
                    } else {
                      console.error(`Failed to process URL ${itemName}:`, result.message);
                      fileUrlItemsRef.current[itemName].isError = () => true;
                      showMessage(`Failed to process URL ${itemName}: ${result.message}`, 'error');
                    }
                    fileUrlItemsRef.current[itemName].completeProcessing = () => true;
                  } catch (error) {
                    console.error(`Error processing URL ${itemName}:`, error);
                    fileUrlItemsRef.current[itemName].completeProcessing = () => true;
                    fileUrlItemsRef.current[itemName].isError = () => true;
                    showMessage(`Error processing URL ${itemName}: ${error}`, 'error');
                  }
                }
              }
            }
          };

          for (const file of files) {
            await processItem(file, 'file');
          }

          for (const url of urls) {
            await processItem(url, 'url');
          }

          if (Object.values(fileUrlItemsRef.current).every(item => item.completeProcessing() && !item.isError())) {
            showMessage('All files processed successfully', 'success');
            setFinishedProcessing(true);
          }
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const validateUrl = (url: string): string => {
    // check if the actual URL is formatted properly
    if (!isValidUrl(url)) {
      return `URL: ${url} is not properly formatted!`;
    }
    return "valid";
  };

  const validateFile = async (file: File): Promise<string> => {
    const expectedExtensions = ['.txt', '.html', '.zip'];
    const fileExtension = file.name.split('.').pop();

    if (!expectedExtensions.includes(`.${fileExtension}`)) {
      return `File: ${file.name} did not match one of the expected extensions {${expectedExtensions.join(', ')}}`;
    }

    // console.log(fileExtension);
    switch (fileExtension) {
      case 'txt':
        return "valid";
      case 'html':
        if (file.type !== 'text/html') {
          return `File: ${file.name} is not a valid HTML file`;
        }
        const fileContent = await file.text();
        if (!fileContent.includes('<!DOCTYPE html>')) {
          return `File: ${file.name} does not contain a valid HTML doctype`;
        }
        return "valid";
      case 'zip':
        // console.log(file.type)
        if (file.type !== 'application/zip') {
          return `Zip: ${file.name} is not a valid ZIP file`;
        }
        const zipData = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(zipData);
        const zipFiles = Object.values(zip.files);

        for (const zipFile of zipFiles) {
          if (!zipFile.dir) {
            const zipFileExtension = zipFile.name.split('.').pop();
            if (!expectedExtensions.includes(`.${zipFileExtension}`)) {
              return `Zip: ${file.name} contains an unsupported file type: ${zipFile.name}`;
            }

            const zipFileContent = await zipFile.async('string');
            switch (zipFileExtension) {
              case 'txt':
                // revised to accept any sort of .txt
                return "valid"
              case 'html':
                if (zipFileContent.indexOf('<!DOCTYPE html>') === -1) {
                  return `Zip: ${file.name} contains an invalid HTML file: ${zipFile.name}`;
                }
                return "valid";
              default:
                return `Zip: ${file.name} contains an unsupported file type: ${zipFile.name}`;
            }
          }
        }
        return "valid";
      default:
        return `${file.name} is not a supported file type`;
    }
  };

  return (
    <div className="h-7/10 w-2/3 bg-zinc-700 text-white flex flex-col rounded-xl relative border-4 border-zinc-700 shadow-2xl">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="p-4"
      >
        <h1 className="text-3xl font-bold">Upload Documents</h1>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="px-6 py-0"
      >
        <div className="text-lg font-semibold mb-6 flex">
          <div className="ml-4 flex-1">
            <strong>Files:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Text list of one or more URLs, or webpage content (<em>.txt</em>)</li>
              <li>Contents of an HTML webpage (<em>.html</em>)</li>
            </ul>
          </div>
          <div className="ml-4 flex-1">
            <strong>Compressed Folders (.zip):</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Containing one or more text files (<em>.txt</em>)</li>
              <li>Containing one or more HTML files (<em>.html</em>)</li>
            </ul>
          </div>
        </div>

        <div className="relative w-full mb-6">
          <span className={`absolute left-0 pl-4 text-red-600 ${collectionName ? 'hidden' : 'block'}`} style={{ top: "50%", transform: "translateY(-50%)" }}>*</span>
          <input
            type="text"
            placeholder="Collection Name"
            value={collectionName}
            onChange={(e) => {
              setCollectionName(e.target.value);
              setNameExists(false);
            }}
            className={`w-full ${collectionName ? 'pl-4' : 'pl-8'} py-2 text-black rounded-md focus:outline-none focus:ring-2 ${nameExists ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-400'}`}
          />
          {nameExists && <p className="text-red-500 text-sm mt-1">A collection with this name already exists!</p>}
        </div>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-white p-4 mb-6 rounded-md cursor-pointer"
        >
          <input {...getInputProps()} />
          <p className="text-center">Drag and drop files here, or click to select files</p>
          {fileError && <p className="text-red-500 mt-2">{fileError}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="text"
            placeholder="Enter URL"
            onKeyDown={handleUrlAdd}
            className="w-full px-4 py-2 mb-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <FaPlus className="ml-2 text-blue-600 hover:text-blue-700 cursor-pointer" onClick={handleUrlAdd} />
        </div>
        {urlError && <p className="text-red-500 mb-4">{urlError}</p>}

        <div className="overflow-y-auto max-h-32 space-y-2 pr-2" style={{ scrollbarWidth: 'thin' }}>
          {files.map((file, index) => (
            <FileUrlItem
              key={file.name}
              name={file.name}
              onDelete={() => handleDeleteFile(index)}
              type="file"
              startProcessing={fileUrlItemsRef.current[file.name].startProcessing()}
              completeProcessing={fileUrlItemsRef.current[file.name].completeProcessing()}
              isError={fileUrlItemsRef.current[file.name].isError()}
            />
          ))}
          {urls.map((url, index) => (
            <FileUrlItem
              key={index}
              name={url}
              onDelete={() => handleDeleteUrl(index)}
              type="url"
              startProcessing={fileUrlItemsRef.current[url].startProcessing()}
              completeProcessing={fileUrlItemsRef.current[url].completeProcessing()}
              isError={fileUrlItemsRef.current[url].isError()}
            />
          ))}
        </div>
      </motion.main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="p-6 mt-auto"
      >
        <div className="flex justify-end space-x-4">
          <Button
            size="xl"
            className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
            disabled={!(Object.values(fileUrlItemsRef.current).length === 0 || !Object.values(fileUrlItemsRef.current).every(item => item.completeProcessing() && !item.isError()))}
            onClick={async () => {
              await handleCreateCollection();
            }}
          >
            {isCreating ? <CircularProgress size={24} color="inherit" /> : "Process"}
          </Button>
          <Button
            size="xl"
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            disabled={Object.values(fileUrlItemsRef.current).length === 0 || !Object.values(fileUrlItemsRef.current).every(item => item.completeProcessing() && !item.isError())}
            onClick={() => {
              setFinishedProcessing(true);
              router.push(`/chat/${collectionId}`);
            }}
          >
            Finish
          </Button>
        </div>
      </motion.footer>
    </div>
  );
};

export default UploadDocuments;
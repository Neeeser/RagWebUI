import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
    onFileDrop: (file: File) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileDrop }) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // do something with the files
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                onFileDrop(file);
            }
        },
        [onFileDrop]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the files here...</p>
            ) : (
                <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
            )}
        </div>
    );
}
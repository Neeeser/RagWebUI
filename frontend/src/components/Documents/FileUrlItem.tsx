import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCheck, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface FileUrlItemProps {
  name: string;
  onDelete: () => void;
  type: 'file' | 'url';
  startProcessing: boolean;
  completeProcessing: boolean;
  isError: boolean;
}

const FileUrlItem: React.FC<FileUrlItemProps> = ({ name, onDelete, type, startProcessing, completeProcessing, isError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    if (startProcessing) {
      setIsProcessing(true);
    }
    if (completeProcessing) {
      setIsProcessing(false);
      setIsProcessed(true);
    }
  }, [startProcessing, completeProcessing]);

  const itemStyle = () => {
    if (isError) {
      return "bg-red-500 bg-opacity-20";
    } else if (isProcessed && !isError) {
      return "bg-green-500 bg-opacity-20";
    } else if (isProcessing) {
      return "bg-yellow-500 bg-opacity-20";
    }
    return "bg-white/10";
  };

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center justify-between p-2 rounded-md ${itemStyle()}`}
    >
      <div className="flex items-center">
        {isProcessing ? <FaSpinner className="animate-spin text-yellow-500 mr-2" /> : null}
        {isProcessed && !isError ? <FaCheck className="text-green-500 mr-2" /> : null}
        {isError ? <FaTimesCircle className="text-red-500 mr-2" /> : null}
        <span className="text-white">{name}</span>
      </div>
      <FaTimes
        onClick={onDelete}
        className="text-white cursor-pointer hover:text-red-400 transition-colors duration-200"
      />
    </motion.li>
  );
};

export default FileUrlItem;
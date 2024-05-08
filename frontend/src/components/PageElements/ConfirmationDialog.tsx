import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  message: string;
  onContinue: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ message, onContinue, onCancel }) => {
  return (
    <div className="min-h-[150px] min-w-[300px] w-1/6 h-2/7 bg-zinc-800 text-white flex items-center justify-center rounded-lg relative p-4">
        <div className="confirmation-dialog flex flex-col items-center justify-between flex-grow">
            <p className="text-center text-xl font-bold mb-4">{message}</p>
            <div className="mt-auto w-full flex justify-between">
                <Button className="bg-gray-400 hover:bg-gray-500 transition-colors duration-200" onClick={onCancel}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200" onClick={onContinue}>Continue</Button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmationDialog;
import * as React from "react";

import { cn } from "@/lib/utils";

type CommonAttributes = Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onAbort'>;

export interface InputProps extends CommonAttributes {
  multiline?: boolean;
}

const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  ({ className, type, multiline, ...props }, ref) => {

    const handleResizeHeight = (event: React.UIEvent<HTMLTextAreaElement>) => {
      const target = event.currentTarget;
      target.style.height = 'inherit';
      target.style.maxHeight = '66vh';
      target.style.overflowY = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    };

    if (multiline) {
      return (
        <textarea
          {...props}
          className={cn(
            "resize-none overflow-hidden rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300",
            className
          )}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          onInput={handleResizeHeight}
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'gray transparent' }}
        />
      );
    } else {
      return (
        <input
          {...props}
          type={type}
          className={cn(
            "rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300",
            className
          )}
          ref={ref as React.Ref<HTMLInputElement>}
        />
      );
    }
  }
);
Input.displayName = "Input";

export { Input };
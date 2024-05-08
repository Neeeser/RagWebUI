import * as React from "react"

import { cn } from "@/lib/utils"
import { SVGProps } from "react";

const Card = React.forwardRef<
  HTMLDivElement,
  { className?: string; imgSrc?: string; onDelete?: () => void } & React.HTMLAttributes<HTMLDivElement>
>(({ className, imgSrc, onDelete, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 flex items-center justify-between",
      className
    )}
    {...props}
  >
    <div className="flex-grow flex items-center">
      {imgSrc && (
        <div className="flex-none" style={{ padding: '16px' }}>
          <img
            src={imgSrc}
            alt=""
            className="w-6 h-6 self-center"
            style={{ width: '25px', height: '25px' }}
          />
        </div>
      )}
      <div className="flex-grow">
        {props.children}
      </div>
    </div>
    {onDelete && (
      <button onClick={onDelete} className="p-2">
        <TrashIcon className="w-4 h-5" />
      </button>
    )}
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 justify-center", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0 flex flex-col justify-center", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-center pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

function TrashIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="20" 
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, TrashIcon }


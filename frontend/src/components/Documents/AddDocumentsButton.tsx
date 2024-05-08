import { Button } from "@/components/ui/button"
import { JSX, SVGProps } from "react"

interface AddDocumentsButtonProps {
  onClick: () => void;
}

export function AddDocumentsButton({ onClick }: AddDocumentsButtonProps) {
  return (
    <Button className="h-9" variant="outline" onClick={onClick}>
      <UploadIcon className="h-4 w-4" />
    </Button>
  )
}

function UploadIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

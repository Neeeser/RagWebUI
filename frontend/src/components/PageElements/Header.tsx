import React from 'react';
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserProfileDropdown from '@/components/PageElements/UserProfileDropdown';
import { useUser } from '@auth0/nextjs-auth0/client';

interface HeaderProps {
  centerText?: string;
  showHomeIcon?: boolean;
}

const Header = ({ centerText, showHomeIcon = false }: HeaderProps) => {
  const { user } = useUser();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="p-6"
    >
      <div className="flex items-center justify-between">
        <Link href="/">
          {showHomeIcon ? (
            <HomeIcon className="text-xl font-bold" />
          ) : (
            <h1 className="text-xl font-bold">Crisis Chat Bot</h1>
          )}
        </Link>
        <div className="flex-1 text-center">
          {centerText && <p className="text-2xl font-bold">{centerText}</p>}
        </div>
        {user ? (
          <UserProfileDropdown />
        ) : (
          <nav className="space-x-4">
            <Link href="/api/auth/login">
              <Button className="bg-transparent text-white hover:bg-white/10 transition-colors duration-200">Log in</Button>
            </Link>
            <Link href="/api/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">Sign up</Button>
            </Link>
          </nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;

export function HomeIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
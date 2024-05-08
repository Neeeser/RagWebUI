// UserProfileDropdown.tsx
import React, { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

const UserProfileDropdown: React.FC = () => {
  const { user, error, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // Redirect to API route that handles logout
    window.location.href = '/api/auth/logout';
  };

  if (isLoading) return <div></div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="block h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600 focus:outline-none focus:border-white">
        {user && user.picture ? (
          <img src={user.picture} alt={user.name ?? 'User'} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-300" /> // Placeholder for users without a profile picture
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-50">
          <div>
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile
            </Link>
          </div>
          <div>
            <Link href="/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings
            </Link>
          </div>
          <div>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleLogout}>Logout</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
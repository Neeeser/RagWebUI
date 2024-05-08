import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function ProfileSettings() {
  const { user, error, isLoading } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  // add more state variables for other settings as needed

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // handle form submission and update user settings
  };

  const handleBack = () => {
    if (window.history.length > 1 && document.referrer.includes(window.location.origin)) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-zinc-800 text-white flex flex-col md:flex-row"
    >
      <div className="w-full md:w-1/2 p-20 flex flex-col items-start">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          &larr; Back
        </Button>
        <div className="flex items-center space-x-8 mb-16">
          <Avatar>
            <AvatarImage src={user?.picture || ''} alt={user?.name || 'User avatar'} />
            <AvatarFallback>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">

          <div>
            <label htmlFor="firstName" className="block mb-1">
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-1">
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="dob" className="block mb-1">
              Date of Birth
            </label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="openaiApiKey" className="block mb-1">
              OpenAI API Key
            </label>
            <Input
              id="openaiApiKey"
              type="text"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="claudeApiKey" className="block mb-1">
              Claude API Key
            </label>
            <Input
              id="claudeApiKey"
              type="text"
              value={claudeApiKey}
              onChange={(e) => setClaudeApiKey(e.target.value)}
              className="w-full"
            />
          </div>
          {/* Add more input fields for other settings */}
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full">
            Save Settings
          </Button>
        </form>
      </div>
      <div className="hidden md:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-50"></div>
        <div className="absolute inset-0 flex justify-center items-center">
          <Image
            src="/image2.png"
            alt="Profile"
            layout="fill"
            objectFit="cover"
            objectPosition="top"
          />
        </div>
      </div>
    </motion.div>
  );
}
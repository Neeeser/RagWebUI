import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion } from "framer-motion";
import { v4 as uuidv4 } from 'uuid';
import UploadDocuments from "../Documents/UploadDocuments";
import Header from '../PageElements/Header';
import Footer from '../PageElements/Footer';

export function NewCollection() {
  const { user, isLoading} = useUser();
  const router = useRouter();
  const collectionId = uuidv4();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/api/auth/login");
    }
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen bg-zinc-800 text-white flex flex-col justify-between">
      <Header centerText="Create a Collection" showHomeIcon={true} />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="px-6 py-12 text-center flex flex-1 items-center justify-center"
      >
        <UploadDocuments collectionId={collectionId} />
      </motion.main>

      <Footer />
    </div>
  );
}
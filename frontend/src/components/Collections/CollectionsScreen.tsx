import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useUser } from '@auth0/nextjs-auth0/client';
import axios from 'axios';
import { IntroMessage } from './IntroMessage';
import { CollectionViewer } from './CollectionViewer';
import Header from '@/components/PageElements/Header';
import Footer from '@/components/PageElements/Footer';
import { useRouter } from 'next/router';
import { Collection } from '@/lib/types';
import ConfirmationDialog from '@/components/PageElements/ConfirmationDialog';

export function CollectionsScreen() {
  const { user } = useUser();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      axios.get(`/api/collections/get_collections_by_user?user_id=${user.sub}`)
        .then(response => {
          setCollections(response.data.collections as Collection[]);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch collections:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateCollection = () => {
    router.push('/new-collection');
  };

  const confirmDelete = async () => {
    if (selectedCollectionId) {
      try {
        const response = await axios.post('/api/collections/delete_collection', { collection_id: selectedCollectionId });
        if (response.status === 200) {
          setCollections(collections.filter(collection => collection.collection_id !== selectedCollectionId));
          console.log('Collection deleted successfully');
        } else {
          console.error('Failed to delete collection');
        }
      } catch (error) {
        console.error('Error deleting collection:', error);
      }
    }
    setShowConfirmationDialog(false);
  };

  const handleDeleteCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    setShowConfirmationDialog(true);
  };

  return (
    <div className="min-h-screen bg-zinc-800 text-white flex flex-col justify-between">
      <Header />

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="px-6 py-12 text-center"
      >
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          collections && collections.length > 0 ? (
            <>
              <p className="text-lg mb-4">See your collections below, click one of them to begin chatting!</p>
              <CollectionViewer collections={collections} onDeleteCollection={handleDeleteCollection} />
              <div className="mt-4">
                <Button onClick={handleCreateCollection} className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                  Create Collection
                </Button>
              </div>
            </>
          ) : (
            <IntroMessage buttonText="Create Collection" onButtonClick={handleCreateCollection} />
          )
        ) : (
          <>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
              Crisis Chat Bot
              <br />
              with RAG
            </h2>
            <Link href="/api/auth/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                Get started
              </Button>
            </Link>
          </>
        )}
      </motion.main>

      <Footer />
      {showConfirmationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <ConfirmationDialog
            message="Are you sure you want to delete this collection?"
            onContinue={confirmDelete}
            onCancel={() => setShowConfirmationDialog(false)}
          />
        </div>
      )}
    </div>
  )
}
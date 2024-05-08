import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import React, { useEffect, useState } from 'react';
import { MainChat } from '@/components/ChatBot/MainChat';
import { useRouter } from 'next/router';
import { useUser } from "@auth0/nextjs-auth0/client";

export const getServerSideProps = withPageAuthRequired();

const ChatPage = () => {
  const router = useRouter();
  const { collection_id } = router.query;
  const [isValidId, setIsValidId] = useState(false);
  const { user, isLoading } = useUser();

  useEffect(() => {
    // ensure collection_id is a string and not an array or undefined
    const id = typeof collection_id === 'string' ? collection_id : undefined;

    if (!isLoading) {
      if (id) {
        const uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidFormat.test(id)) {
          // check if the collection exists in the database
          fetch(`/api/collections/get_collection_exists?collection_id=${id}&user_id=${user?.sub}`)
            .then(response => response.json())
            .then(data => {
              if (data.message) {
                setIsValidId(true);
              } else {
                router.push('/chat/');
              }
            })
            .catch(() => {
              router.push('/chat/');
            });
        } else {
          router.push('/chat/');
        }
      } else {
        router.push('/chat/');
      }
    }
  }, [collection_id, router, isLoading, user?.sub]);

  return isValidId ? <MainChat collection_id={collection_id as string} /> : null;
};

export default ChatPage;
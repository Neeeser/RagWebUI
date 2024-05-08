import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import React, { useEffect, useState } from 'react';
import { MainChat } from '@/components/ChatBot/MainChat';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';

export const getServerSideProps = withPageAuthRequired();

const ChatPage = () => {
  const router = useRouter();
  const { collection_id, conversation_id } = router.query;
  const [isValidIds, setIsValidIds] = useState(false);
  const { user, isLoading } = useUser();

  useEffect(() => {
    // validate collection_id and conversation_id as strings and check UUID format
    const uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validCollectionId = typeof collection_id === 'string' && uuidFormat.test(collection_id);
    const validConversationId = typeof conversation_id === 'string' && uuidFormat.test(conversation_id);

    if (!isLoading && user) {
      if (validCollectionId && validConversationId) {
        // further validate if the collection and conversation actually exist in the database
        Promise.all([
          fetch(`/api/collections/get_collection_exists?collection_id=${collection_id}&user_id=${user.sub}`),
          fetch(`/api/chat/get_conversation_exists?conversation_id=${conversation_id}&user_id=${user.sub}`)
        ]).then(async ([collectionRes, conversationRes]) => {
          const collectionData = await collectionRes.json();
          const conversationData = await conversationRes.json();

          if (collectionData.message && conversationData.message) {
            setIsValidIds(true);
          } else if (collectionData.message && !conversationData.message) {
            // allow the new conversation to be created
            setIsValidIds(true);
          } else {
            router.push('/chat/');
          }
        }).catch(() => {
          router.push('/chat/');
        });
      } else if (validCollectionId && !validConversationId) {
        // if only the collection_id is valid
        router.push(`/chat/${collection_id}`);
      } else {
        router.push('/chat/');
      }
    }
  }, [collection_id, conversation_id, router, user, isLoading]);

  return isValidIds ? (
    <MainChat collection_id={collection_id as string} conversation_id={conversation_id as string} />
  ) : null;
};

export default ChatPage;
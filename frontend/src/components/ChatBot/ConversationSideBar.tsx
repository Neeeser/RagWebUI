import { Button } from "@/components/ui/button";
import { SVGProps } from "react";
import { ConversationItem } from "./ConversationItem";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmationDialog from "@/components/PageElements/ConfirmationDialog";

interface ConversationSideBarProps {
  collectionId: string;
  onConversationSelect: (collectionId: string, conversationId: string) => void;
  onNewConversationClick: (collectionId: string) => Promise<void>;
}

export const ConversationSideBar = ({
  collectionId,
  onConversationSelect,
  onNewConversationClick,
}: ConversationSideBarProps) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const { user } = useUser();
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(collectionId);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    if (user) {
      const response = await fetch(`/api/collections/get_collections_by_user?user_id=${user.sub}`);
      const data = await response.json();
      if (data.collections) {
        setCollections(data.collections);
      }
    }
  }, [user]);

  const handleConversationClick = async (conversationId: string) => {
    onConversationSelect(selectedCollectionId, conversationId);
    await fetchConversations();
  };

  const fetchConversations = useCallback(async () => {
    if (user && selectedCollectionId) {
      const response = await fetch(`/api/chat/get_conversations_by_collection?collection_id=${selectedCollectionId}`);
      const data = await response.json();
      if (data.conversations) {
        const sortedConversations = data.conversations.sort(
          (a: any, b: any) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
        );
        setConversations(sortedConversations);
      } else {
        setConversations([]);
      }
    }
  }, [user, selectedCollectionId]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, selectedCollectionId]);

  const handleNewConversationClick = async () => {
    onNewConversationClick(collectionId);
  };

  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    onConversationSelect(collectionId, "");
  };

  const handleDeleteConversation = async (conversationId: string) => {
    setConversationToDelete(conversationId);
    setShowConfirmationDialog(true);
  };

  const confirmDelete = async () => {
    if (conversationToDelete) {
      try {
        const response = await fetch("/api/chat/delete_conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ conversation_id: conversationToDelete }),
        });

        if (response.ok) {
          await fetchConversations();
          setShowConfirmationDialog(false);
          setConversationToDelete(null);
        } else {
          console.error("Failed to delete conversation");
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
  };

  const cancelDelete = () => {
    setShowConfirmationDialog(false);
    setConversationToDelete(null);
  };

  return (
    <aside className={`w-80 border-r dark:border-zinc-700 ${showConfirmationDialog ? 'bg-opacity-50' : ''}`}>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Collections/Chats</h2>
          <Button size="icon" variant="ghost" onClick={handleNewConversationClick}>
            <PlusIcon className="w-6 h-6" />
          </Button>
        </div>
        <Select value={selectedCollectionId} onValueChange={handleCollectionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent className={`max-h-[33vh] overflow-auto`}>
            {collections.map((collection) => (
              <SelectItem key={collection.collection_id} value={collection.collection_id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-y-2 overflow-auto max-h-[calc(100vh-200px)]">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.conversation_id}
                conversationId={conversation.conversation_id}
                title={conversation.title}
                onConversationClick={() => handleConversationClick(conversation.conversation_id)}
                onDeleteConversation={() => handleDeleteConversation(conversation.conversation_id)}
              />
            ))
          ) : (
            <p>No past conversations</p>
          )}
        </div>
      </div>
      {showConfirmationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <ConfirmationDialog
            message="Are you sure you want to delete this conversation?"
            onContinue={confirmDelete}
            onCancel={cancelDelete}
          />
        </div>
      )}
    </aside>
  );
};

function PlusIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
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
      <path d="M12 5v14m7-7H5" />
    </svg>
  );
}
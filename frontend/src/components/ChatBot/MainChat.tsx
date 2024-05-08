import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import ChatHistory from "@/components/ChatBot/ChatHistory";
import UserProfileDropdown from "@/components/PageElements/UserProfileDropdown";
import ModelSelector from "@/components/ChatBot/ModelSelector";
import { ConversationSideBar } from "@/components/ChatBot/ConversationSideBar";
import { useUser } from "@auth0/nextjs-auth0/client";
import { usePopup } from "@/components/Context/PopupContext";
import { NoCollectionMessage } from "@/components/ChatBot/NoCollectionMessage";
import { NoConversationMessages } from "@/components/ChatBot/NoConversationMessage";
import { v4 as uuidv4 } from 'uuid';
import Link from "next/link";
import { HomeIcon } from "@/components/PageElements/Header";


interface Message {
  message_id: string;
  text: string;
  isUser: boolean;
  isComplete: boolean;
}

interface MainChatProps {
  collection_id?: string;
  conversation_id?: string;
}

export function MainChat({ collection_id, conversation_id }: MainChatProps) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { showMessage } = usePopup();

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingMessageId = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/api/auth/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    handleConversation();
  }, [collection_id, conversation_id, user?.sub, showMessage, router]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleConversation = async () => {
    if (collection_id && !conversation_id) {
      const response = await fetch(`/api/chat/get_empty_conversation_by_collection?collection_id=${collection_id}`);
      const data = await response.json();
      let newConversationId = data.conversations.length > 0 ? data.conversations[0].conversation_id : null;
      console.log('data1:', data);
      console.log('newConversationId:', newConversationId);

      if (!newConversationId) {
        newConversationId = uuidv4();
        const created = await createConversation(collection_id, user?.sub, newConversationId);
        if (!created) {
          showMessage("Failed to create conversation.", 'error');
          return;
        }
      }

      router.replace(`/chat/${collection_id}/${newConversationId}`);
    } else if (collection_id && conversation_id) {
      fetchConversationMessages(conversation_id);
    }
  };

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (message.trim() === "" || isStreaming || !conversation_id) {
        return;
      }

      setInputValue("");
      const newMessage = { message_id: uuidv4(), text: message, isUser: true, isComplete: true };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      await addUserMessage(message, conversation_id as string);
      startStream(message, conversation_id as string);

      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    },
    [showMessage, conversation_id]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage(inputValue);
      }
    },
    [handleSendMessage, inputValue]
  );

  const addUserMessage = async (message: string, conversationId: string) => {
    try {
      await fetch("/api/chat/add_message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: message,
          is_user: true,
          is_complete: true,
        }),
      });
    } catch (error) {
      console.error("Error adding user message:", error);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/chat/get_conversation_messages?conversation_id=${conversationId}`
      );
      const data = await response.json();
      const chatHistory = data.conversation_messages;

      setMessages(
        chatHistory.map((msg: any) => ({
          message_id: msg.message_id,
          text: msg.text,
          isUser: msg.is_user,
          isComplete: msg.is_complete,
        }))
      );
    } catch (error) {
      console.error("Error fetching conversation history:", error);
    }
  };

  const startStream = async (messageContent: string, conversationId: string) => {
    const response = await fetch("/api/chat/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: messageContent, user_id: user?.sub, conversation_id: conversationId }),
    });

    if (!response.body) {
      throw new Error("ReadableStream not supported in this browser.");
    }

    const reader = response.body.getReader();
    setIsStreaming(true);
    readStream(reader, conversationId);
  };

  async function readStream(reader: ReadableStreamDefaultReader, conversationId: string) {
    let fullResponseText = "";

    async function read() {
      const { done, value } = await reader.read();
      if (done) {
        setIsStreaming(false);
        updateMessageWithFullResponse(fullResponseText, conversationId);
        return;
      }

      const text = new TextDecoder().decode(value);
      fullResponseText += text;
      console.log(`received chunk: ${text}`);
      updateMessageWithCurrentText(fullResponseText);
      read();
    }
    read();
  }

  function updateMessageWithCurrentText(fullResponseText: string) {
    if (streamingMessageId.current) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.message_id === streamingMessageId.current
            ? { ...msg, text: fullResponseText, isComplete: false }
            : msg
        )
      );
    } else {
      const newMessageId = uuidv4();
      streamingMessageId.current = newMessageId;
      setMessages((prevMessages) => [
        ...prevMessages,
        { message_id: newMessageId, text: fullResponseText, isUser: false, isComplete: false },
      ]);
      console.log(`added new message id: ${newMessageId} with text from stream`);
    }
  }

  async function updateMessageWithFullResponse(fullResponseText: string, conversationId: string) {
    const newMessageId = "";
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const newMessage = { ...lastMessage, id: newMessageId, text: fullResponseText, isComplete: true };
      return [...prevMessages.slice(0, -1), newMessage];
    });
    streamingMessageId.current = null;

    console.log(`about to push an assistant message to convo_id: ${conversationId}`);
    // Call the 'add_message' endpoint for the assistant's response
    try {
      await fetch("/api/chat/add_message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: fullResponseText,
          is_user: false,
          is_complete: true,
        }),
      });
    } catch (error) {
      console.error("Error adding assistant message:", error);
    }
  }

  return (
    <div key="1" className="flex h-screen bg-white dark:bg-zinc-800">
      <ConversationSideBar
        collectionId={collection_id as string}
        onConversationSelect={(collectionId, conversationId) => {
          router.push(`/chat/${collectionId}/${conversationId}`);
        }}
        onNewConversationClick={async (collectionId) => {
          if (!collectionId) {
            showMessage("Please select a collection before creating a conversation.", 'warning');
            return;
          }
          // console.log('messages:', messages)
          if (messages.length === 0) {
            // current conversation is already empty
            return;
          }
      
          // Try to fetch an existing empty conversation or create a new one
          const response = await fetch(`/api/chat/get_empty_conversation_by_collection?collection_id=${collectionId}`);
          const data = await response.json();
          console.log('data:', data);
          let newConversationId = data.conversations.length > 0 ? data.conversations[0].conversation_id : null;
      
          if (!newConversationId) {
            newConversationId = uuidv4();
            const created = await createConversation(collectionId, user?.sub, newConversationId);
            if (!created) {
              showMessage("Failed to create conversation.", 'error');
              return;
            }
          }
      
          router.push(`/chat/${collectionId}/${newConversationId}`);
        }}
      />
      <section className="flex flex-col w-full">
        <header className="border-b dark:border-zinc-700 p-4 flex justify-between items-center">
          <div className="text-xl font-bold flex items-center gap-2">
            <Link href="/">
              <HomeIcon className="text-xl font-bold cursor-pointer" />
            </Link>
            <Avatar className="relative overflow-visible w-10 h-10">
              <span className="absolute right-0 top-0 flex h-3 w-3 rounded-full bg-green-600" />
              <AvatarImage alt="User Avatar" src="/placeholder-avatar.jpg" />
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              Crisis Conversation Bot
              <span className="text-xs text-green-600 block">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-grow justify-center">
            <ModelSelector />
          </div>
          <div>
            <UserProfileDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {collection_id ? (
            messages.length > 0 ? (
              <ChatHistory messages={messages} />
            ) : (
              <NoConversationMessages collectionId={collection_id} />
            )
          ) : (
            <NoCollectionMessage />
          )}
        </main>

        <footer className="border-t dark:border-zinc-700 p-4 flex flex-col">
          <div className="flex-grow flex items-end">
            <div className="flex w-full items-center gap-2">
              <Input
                multiline
                className="flex-1 resize-y"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  handleInputChange(event as React.ChangeEvent<HTMLInputElement>)
                }
                onKeyDown={handleKeyDown}
                ref={inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
              />
              <Button
                className={
                  isStreaming
                    ? "bg-gray-400 hover:bg-gray-500 transition-colors duration-200"
                    : "bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                }
                disabled={isStreaming}
                onClick={() => handleSendMessage(inputValue)}
              >
                Send
              </Button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}

const createConversation = async (collectionId: string, userId: string | null | undefined, conversationId: string) => {
  try {
    const response = await fetch("/api/chat/add_conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ collection_id: collectionId, user_id: userId, conversation_id: conversationId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create conversation");
    }

    return true;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return false;
  }
};
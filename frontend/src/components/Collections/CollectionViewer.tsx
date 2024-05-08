import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Collection } from '@/lib/types';
import { PaginationPrevious, PaginationItem, PaginationLink, PaginationEllipsis, PaginationNext, PaginationContent, Pagination } from "@/components/ui/pagination"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { TrashIcon } from "@/components/ui/card";

interface CollectionViewerProps {
  collections: Collection[];
  onDeleteCollection: (collectionId: string) => void;
}

export function CollectionViewer({ collections, onDeleteCollection }: CollectionViewerProps) {
  const [documentTitles, setDocumentTitles] = useState<Record<string, string[]>>({});
  const [chatCounts, setChatCounts] = useState<Record<string, number>>({});
  const [lastActivity, setLastActivity] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const router = useRouter();

  useEffect(() => {
    collections.forEach(async (collection) => {
      const docResponse = await fetch(`/api/collections/get_documents_by_collection?collection_id=${collection.collection_id}`);
      const docData = await docResponse.json();
      setDocumentTitles(prev => ({
        ...prev,
        [collection.collection_id]: docData.documents.map((doc: { title: string }) => doc.title)
      }));

      const chatResponse = await fetch(`/api/chat/get_conversations_by_user?user_id=${collection.user_id}`);
      const chatData = await chatResponse.json();
      const count = chatData.conversations.filter((chat: { collection_id: string }) => chat.collection_id === collection.collection_id).length;
      setChatCounts(prev => ({
        ...prev,
        [collection.collection_id]: count
      }));

      if (chatData.conversations.length === 0) {
        setLastActivity(prev => ({
          ...prev,
          [collection.collection_id]: 'n/a'
        }));
      } else {
        const lastUpdated = chatData.conversations.reduce((latest: Date, chat: { last_updated: Date }) => {
          const chatDate = new Date(chat.last_updated);
          return chatDate > latest ? chatDate : latest;
        }, new Date(0));

        const timeDiff = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 3600 * 24);
        let timeAgo = '';
        if (timeDiff < 1) timeAgo = 'Today';
        else if (timeDiff < 2) timeAgo = 'Yesterday';
        else if (timeDiff < 7) timeAgo = `${Math.floor(timeDiff)} days ago`;
        else if (timeDiff < 14) timeAgo = '1 week ago';
        else if (timeDiff < 28) timeAgo = '2 weeks ago';
        else timeAgo = '>2 weeks ago';

        setLastActivity(prev => ({
          ...prev,
          [collection.collection_id]: timeAgo
        }));
      }
    });
  }, [collections]);

  const totalPages = Math.ceil(collections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = collections.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Title
                    </TableHead>
                    <TableHead className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Documents
                    </TableHead>
                    <TableHead className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Chats
                    </TableHead>
                    <TableHead className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Latest Activity
                    </TableHead>
                    <TableHead className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {/* Empty header for delete icon */}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((collection) => (
                    <TableRow key={collection.collection_id} className="bg-gray-100 dark:bg-gray-700">
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => router.push(`/chat/${collection.collection_id}`)}>
                        {collection.name}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 cursor-pointer" onClick={() => router.push(`/chat/${collection.collection_id}`)} style={{ wordWrap: "break-word", maxWidth: "150px" }}>
                        {documentTitles[collection.collection_id]?.join(', ') || 'Loading...'}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer" onClick={() => router.push(`/chat/${collection.collection_id}`)}>
                        {chatCounts[collection.collection_id] || 0}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer" onClick={() => router.push(`/chat/${collection.collection_id}`)}>
                        {lastActivity[collection.collection_id] || 'Loading...'}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <button onClick={() => onDeleteCollection(collection.collection_id)}>
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            {totalPages > 1 && (
              <>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={() => setCurrentPage(currentPage - 1)} />
                  </PaginationItem>
                )}
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink href="#" onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext href="#" onClick={() => setCurrentPage(currentPage + 1)} />
                  </PaginationItem>
                )}
              </>
            )}
            {totalPages === 1 && (
              <PaginationItem>
                <span className="text-gray-500">1 of 1</span>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}


import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Document } from "@/lib/types";
import { useEffect, useState } from "react";

interface NoConversationMessagesProps {
  collectionId: string;
}

export function NoConversationMessages({ collectionId }: NoConversationMessagesProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/collections/get_documents_by_collection?collection_id=${collectionId}`);
        const data = await response.json();
        setDocuments(data.documents);
      } catch (error) {
        console.error("Failed to fetch documents", error);
      }
      setIsLoading(false);
    }

    fetchDocuments();
  }, [collectionId]);

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-3xl rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Start a New Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading documents...</p>
          ) : (
            <>
              <p>You have {documents.length} documents in this collection that will be referenced while chatting! See them below:</p>
              <div className="overflow-auto h-40 space-y-2">
                {documents.map((document, index) => (
                  <div key={index} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    {document.title}
                  </div>
                ))}
              </div>
              <p>Ask a question about the documents to begin!</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
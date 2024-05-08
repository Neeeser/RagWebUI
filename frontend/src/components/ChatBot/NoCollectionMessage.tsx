import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";

export function NoCollectionMessage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-3xl rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Getting Started with Your Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <br />
          <div className="space-y-4">
            <p>
              To begin interacting with the Crisis Conversation Chat Bot, please select a collection from the dropdown menu. You can either choose to continue a past conversation related to that collection or start a new conversation.
            </p>
            <p>
              This will enable the chat bot to provide tailored support and information based on the selected documents or past interactions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
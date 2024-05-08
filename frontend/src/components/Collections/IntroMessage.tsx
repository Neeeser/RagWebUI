import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface IntroMessageProps {
  buttonText?: string;
  onButtonClick?: () => void;
}

export function IntroMessage({ buttonText, onButtonClick }: IntroMessageProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-3xl rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Welcome to the Crisis Conversation Chat Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <br />
            <p>
              This chat bot is designed to assist you learn crisis situations. Here&apos;s how to get started:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Find a <strong>Crisis Event</strong> in the news that you want to know more about.
              </li>
              <li>
                Collect a few <strong>URLs</strong> or other file types from various sites that report on the event.
              </li>
              <li>
                Begin by clicking the <strong>create collection button</strong> below to upload relevant documents for the chat bot to reference.
              </li>
            </ul>
            <p>
              Once you&apos;ve created your first collection of documents, you can start engaging with the <strong>Crisis Conversation Chat Bot</strong>. It will provide helpful information and support based on the documents you&apos;ve provided.
            </p>
            {buttonText && onButtonClick && (
              <div className="flex justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-lg font-bold py-3 px-6" onClick={onButtonClick}>{buttonText}</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
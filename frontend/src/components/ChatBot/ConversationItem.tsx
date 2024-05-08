import { Card, CardContent } from "@/components/ui/card";

interface ConversationItemProps {
  conversationId: string;
  title: string;
  onConversationClick: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export const ConversationItem = ({
  conversationId,
  title,
  onConversationClick,
  onDeleteConversation,
}: ConversationItemProps) => {
  return (
    <Card className="p-2 cursor-pointer" onDelete={() => onDeleteConversation(conversationId)}>
      <CardContent>
        <div onClick={() => onConversationClick(conversationId)}>
          <h3 className="font-semibold">{title}</h3>
        </div>
      </CardContent>
    </Card>
  );
};
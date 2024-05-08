export interface User {
    user_id: string;
}

export interface Document {
    id: string;
    title: string;
    content: string;
}

export interface Conversation {
    conversation_id: string;
    title: string;
    last_updated: Date;
    raw_conversation: JSON;
    collection_id: string;
    user_id: string;
}

export interface Collection {
    collection_id: string;
    name: string;
    user_id: string;
}
from Embeddings import EmbeddingHandler
from LLM import LLMInteraction

class ModularChatbot:
    def __init__(self, database, context_text=None):
        # initialize the chatbot with a database and optional context text
        self.database = database
        self.llm_interaction = LLMInteraction()
        self.embedding_handler = EmbeddingHandler()
        
        # set up initial conversation history with a system message
        self.conversation_history = [
            {
                "role": "system",
                "content": "You are a helpful knowledge retrieval agent. You are provided documents that you can use to answer user queries. You should answer the user queries only based on the provided documents, and inform the user if you either were not provided documents, or the documents do not seem to answer their question.",
            }
        ]

    def handle_query(self, query, userid, conversation_id):
        full_response = ""
        context = None
        # retrieve the raw conversation history from the database
        conversation_history = self.database.get_conversation_raw(conversation_id)
        
        # retrieve related documents for the conversation
        related_docs = self.database.get_documents_by_conversation(conversation_id)
        print(f"Related docs: {related_docs}")
        doc_ids = [doc.document_id for doc in related_docs]
        
        # initialize conversation history if it does not exist
        if conversation_history is None:
            conversation_history = [
                {
                    "role": "system",
                    "content": "You are a helpful knowledge retrieval agent. You are provided documents that you can use to answer user queries. You should answer the user queries only based on the provided documents, and inform the user if you either were not provided documents, or the documents do not seem to answer their question.",
                }
            ]
        # retrieve documents similar to the user's query using document IDs as filters
        metadata_filters = {"document_id": {"$in": doc_ids}}
        retrieval_status, retrieval_error, similar_documents = self.embedding_handler.retrieve_documents(query, metadata_filters=metadata_filters)

        # construct context from the most similar documents
        context = "<$$ THIS SIGNIFIES THE BEGINNING OF RELEVANT CONTEXTUAL DOCUMENTS $$>\n\n"
        if retrieval_status == "success" and similar_documents:
            for index, doc_info in enumerate(similar_documents, start=1):
                document_text = doc_info["text"]
                document_filename = doc_info["metadata"]["filename"]  # extracting filename from metadata
                context += f"<$$ Document Index: {index} $$>\n<$$ Filename: {document_filename} $$>\n<$$ Content: {document_text} $$>\n<$$ Document Separator $$>\n"
        elif retrieval_status == "error":
            context += "THERE WAS A SYSTEM ERROR RETRIEVING DOCUMENTS, INFORM THE USER\n\n"
            print(f"Error retrieving documents: {retrieval_error}\n\n")
        else:
            context += "NO RELEVANT DOCUMENTS FOUND, INFORM THE USER\n\n"
            print("No documents found\n\n")
        context += "<$$ THIS SIGNIFIES THE END OF ATTACHED DATA AND MARKS THE BEGINNING OF USER QUERY $$>\n\n"

        # append the user's query to the conversation history
        if context:
            query = context + query

        conversation_history.append({"role": "user", "content": query})

        # generate responses from the LLM based on the query and context
        for response in self.llm_interaction.generate_response(query, context, conversation=conversation_history):
            full_response += response
            yield response, similar_documents

        # append the assistant's response to the conversation history
        conversation_history.append({"role": "assistant", "content": full_response})

        # update the raw conversation history in the database
        self.database.update_conversation_raw(conversation_id, conversation_history)
        
        # check if the conversation title is "New chat" and update if necessary
        if self.database.get_conversation_title(conversation_id) == "New chat":
            # call the LLM to generate a title based on the current conversation history
            new_title = self.llm_interaction.generate_title(conversation_history)
            # update the conversation title in the database
            self.database.update_conversation_title(conversation_id, new_title)

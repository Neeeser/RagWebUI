"""
how to start this file
pip install -r requirements.txt

uvicorn FastAPI:app --port 8000 --reload

"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import time
import os
import uuid

# import ModularChatbot from wherever it is defined
from ChatBot import ModularChatbot
from LLM import LLMInteraction
from Database import Database

iso_LLM = LLMInteraction()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # List your frontend's origins here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# initialize Database here
db = Database()

# initialize ModularChatbot here
chatbot = ModularChatbot(database=db)

class ChatRequest(BaseModel):
    user_id: str
    message: str
    conversation_id: str

@app.post("/chat/")
async def chat(request: ChatRequest):
    print(request.conversation_id)
    def response_stream():
        for response, similar_documents in chatbot.handle_query(request.message, request.user_id, request.conversation_id):
            yield response
    return StreamingResponse(response_stream())

class ModelUpdateRequest(BaseModel):
    name_of_model: str

@app.post("/update_model/")
async def update_model(request: ModelUpdateRequest):
    chatbot.llm_interaction.switch_model(request.name_of_model)
    return {"message": f"Model updated to {request.name_of_model}"}

@app.get("/get_paid_status/")
async def get_paid_status():
    status = chatbot.llm_interaction.get_paid_status()
    return {"status": status}


# Endpoint to add user
class User(BaseModel):
    user_id: str

@app.post("/add_user/")
async def add_user(user: User):
    user_id = user.user_id
    user_added = db.add_user(user_id)
    if user_added:
        return {"message": f"User {user_id} added successfully"}
    else:
        return {"message": f"User {user_id} already exists in the database"}


# Endpoint to add conversation
class Conversation(BaseModel):
    collection_id: str
    user_id: str
    conversation_id: str
    
class ConversationId(BaseModel):
    conversation_id: str

@app.post("/add_conversation/")
async def add_conversation(conversation: Conversation):
    conversation_id = db.add_conversation(collection_id=conversation.collection_id, user_id=conversation.user_id, conversation_id=conversation.conversation_id)
    return {"conversation_id": conversation_id}

@app.post("/delete_conversation/")
async def delete_conversation(conversation_id: ConversationId):
    db.remove_conversation(conversation_id.conversation_id)
    return {"message": f"Conversation deleted: {conversation_id.conversation_id}"}

@app.get("/get_conversations_by_user/")
async def get_conversations_by_user(user_id: str):
    conversations = db.get_conversations_by_user(user_id)
    return {"conversations": conversations}

@app.get("/get_conversations_by_collection/")
async def get_conversations_by_collection(collection_id: str):
    conversations = db.get_conversations_by_collection(collection_id)
    return {"conversations": conversations}

@app.get("/get_empty_conversation_by_collection/")
async def get_empty_conversation_by_collection(collection_id: str):
    conversations = db.get_empty_conversation_by_collection(collection_id)
    return {"conversations": conversations}

@app.get("/get_conversation_messages/")
async def get_conversation_messages(conversation_id: str):
    conversation_messages = db.get_conversation_messages(conversation_id)
    return {"conversation_messages": conversation_messages}

@app.get("/get_conversation_exists/")
async def get_conversation_exists(conversation_id: str, user_id: str):
    conversation_exists = db.conversation_exists(conversation_id, user_id)
    return {"message": conversation_exists}

class MessageRequest(BaseModel):
    conversation_id: str
    text: str
    is_user: bool
    is_complete: bool

@app.post("/add_message/")
async def add_message(request: MessageRequest):
    # add a message to a conversation
    message_id = db.add_message(conversation_id=request.conversation_id, text=request.text, 
                    is_user=request.is_user, is_complete=request.is_complete)
    return {"message_id": message_id}
    
class Collection(BaseModel):
    user_id: str
    name: str
    collection_id: str
    
@app.get("/get_collection_exists/")
async def get_collection_exists(collection_id: str, user_id: str):
    collection_exists = db.collection_exists(collection_id=collection_id, user_id=user_id)
    return {"message": collection_exists}
    
@app.post("/add_collection/")
async def add_collection(collection: Collection):
    collection_id = db.add_collection(user_id=collection.user_id, name=collection.name, collection_id=collection.collection_id)
    if collection_id is None:
        collection_id = "exists"
    return {"collection_id": collection_id}

class CollectionId(BaseModel):
    collection_id: str

@app.post("/delete_collection/")
async def delete_collection(collection_id: CollectionId):
    print(f"Starting deletion of collection with ID: {collection_id.collection_id}")
    # retrieve all document IDs associated with the collection
    documents = db.get_documents_by_collection(collection_id.collection_id)
    print(f"Retrieved documents: {documents}")
    # attempt to remove documents from the embedding handler
    doc_ids = [doc.document_id for doc in documents]
    print(f"Document IDs to remove: {doc_ids}")
    try:
        chatbot.embedding_handler.remove_documents(doc_ids)
        print("Documents successfully removed from embedding handler.")
    except Exception as e:
        print(f"Failed to delete documents: {str(e)}")
        return {"status": "error", "message": f"Failed to delete documents: {str(e)}"}
    # remove the collection itself
    db.remove_collection(collection_id.collection_id)
    print(f"Collection {collection_id.collection_id} removed from database.")
    return {"message": f"Collection deleted: {collection_id.collection_id}"}

@app.get("/get_collections_by_user/")
async def get_collections_by_user(user_id: str):
    collections = db.get_collections_by_user(user_id)
    return {"collections": collections}

@app.get("/get_documents_by_collection/")
async def get_documents_by_collection(collection_id: str):
    documents = db.get_documents_by_collection(collection_id)
    return {"documents": documents}

class DocumentId(BaseModel):
    document_id: str
    
@app.post("/delete_document/")
async def delete_document(document_id: DocumentId):
    try:
        db.delete_document(document_id.document_id)
        chatbot.embedding_handler.remove_documents([document_id.document_id])
        return {"status": "success", "message": f"Document deleted: {document_id.document_id}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

### FILE/URL PROCESSING ###

@app.post("/process_file/")
async def process_file(collection_id: str = Form(...), file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    filename = file.filename
    file_extension = os.path.splitext(filename)[1]
    print(f"Processing file: {filename} with extension: {file_extension}")
    
    if file_extension == '.zip':
        contents = await file.read()
        print("Reading zip file contents")
        zip_contents = chatbot.embedding_handler.read_zip_contents(contents, filename)
        if zip_contents[0] == "error":
            print(f"Error reading zip contents: {zip_contents[1]}")
            return {"status": "error", "message": f"Error reading zip contents: {zip_contents[1]}"}
        
        processing_results = []
        document_ids = []
        for file_name, file_content in zip_contents[1]:
            document_id = str(uuid.uuid4())
            print(f"Processing file: {file_name} with generated document ID: {document_id}")
            processing_result = chatbot.embedding_handler.fully_process_file(file_content.encode(), file_name, document_id)
            if processing_result[0] == "success":
                db.add_document(document_id, collection_id, file_name, file_content.encode())
                processing_results.append({"document_id": document_id, "status": "success", "filename": file_name})
                document_ids.append(document_id)
            else:
                processing_results.append({"document_id": document_id, "status": "error", "filename": file_name, "message": processing_result[1]})
                print(f"Error processing file: {file_name}, aborting and cleaning up")
                # if any file fails, abort and clean up all processed documents
                if document_ids:
                    chatbot.embedding_handler.remove_documents(document_ids)
                    for doc_id in document_ids:
                        db.delete_document(doc_id)
                return {"status": "error", "message": "Not all files in zip could be processed successfully, aborted and cleaned up partial data", "documents": processing_results}
        
        print("All files in zip processed successfully")
        return {"status": "success", "message": "All files in zip processed successfully", "documents": processing_results}
    else:
        document_id = str(uuid.uuid4())
        contents = await file.read()
        print(f"Processing single file: {filename} with document ID: {document_id}")
        processing_result = chatbot.embedding_handler.fully_process_file(contents, filename, document_id)
        if processing_result[0] == "success":
            # add the document to the database if processing was successful
            db.add_document(document_id, collection_id, filename, contents)
            print(f"File processed and added to collection ID: {collection_id}")
            return {"status": "success", "message": "File processed successfully", "document_id": document_id}
        else:
            print(f"Error processing file: {filename}")
            return {"status": "error", "message": f"Error processing file: {processing_result[1]}", "document_id": document_id}

@app.post("/process_url/")
async def process_url(collection_id: str = Form(...), url: str = Form(...)):
    document_id = str(uuid.uuid4())
    if not url:
        raise HTTPException(status_code=400, detail="No URL provided")
    try:
        print(f"Processing URL for collection ID: {collection_id}")
        # process the URL using the embedding handler
        processing_result = chatbot.embedding_handler.fully_process_url(url, document_id)
        if processing_result[0] == "success":
            # add the document to the database if processing was successful
            db.add_document(document_id, collection_id, url, "URL content processed")
            return {"status": "success", "message": "URL processed successfully", "document_id": document_id}
        else:
            return {"status": "error", "message": f"Error processing URL: {processing_result[1]}", "document_id": document_id}
    except Exception as e:
        return {"status": "error", "message": f"Error processing URL: {str(e)}", "document_id": document_id}

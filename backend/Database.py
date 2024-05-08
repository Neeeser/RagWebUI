import json
import pytz
from sqlalchemy import create_engine, Column, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.types import JSON
import uuid
from datetime import datetime

Base = declarative_base()
eastern = pytz.timezone('US/Eastern')

# define the User class, which represents a user in the database
class User(Base):
    __tablename__ = 'users'

    user_id = Column(String, primary_key=True)

    # define relationships with Conversation and Collection classes
    conversations = relationship('Conversation', back_populates='user', cascade='all, delete-orphan')
    collections = relationship('Collection', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<User(user_id='{self.user_id}')>"

# define the Message class, which represents a message in the database
class Message(Base):
    __tablename__ = 'messages'

    message_id = Column(String, primary_key=True)
    text = Column(String)
    is_user = Column(Boolean)
    is_complete = Column(Boolean)
    conversation_id = Column(String, ForeignKey('conversations.conversation_id'))

    conversation = relationship('Conversation', back_populates='messages')

    def __repr__(self):
        return f"<Message(id='{self.message_id}', text='{self.text}')>"

#define the Conversation class, which represents a conversation in the database
class Conversation(Base):
    __tablename__ = 'conversations'

    conversation_id = Column(String, primary_key=True)
    collection_id = Column(String, ForeignKey('collections.collection_id'))
    user_id = Column(String, ForeignKey('users.user_id'))
    raw_conversation = Column(JSON)
    last_updated = Column(DateTime, default=lambda: datetime.now(eastern), onupdate=lambda: datetime.now(eastern))
    title = Column(String)

    # Define relationships with User, Collection, and Message classes
    user = relationship('User', back_populates='conversations')
    collection = relationship('Collection', back_populates='conversations')
    messages = relationship('Message', back_populates='conversation', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Conversation(conversation_id='{self.conversation_id}')>"

class Document(Base):
    __tablename__ = 'documents'

    document_id = Column(String, primary_key=True)
    title = Column(String)
    content = Column(String)
    collection_id = Column(String, ForeignKey('collections.collection_id'))
    collection = relationship('Collection', back_populates='documents')

    def __repr__(self):
        return f"<Document(id='{self.document_id}', title='{self.title}')>"

# define the Collection class, which represents a collection in the database
class Collection(Base):
    __tablename__ = 'collections'

    collection_id = Column(String, primary_key=True)
    name = Column(String)
    user_id = Column(String, ForeignKey('users.user_id'))

    # define relationships with User, Conversation, and Document classes
    user = relationship('User', back_populates='collections')
    conversations = relationship('Conversation', back_populates='collection', cascade='all, delete-orphan')
    documents = relationship('Document', back_populates='collection', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Collection(collection_id='{self.collection_id}')>"

# define the Database class, which provides methods for interacting with the database
class Database:
    def __init__(self):
        # Create an engine for connecting to the SQLite database
        self.engine = create_engine('sqlite:///database.db')
        # Create all tables defined in the declarative base
        Base.metadata.create_all(self.engine)
        # Create a session factory bound to the engine
        self.Session = sessionmaker(bind=self.engine)
        # Create a new session
        self.session = self.Session()

    ### USER ###

    def add_user(self, user_id):
        # Check if the user already exists in the database
        existing_user = self.session.query(User).filter_by(user_id=user_id).first()
        if existing_user:
            return False  # User already exists

        # Create a new User object and add it to the session
        user = User(user_id=user_id)
        self.session.add(user)
        self.session.commit()
        return True  # User added successfully
    
    def remove_user(self, user_id):
        # query the User object by user_id
        user = self.session.query(User).filter_by(user_id=user_id).first()
        if user:
            # delete all collections associated with the user using the remove_collection function
            collections = self.session.query(Collection).filter_by(user_id=user_id).all()
            for collection in collections:
                self.remove_collection(collection.collection_id)
            # finally, delete the user itself
            self.session.delete(user)
            self.session.commit()
            
    def get_user(self, user_id):
        # Query the User object by user_id and return it
        return self.session.query(User).filter_by(user_id=user_id).first()
            
    def get_all_users(self):
        # Query all User objects and return them as a list
        return self.session.query(User).all()
            
    ### CONVERSATIONS ###

    def add_conversation(self, conversation_id, user_id, collection_id):
        # create a new conversation object and add it to the session
        conversation = Conversation(conversation_id=conversation_id, title="New chat",
                    collection_id=collection_id, user_id=user_id, last_updated=datetime.now(eastern))
        self.session.add(conversation)
        self.session.commit()
        return conversation_id

    def conversation_exists(self, conversation_id, user_id):
        # check if a conversation with the given conversation_id exists for the specified user
        return bool(self.session.query(Conversation).filter_by(conversation_id=conversation_id, user_id=user_id).first())

    def get_conversations_sorted_by_last_updated(self):
        return self.session.query(Conversation).order_by(Conversation.last_updated.desc()).all()

    def get_conversations_by_user_sorted_by_last_updated(self, user_id):
        user = self.session.query(User).filter_by(user_id=user_id).first()
        if user:
            return self.session.query(Conversation).filter_by(user_id=user_id).order_by(Conversation.last_updated.desc()).all()
        return []
    
    def get_conversation(self, conversation_id):
        # Query the Conversation object by conversation_id and return it
        return self.session.query(Conversation).filter_by(conversation_id=conversation_id).first()
            
    def update_conversation_raw(self, conversation_id, raw_conversation):
        # query the conversation by conversation_id
        conversation = self.session.query(Conversation).filter_by(conversation_id=conversation_id).first()
        if conversation:
            # update the raw_conversation field
            conversation.raw_conversation = raw_conversation
            self.session.commit()

    def get_conversation_raw(self, conversation_id):
        # query the conversation by conversation_id
        conversation = self.session.query(Conversation).filter_by(conversation_id=conversation_id).first()
        if conversation:
            # return the raw_conversation field
            return conversation.raw_conversation
        return None

    def get_conversation_messages(self, conversation_id):
        conversation = self.session.query(Conversation).filter_by(conversation_id=conversation_id).first()
        if conversation:
            return conversation.messages
        return []
    
    def get_conversation_title(self, conversation_id):
        conversation = self.session.query(Conversation).filter_by(conversation_id=conversation_id).first()
        if conversation:
            return conversation.title
        return "New chat"
    
    def update_conversation_title(self, conversation_id, title):
        conversation = self.session.query(Conversation).filter_by(conversation_id=conversation_id).first()
        if conversation:
            conversation.title = title
            self.session.commit()
            
    def get_conversations_by_user(self, user_id):
        # Query the User object by user_id and return its associated conversation
        user = self.session.query(User).filter_by(user_id=user_id).first()
        if user:
            return user.conversations
        return []
    
    def get_conversations_by_collection(self, collection_id):
        # Query the collection object by collection_id and return its associated conversations
        collection = self.session.query(Collection).filter_by(collection_id=collection_id).first()
        if collection:
            return collection.conversations
        return []
    
    def get_empty_conversation_by_collection(self, collection_id):
        # query the collection object by collection_id and check for conversations with empty messages
        collection = self.session.query(Collection).filter_by(collection_id=collection_id).first()
        if collection:
            for conversation in collection.conversations:
                if not conversation.raw_conversation:  # check if the conversation has no messages
                    print(f"Found empty conversation with ID: {conversation.conversation_id}")
                    return [conversation]
        return []
    
    def get_all_conversations(self):
        # Query all Conversation objects and return them as a list
        return self.session.query(Conversation).all()

    def remove_conversation(self, conversation_id):
        # query the Conversation object by conversation_id
        conversation = self.session.query(Conversation).filter_by(conversation_id=conversation_id).first()
        if conversation:
            # delete all messages associated with the conversation
            messages = self.session.query(Message).filter_by(conversation_id=conversation_id).all()
            for message in messages:
                self.session.delete(message)
            # delete the conversation itself
            self.session.delete(conversation)
            self.session.commit()
          
    ### MESSAGES ###
            
    def add_message(self, conversation_id, text, is_user, is_complete):
        print(f"Attempting to add message to conversation ID: {conversation_id}")
        conversation = self.session.query(Conversation).filter_by(conversation_id=conversation_id).first()
        if conversation:
            message_id = str(uuid.uuid4())
            print(f"Generated message ID: {message_id}")
            message = Message(message_id=message_id, text=text, is_user=is_user, is_complete=is_complete, conversation_id=conversation_id)
            conversation.last_updated = datetime.now(eastern)
            print(f"Updating last_updated for conversation ID: {conversation_id}")
            self.session.add(message)
            self.session.commit()
            print(f"Message added successfully with ID: {message_id}")
            return message_id
        else:
            print(f"No conversation found with ID: {conversation_id}")
        return None
    
    def remove_message(self, message_id):
        # query the Message object by message_id
        message = self.session.query(Message).filter_by(message_id=message_id).first()
        if message:
            self.session.delete(message)
            self.session.commit()
            return True  # message deleted successfully
        return False  # message not found
    
    ### COLLECTIONS ###

    def collection_exists(self, user_id, name=None, collection_id=None):
        # check if any collection with the given name or id exists for the specified user
        if name:
            return self.session.query(Collection).filter_by(user_id=user_id, name=name).first() is not None
        elif collection_id:
            return self.session.query(Collection).filter_by(user_id=user_id, collection_id=collection_id).first() is not None
        return False

    def add_collection(self, user_id, name, collection_id):
        # check if a collection with the same name already exists for the user
        if self.collection_exists(user_id, name):
            return None 
        # create a new Collection object and add it to the session
        collection = Collection(collection_id=collection_id, user_id=user_id, name=name)
        self.session.add(collection)
        self.session.commit()
        return collection_id

    def remove_collection(self, collection_id):
        # query the Collection object by collection_id
        collection = self.session.query(Collection).filter_by(collection_id=collection_id).first()
        if collection:
            print(f"Collection found with ID: {collection_id}, proceeding with deletion.")
            # delete all documents associated with the collection
            documents = self.session.query(Document).filter_by(collection_id=collection_id).all()
            for document in documents:
                print(f"Deleting document with ID: {document.document_id}")
                self.session.delete(document)
            # delete all conversations associated with the collection
            conversations = self.session.query(Conversation).filter_by(collection_id=collection_id).all()
            for conversation in conversations:
                print(f"Deleting conversation with ID: {conversation.conversation_id}")
                self.remove_conversation(conversation.conversation_id)
            # delete the collection itself
            print(f"Deleting collection with ID: {collection_id}")
            self.session.delete(collection)
            self.session.commit()
            print("Deletion of collection and associated items committed.")
        else:
            print(f"No collection found with ID: {collection_id}")

    def get_collection(self, collection_id):
        # Query the Collection object by collection_id and return it
        return self.session.query(Collection).filter_by(collection_id=collection_id).first()

    def get_all_collections(self):
        # Query all Collection objects and return them as a list
        return self.session.query(Collection).all()

    def get_collections_by_user(self, user_id):
        # query the User object by user_id and return its associated collections
        print(f"Debug: Fetching user with user_id={user_id}")
        user = self.session.query(User).filter_by(user_id=user_id).first()
        if user:
            print(f"Debug: Found user, returning collections for user_id={user_id}")
            return user.collections
        print(f"Debug: No user found with user_id={user_id}, returning empty list")
        return []
    
    ### DOCUMENTS ###

    def add_document(self, document_id, collection_id, title, content):
        collection = self.get_collection(collection_id)
        if collection:
            document = Document(title=title, content=content, collection=collection, document_id=document_id)
            self.session.add(document)
            self.session.commit()
            return {"message": "Document added successfully.", "status": "success"}
        else:
            return {"message": "Collection not found.", "status": "error"}

    def get_documents_by_collection(self, collection_id):
        collection = self.get_collection(collection_id)
        if collection:
            return collection.documents
        return []

    def get_documents_by_conversation(self, conversation_id):
        conversation = self.get_conversation(conversation_id)
        if conversation:
            return self.get_documents_by_collection(conversation.collection_id)
        return []

    def remove_document(self, document_id):
        document = self.session.query(Document).filter_by(id=document_id).first()
        if document:
            self.session.delete(document)
            self.session.commit()
            return {"message": "Document removed successfully.", "status": "success"}
        else:
            return {"message": "Document not found.", "status": "error"}

if __name__ == '__main__':
    # Create a new instance of the Database class
    db = Database()

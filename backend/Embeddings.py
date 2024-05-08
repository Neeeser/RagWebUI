import chromadb
from typing import List, Dict, Tuple
from UploadHandler import UploadHandler
import uuid
import cohere

class EmbeddingHandler:
    def __init__(self, persist_directory: str = "./chromadb", similarity_score: float = 0.01, collection: str = "crisischatbot", chunk_size: int = 1000, chunk_overlap: int = 0):
        self.db = chromadb.PersistentClient(path=persist_directory)
        self.collection = self.db.get_or_create_collection(collection)
        with open("cohere.txt", "r") as file:
            self.cohere_key = file.read().strip()
        self.upload_handler = UploadHandler()
        self.co = cohere.Client(self.cohere_key)
        self.similarity_score = similarity_score

    def fully_process_file(self, file_content: bytes, filename: str, document_id: str) -> Tuple[str, str]:
        result = self.upload_handler.handle_file(file_content, filename)
        if result[0] == "error":
            return ["error", result[1]]
        documents, ids, metadatas = [], [], []
        for chunk in result[1]:
            documents.append(chunk)
            unique_id = str(uuid.uuid4())
            ids.append(unique_id)
            metadatas.append({'document_id': document_id, 'filename': filename})
        return self.add_processed_documents(documents, ids, metadatas)
            
    def fully_process_url(self, url: str, document_id: str) -> Tuple[str, str]:
        result = self.upload_handler.handle_urls([url], "url")
        if result[0] != "success":
            return ["error", result[1]]

        documents, ids, metadatas = [], [], []
        for chunk in result[1]:
            documents.append(chunk)
            unique_id = str(uuid.uuid4())
            ids.append(unique_id)
            metadatas.append({'document_id': document_id, 'filename': url})

        return self.add_processed_documents(documents, ids, metadatas)
    
    def read_zip_contents(self, file_content: bytes, filename: str) -> Tuple[str, List[Tuple[str, str]]]:
        try:
            extracted_contents = self.upload_handler.extract_zip_contents(file_content)
            return ["zip", extracted_contents]
        except Exception as e:
            return ["error", f"Failed to read zip contents for {filename}: {str(e)}"]

    def add_processed_documents(self, documents: List[str], ids: List[str], metadatas: List[Dict[str, str]]) -> Tuple[str, str]:
        try:
            self.collection.add(documents=documents, metadatas=metadatas, ids=ids)
            return ["success", ""]
        except Exception as e:
            filename = metadatas[0]['filename'] if metadatas else "Unknown"
            return ["error", f"An error occurred while embedding {filename}: {str(e)}"]
        
    def remove_documents(self, document_ids: List[str]) -> Tuple[str, str]:
        try:
            for doc_id in document_ids:
                self.collection.remove(where={"document_id": doc_id})
            return ["success", ""]
        except Exception as e:
            return ["error", f"An error occurred while removing documents: {str(e)}"]

    def retrieve_documents(self, query: str, num_docs: int = 5, metadata_filters: Dict[str, str] = None) -> Tuple[str, str, List[Dict[str, any]]]:
        try:
            print(f"query received: {query}")
            print(f"number of documents requested: {num_docs}")
            print(f"metadata filters: {metadata_filters}")

            if metadata_filters is None:
                query_result = self.collection.query(query_texts=[query], n_results=100)
                print("querying without metadata filters.")
            else:
                query_result = self.collection.query(query_texts=[query], n_results=100, where=metadata_filters)
                print("querying with metadata filters.")

            documents = query_result["documents"][0]
            distances = query_result["distances"][0]
            metadatas = query_result["metadatas"][0]

            # sort documents by distance in ascending order
            sorted_docs = sorted(zip(documents, distances, metadatas), key=lambda x: x[1])
            sorted_docs = [{"text": doc, "metadata": meta} for doc, _, meta in sorted_docs]

            # rerank all retrieved documents using Cohere's rerank model
            if sorted_docs:
                print(f"top N documents to rerank: {num_docs}")
                to_rank = [doc["text"] for doc in sorted_docs]
                rerank_response = self.co.rerank(
                    model="rerank-english-v3.0",
                    query=query,
                    documents=to_rank,
                    top_n=num_docs
                )
                
                reranked_docs = []
                for rank in rerank_response.results:
                    print(rank.relevance_score, rank.index)
                    if rank.relevance_score >= self.similarity_score:
                        doc_index = rank.index
                        doc_text = sorted_docs[doc_index]["text"]
                        metadata = sorted_docs[doc_index]["metadata"]
                        reranked_docs.append({"text": doc_text, "metadata": metadata})
                
                return ["success", "", reranked_docs]
            else:
                print("no documents to rerank.")
                return ["success", "", sorted_docs]
        except Exception as e:
            print(f"an error occurred: {str(e)}")
            return ["error", f"an error occurred retrieving documents for query {query}: {str(e)}", []]

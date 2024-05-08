import ollama
import requests
import json
from openai import OpenAI
import os

class LLMInteraction:
    def __init__(self, model="llama3:instruct"):
        self.model = model
        self.local_model = True  # default to true, assuming most models are local
        self.conversation_history = []
        self.api_key = None
        # read the api key from the openrouter.txt file if it exists and is not empty
        if os.path.exists('openrouter.txt') and os.path.getsize('openrouter.txt') > 0:
            with open('openrouter.txt', 'r') as file:
                self.api_key = file.read().strip()
        if self.api_key:
            self.client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=self.api_key)
        # determine if the model is local or paid and initialize accordingly
        if model.lower() in ["openai/gpt-4-turbo-preview", "anthropic/claude-3-opus:beta", "anthropic/claude-3-haiku:beta", "anthropic/claude-3-sonnet:beta"]:
            self.local_model = False
        else:
            # ensure the model is synchronized before any loadings is attempted
            ollama.pull(self.model)

    def switch_model(self, new_model):
        # switch the model and reinitialize the pipeline
        self.model = new_model
        if new_model.lower() in ["openai/gpt-4-turbo-preview", "anthropic/claude-3-opus:beta", "anthropic/claude-3-haiku:beta", "anthropic/claude-3-sonnet:beta"]:
            self.local_model = False
        else:
            self.local_model = True
            # ensure the model is synchronized before any loadings is attempted
            ollama.pull(self.model)
            
    def get_paid_status(self):
        # check if there is an api key and return true if it exists
        return bool(self.api_key)

    def generate_title(self, past_conversation):
        title_generator_template = [
            {
                "role": "system",
                "content": "You are an expert at taking a user query and model response and generating a concise title for the intent. Your generated title should be between 3 and 5 words. Do not include any specific names, dates, or other superfluous information. Do not include the words 'Title:' ahead of your answer. The generated title should be standalone without any additional labeling.",
            }
        ]
        
        #print(f"Past conversation: {past_conversation}")
        
        title_generator_template.append({"role": "user", "content": str(past_conversation)})
        
        if self.api_key:
            # send a request to openrouter.ai for response generation
            response = self.client.chat.completions.create(
                model="anthropic/claude-3-haiku:beta",
                messages=title_generator_template,
            )
            return response.choices[0].message.content
        else:
            # use local model for title generation
            response = ollama.chat(
                model=self.model,
                messages=title_generator_template,
                stream=False
            )
            return response['message']['content']

    def generate_response(self, query, similar_documents=None, conversation=None, switch_model_to=None, max_tokens=2048):        
        # if a model switch is requested, perform the switch before generating the response
        if switch_model_to is not None:
            self.switch_model(switch_model_to)

        # if a conversation history is provided, use it; otherwise, start a new conversation
        if conversation is not None:
            self.conversation_history = conversation
        else:
            self.conversation_history = [
                {
                    "role": "system",
                    "content": "You are a helpful knowledge retrieval agent. You are provided documents that you can use to answer user queries. You should answer the user queries only based on the provided documents, and inform the user if you either were not provided documents, or the documents do not seem to answer their question.",
                }
            ]
        
        if self.local_model:
            response = ollama.chat(
                model=self.model, 
                messages=self.conversation_history,
                stream=True,
            )
            
            for chunk in response:
                yield (chunk['message']['content'])
        else:
            
            # send a request to openrouter.ai for response generation
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=self.conversation_history,
                stream=True,
            )
            for chunk in stream:
                # print(chunk)
                yield (chunk.choices[0].delta.content or '')

        if similar_documents:
            # print("Similar documents found: ", similar_documents)
            # print()
            structured_documents = ""
            # update to use the new distinction pattern for attaching context
            context_marker_start = "<$$ THIS SIGNIFIES THE BEGINNING OF RELEVANT CONTEXTUAL DOCUMENTS $$>\n\n"
            context_marker_end = "<$$ THIS SIGNIFIES THE END OF ATTACHED DATA AND MARKS THE BEGINNING OF USER QUERY $$>\n\n"
            documents_content = similar_documents.split(context_marker_end)[0].replace(context_marker_start, "").strip()
            # print("Documents content: ", documents_content)
            # using unique markers to split documents safely
            document_separator = "\n<$$ Document Separator $$>\n"
            documents = documents_content.split(document_separator)
            # print("Documents: ", documents)
            #print(documents)
            for doc in documents:
                if "<$$ Document Index:" in doc:
                    index_marker = "<$$ Document Index: "
                    filename_marker = "<$$ Filename: "
                    content_marker = "<$$ Content: "
                    index_end = doc.find(" $$>")
                    filename_start = doc.find(filename_marker) + len(filename_marker)
                    filename_end = doc.find(" $$>", filename_start)
                    content_start = doc.find(content_marker) + len(content_marker)
                    content_end = doc.find(" $$>", content_start)
                    title = doc[filename_start:filename_end]
                    content = doc[content_start:content_end]
                    # print(f"Title: {title}\nContent: {content}")
                    structured_documents += "{citeTitStart}" + title + "{citeTitEnd}{citeConStart}" + content + "{citeConEnd}\n\n"
            # remove the last two newlines for clean formatting
            # print("Structured documents: ", structured_documents)
            structured_documents = structured_documents.strip()
            # print("Stripped Structured documents: ", structured_documents)
            if structured_documents:
                yield "\n\n---\n\n### Document Citations:\n\n"
                yield structured_documents

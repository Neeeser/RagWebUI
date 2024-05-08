from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_transformers import Html2TextTransformer
from typing import List, Tuple
import html2text
import zipfile
import os
import requests
import re
from io import BytesIO

class UploadHandler:
    def __init__(self, chunk_size: int = 1000):
        self.valid_file_types = ['.html', '.txt']
        self.html_transformer = Html2TextTransformer()
        self.chunk_size = chunk_size
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=0,
            length_function=len,
            is_separator_regex=False,
            separators=["\n\n", "\n", " ", ""]
        )
        self.h = html2text.HTML2Text()
        self.h.ignore_links = True
        self.h.ignore_images = True
        self.h.ignore_emphasis = True
        with open('scrapingant.txt', 'r') as file:
            self.scraping_key = file.read().strip()
        
        
    def handle_file(self, file: bytes, filename: str):
        file_extension = os.path.splitext(filename)[1]
        if file_extension in self.valid_file_types:
            if file_extension == '.html':
                return self.handle_html(file, filename)
            elif file_extension == '.txt':
                return self.handle_text(file, filename)
        else:
            return ["error", f"Error parsing {filename}: Unsupported file type {file_extension}"]
        
    def handle_html(self, file: bytes, filename: str):
        try:
            text = file.decode()
            # print(f"Decoded text type: {type(text)}")  # debugging: check the type of decoded text
            
            parsed_html = self.h.handle(text)
            # print(f"Parsed HTML type: {type(parsed_html)}")  # debugging: check the type of parsed HTML
            
            chunks = self.text_splitter.split_text(parsed_html)
            # print(f"Chunks type: {type(chunks)}")  # debugging: check the type of chunks
            return ["success", chunks]
        except Exception as e:
            return ["error", f"An error occurred while parsing {filename}: {str(e)}"]
        
    def handle_text(self, file: bytes, filename: str):
        try:
            text = file.decode()
            lines = text.splitlines()
            url_pattern = re.compile(r'https?://[^\s]+')
            if lines and url_pattern.match(lines[0]):
                urls = [line for line in lines if url_pattern.match(line)]
                if urls:
                    return self.handle_urls(urls, filename)
                else:
                    return ["error", f"Error in parsing, no valid URLs found in {filename}"]
            else:
                chunks = self.text_splitter.split_text(text)
                return ["success", chunks]
        except Exception as e:
            return ["error", f"An error occurred while parsing {filename}: {str(e)}"]
        
        
    def handle_urls(self, urls: List[str], filename: str):
        try:
            all_chunks = []
            for url in urls:
                params = {
                    'url': url,
                    'x-api-key': self.scraping_key,
                    'proxy_country': 'US',
                    'return_page_source': 'true'
                }
                response = requests.get('https://api.scrapingant.com/v2/general', params=params)
                # print(f"Response status code: {response}")
                data = response.text
                # print(f"Data type: {data}")
                parsed_html = self.h.handle(data)
                chunks = self.text_splitter.split_text(parsed_html)
                all_chunks.extend(chunks)
            
            return ["success", all_chunks]
        except Exception as e:
            return ["error", f"An error occurred while parsing URLs from {filename}: {str(e)}"]

    def extract_zip_contents(self, file: bytes) -> List[Tuple[str, str]]:
        try:
            with zipfile.ZipFile(BytesIO(file), 'r') as zip_ref:
                return [(file, zip_ref.read(file).decode()) for file in zip_ref.namelist()]
        except Exception as e:
            return [("error", f"Failed to extract zip contents: {str(e)}")]
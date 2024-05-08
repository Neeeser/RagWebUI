#!/bin/bash
set -e

# function to check if a process is running
is_process_running() {
    pgrep -f "$1" > /dev/null
    return $?
}

# function to download and install Ollama for macOS
download_and_install_ollama_mac() {
    if [ -f "Ollama-darwin.zip" ]; then
        echo "Installer already downloaded."
    else
        echo "Downloading Ollama app for macOS..."
        curl -L "https://ollama.com/download/Ollama-darwin.zip" -o Ollama-darwin.zip
    fi
    if [ ! -f "Ollama-darwin.zip" ]; then
        echo "Failed to download Ollama-darwin.zip. Please check your internet connection or the URL and try again."
        exit 1
    fi
    unzip Ollama-darwin.zip -d Ollama
    open Ollama/Ollama.app
}

# check if Ollama app is installed or running
echo "Checking for Ollama app..."
if ! is_process_running "ollama app"; then
    echo "Ollama app not running."
    if [ ! -d "/Applications/Ollama.app" ]; then
        echo "Ollama app not found."
        download_and_install_ollama_mac
    fi
else
    echo "Ollama app already running."
fi

# setup backend
echo "Setting up backend..."
cd backend
if [ ! -d venv ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
echo "Navigate to the backend directory and run 'uvicorn FastAPI:app --port 8000 --reload' to start the backend server."

# setup frontend
echo "Setting up frontend..."
cd ../frontend
echo "Navigate to the frontend directory and run 'npm install' followed by 'npm run dev' to start the frontend development server."

# cleanup any downloaded or temporary files
echo "Cleaning up..."
if [ -f "Ollama-darwin.zip" ]; then
    rm -f Ollama-darwin.zip
fi
echo "Cleanup complete."
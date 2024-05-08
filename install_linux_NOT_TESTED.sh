#!/bin/bash
# enable error checking
set -e

# check if Ollama app is installed or running
echo "Checking for Ollama app..."
if ! pgrep -x "ollama app" > /dev/null; then
    echo "Ollama app not running."
    if [ ! -f "$HOME/.local/share/Ollama/ollama app" ]; then
        echo "Ollama app not found."
        # check if installer was previously downloaded
        if [ -f OllamaSetup.sh ]; then
            echo "Installer already downloaded."
        else
            echo "Downloading Ollama app installer..."
            curl -L "https://ollama.com/download/OllamaSetup.sh" -o OllamaSetup.sh
            if [ $? -ne 0 ]; then
                echo "Failed to download OllamaSetup.sh. Please check your internet connection or the URL and try again."
                exit 1
            fi
        fi
        # revised error checking logic after download
        if [ ! -f OllamaSetup.sh ]; then
            echo "Failed to download OllamaSetup.sh. Please check your internet connection or the URL and try again."
            exit 1
        fi
        chmod +x OllamaSetup.sh
        ./OllamaSetup.sh
        if [ ! -f "$HOME/.local/share/Ollama/ollama app" ]; then
            echo "Installation failed. Please try installing manually."
            exit 1
        fi
    fi
    "$HOME/.local/share/Ollama/ollama app" &
    if [ $? -ne 0 ]; then
        echo "Failed to start Ollama app. Please check the installation."
        exit $?
    fi
else
    echo "Ollama app already running."
fi

# setup backend
echo "Setting up backend..."
cd backend
if [ ! -d venv ]; then
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment. Please ensure Python is installed and try again."
        exit $?
    fi
fi
source venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install backend requirements. Please check the requirements file and try again."
    exit $?
fi
( uvicorn FastAPI:app --port 8000 --reload ) &

# setup frontend
echo "Setting up frontend..."
cd ../frontend
( npm install && npm run dev ) &

# cleanup any downloaded or temporary files
echo "Cleaning up..."
if [ -f OllamaSetup.sh ]; then rm -f OllamaSetup.sh; fi
echo "Cleanup complete."

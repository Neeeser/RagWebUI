@echo off
SETLOCAL EnableDelayedExpansion

:: check if Ollama app is installed or running
echo Checking for Ollama app...
tasklist | find /i "ollama app.exe" >nul
if %ERRORLEVEL% == 1 (
    echo Ollama app not running.
    if not exist "%USERPROFILE%\AppData\Local\Programs\Ollama\ollama app.exe" (
        echo Ollama app not found.
        :: check if installer was previously downloaded
        if exist OllamaSetup.exe (
            echo Installer already downloaded.
        ) else (
            echo Downloading Ollama app installer...
            curl -L "https://ollama.com/download/OllamaSetup.exe" -o OllamaSetup.exe
            if %ERRORLEVEL% neq 0 (
                echo Failed to download OllamaSetup.exe. Please check your internet connection or the URL and try again.
                exit /b %ERRORLEVEL%
            )
        )
        :: revised error checking logic after download
        if not exist OllamaSetup.exe (
            echo Failed to download OllamaSetup.exe. Please check your internet connection or the URL and try again.
            exit /b 1
        )
        start /wait OllamaSetup.exe
        if not exist "%USERPROFILE%\AppData\Local\Programs\Ollama\ollama app.exe" (
            echo Installation failed. Please try installing manually.
            exit /b 1
        )
    )
    start "" "%USERPROFILE%\AppData\Local\Programs\Ollama\ollama app.exe"
    if %ERRORLEVEL% neq 0 (
        echo Failed to start Ollama app. Please check the installation.
        exit /b %ERRORLEVEL%
    )
) else (
    echo Ollama app already running.
)

:: setup backend
echo Setting up backend...
cd backend
if not exist venv (
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo Failed to create virtual environment. Please ensure Python is installed and try again.
        exit /b %ERRORLEVEL%
    )
)
call venv\Scripts\activate
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo Failed to install backend requirements. Please check the requirements file and try again.
    exit /b %ERRORLEVEL%
)
start cmd /k "echo Navigate to the backend directory and run 'uvicorn FastAPI:app --port 8000 --reload' to start the backend server. && cd backend"

:: setup frontend
echo Setting up frontend...
cd ../frontend
start cmd /k "echo Navigate to the frontend directory and run 'npm install' followed by 'npm run dev' to start the frontend development server. && cd frontend"

:: cleanup any downloaded or temporary files
echo Cleaning up...
if exist OllamaSetup.exe del /f OllamaSetup.exe
echo Cleanup complete.

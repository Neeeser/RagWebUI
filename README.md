# Intelligent-QA-Chatbot


## Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
  - [Auth0 Setup](#auth0-setup)
  - [OpenRouter Setup](#openrouter-setup)
  - [Backend Installation](#backend-installation)
  - [Frontend Installation](#frontend-installation)
- [Usage](#usage)

## Introduction
This project is a chat application that utilizes FastAPI/Uvicorn on Python for the backend and Next.js with Tailwind CSS for the frontend. It integrates with Auth0 for authentication and OpenRouter for complex reasoning and high-quality inferencing over documents.

## Installation

### Auth0 Setup
1. Sign up for an Auth0 account:
   - Go to the Auth0 website (https://auth0.com/) and click on the "Sign Up" button.
   - Fill in the required information and create your account.

2. Create a new Auth0 application:
   - After logging in to your Auth0 dashboard, click on the "Applications" menu item in the left sidebar.
   - Click on the "Create Application" button.
   - Give your application a name and select the application type (e.g., "Regular Web Application").
   - Click on the "Create" button to create the application.

3. Configure the Auth0 application:
   - Once the application is created, you'll be redirected to the application settings page.
   - In the "Settings" tab, scroll down to the "Application URIs" section.
   - Set the "Allowed Callback URLs" to `http://localhost:3000/api/auth/callback` (replace `http://localhost:3000` with your actual application's URL).
   - Set the "Allowed Logout URLs" to `http://localhost:3000` (replace `http://localhost:3000` with your actual application's URL).
   - Click the "Save Changes" button at the bottom of the page.

4. Retrieve the Auth0 environment variables:
   - In the "Settings" tab of your Auth0 application, you'll find the necessary environment variables.
   - `AUTH0_SECRET`: Generate a long, random string to be used as your session secret. You can use a tool like `openssl rand -hex 32` to generate a secure secret.
   - `AUTH0_BASE_URL`: Set this to the base URL of your application (e.g., `http://localhost:3000`).
   - `AUTH0_ISSUER_BASE_URL`: This is the "Domain" value found in the "Settings" tab of your Auth0 application. It should look like `https://YOUR_DOMAIN.auth0.com`.
   - `AUTH0_CLIENT_ID`: This is the "Client ID" value found in the "Settings" tab of your Auth0 application.
   - `AUTH0_CLIENT_SECRET`: This is the "Client Secret" value found in the "Settings" tab of your Auth0 application.

5. Set up the environment variables:
   - Create a new file named `.env` in the root directory of your project.
   - Open the `.env` file and add the following lines, replacing the values with the ones you obtained from Auth0:
     ```
     AUTH0_SECRET=YOUR_SESSION_SECRET
     AUTH0_BASE_URL='http://localhost:3000'
     AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
     AUTH0_CLIENT_ID='YOUR_CLIENT_ID'
     AUTH0_CLIENT_SECRET='YOUR_CLIENT_SECRET'
     ```
   - Save the `.env` file.

### OpenRouter Setup
1. Head to https://openrouter.ai/ and create an account to log in. This is most easily done with a Google account.
2. Navigate to the account page where you can make a payment to load credits into your account. The minimum account required is only $4: https://openrouter.ai/account
3. (Optional) Request that an invoice is generated and sent to your account email. Otherwise, a successful transaction will reflect instantly in your account balance.
4. Navigate to the key management page (https://openrouter.ai/keys) where you can generate a key.
5. Copy the generated key and paste it into the `backend\openrouter.txt` file.

Note: Creating an OpenRouter API key is optional. It is possible to only run local models. However, for more complex reasoning and higher quality inferencing over documents, the paid models perform much better. The app comes preloaded with our API key, which we encourage you to use. It allows credit usage up to $5 before it begins limiting requests. You can view the activity history and cost of requests at https://openrouter.ai/activity

### Backend Installation
1. Navigate to the `/backend` folder.
2. Initialize the virtual environment with `python -m venv chatbot`.
3. Activate the environment:
   - For Windows: `chatbot\Scripts\activate`
   - For Mac/Linux: `source chatbot/bin/activate`
4. Install the required Python packages with `pip install -r requirements.txt`.
   - Note: Windows machines may occasionally be missing the C++ maker files associated with assembling the binaries of some packages. Follow any guidance provided by the pip command to resolve errors.
5. Download the relevant OS version of Ollama from https://ollama.com/.
6. Follow the installation guides provided with the downloaded .exe file.
7. Verify that the Ollama service is running by navigating to http://localhost:11434/ in your browser. You should see `Ollama is running` if the installation was successful.
8. Run the backend with `uvicorn FastAPI:app --port 8000 --reload`. Keep this command/terminal open and running while the app is in use.

### Frontend Installation
1. Download and install Node.js for your respective OS from https://nodejs.org/en/download/. Follow the instructions provided by the installer.
2. Open a new terminal and navigate to the `/frontend` folder.
3. Install the required components using `npm install`. This may take a while for all the packages to be downloaded and assembled.
4. Once the installation is complete, launch the frontend with `npm run dev`. Keep this terminal window open and running while the app is in use.

## Usage
1. After completing the installation steps, you should have both the frontend and backend running.
2. Open your browser and navigate to the app (running at `localhost:3000` or whatever URL is displayed in the console).
3. You can now start chatting with the application.

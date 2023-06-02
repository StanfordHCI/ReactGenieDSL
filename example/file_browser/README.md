# ReactGenie File Browser CLI

The ReactGenie File Browser is a command-line interface application that utilizes the `reactgenie-dsl` package to
allow users to navigate and interact with their local file system using natural language commands.

## Prerequisites

Before getting started, make sure you have the following requirements in place:

- Node Version Manager (NVM) version 18 or higher.
- Babel installed with a `babel.config.js` file for special transpiling needs.
- Access to OpenAI API Key

## Installation

1. Add the `reactgenie-dsl` package to your `package.json` file as a dependency:

    ```json
    {
      "dependencies": {
        "reactgenie-dsl": "../../"
      }
    }
    ```
   
2. Add the following scripts to your `package.json` file:

    ```json
    "scripts": {
      "prepare": "npx babel src --out-dir dist --extensions '.ts'",
      "start": "node dist/main.js"
      }
    ```

2. Run the following command in your terminal to install the package along with its dependencies:

    ```bash
    npm install
    ```

## Setup

1. You need to create a `babel.config.js` file in your project root for Babel to correctly transpile your code.

2. Add your OpenAI API key:

    ```bash
    export api_key=your-openai-security-key
    ```
   
3. Run the following command in the directory to prepare the application:

    ```bash
   "npx babel src --out-dir dist --extensions '.ts'"
    ```
   
4. Run the following command in the directory to start the application:

    ```bash
    node dist/main.js
    ```
   
5. The application should now be running in your terminal.

## Usage

Once setup is complete, you can run the CLI application which will ask you for commands, interpret them, and return the results. This application continues to handle user inputs in a loop until manually stopped.

Example usage:

```shell
Current path: /Users/user/Documents
Enter command: what is the first directory?

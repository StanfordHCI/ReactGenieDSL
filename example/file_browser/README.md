# ReactGenie File Browser CLI

The ReactGenie File Browser is a command-line interface application that utilizes the `reactgenie-dsl` package to
allow users to navigate and interact with their local file system using natural language commands.

## Prerequisites

Before getting started, make sure you have the following requirements in place:

- Node.js version 18 or higher, preferably installed through Node Version manager (NVM).
- Access to OpenAI API Key

## Using ReactGenie

ReactGenie allows for the creation of highly interactive applications that respond to natural language commands.

To use ReactGenie, follow these steps:

1. **Organize your Genie files:** In your src directory, create a folder called `genie`. This is where you will put all your Genie classes. For instance, `GeniePath.ts` will be located here.

2. **Create Genie Classes:** Each class should be decorated with the `@GenieClass` decorator, extend from `GenieObject`, and contain properties marked with the `@GenieProperty` decorator. You must have at least one property decorated with `@GenieKey`. The GenieKey should be a primitive type. Functions within your class that you want to expose to the Genie interpreter should be decorated with the `@GenieFunction` decorator.

   Here's an example using `GeniePath` class:

    ```typescript
    import {GenieClass, GenieFunction, GenieKey, GenieProperty, GenieObject, ExampleParse} from "reactgenie-dsl";
    import Path from "path";

    @GenieClass("A path")
    export class GeniePath extends GenieObject {
          @GenieKey
          @GenieProperty("Absolute path")
          absoluteString: string;

          @GenieProperty("Current path")
          static currentPath: GeniePath;
    }
    ```

3. **Initialize:** Use the `setup` function to create the first object. This will establish the initial state/context for ReactGenie to work with. For example:

    ```typescript
    public setup() {
        GeniePath.currentPath = GeniePath.CreateObject({absoluteString: os.homedir()});
    }
    ```
   
4. **Examples:** Add an object with a list of examples to sharpen ReactGenie's interpretation. For example:
   ```typescript
   export const GeniePathExample: ExampleParse[] = [
   {
   user_utterance: "what's the current directory",
   example_parsed: "GeniePath.currentPath.absolutePath",
   },
   // More examples here
   ]
   ```


5. **Interact with ReactGenie:** In your `main.ts` file, call the ReactGenie interpreter to process user inputs. This interpreter uses the Genie files to interpret the commands, perform the associated actions, and return the results.

6. **Keep Track:** After the setup you can now interact with your application in a conversational manner.

Remember, all Genie functions need to have a return type as ReactGenie does not perform type inferencing. Use the `int` and `float` types provided by ReactGenie instead of the number type where required.

In terms of usage, for instance, if you're using the `GeniePath` class, you could run commands like "What's the current directory?", "List directory", "Change directory to the first one", or "What's in the project folder?".

ReactGenie makes it simple and intuitive to work with natural language commands, offering a unique way to interact with your application.


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

3. Run the following command in your terminal to install the package along with its dependencies:

   ```
   bash
   npm install
   ```

## Running the Demo
To run this demo, prepare the application by running the following command in the terminal:
    
    bash
    npm prepare


This will use Babel to transpile ReactGenie due to the decorators it uses.

To start the application, run the following command:

    bash
    npm start

The CLI should now be running in your terminal.

## Usage

Once setup is complete, you can run the CLI application which will ask you for commands, interpret them, and return the results. This application continues to handle user inputs in a loop until manually stopped.

Example usage:

```shell
Current path: /Users/user/Documents
Enter command: what is the first directory?
```

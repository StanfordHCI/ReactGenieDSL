# ReactGenie File Browser CLI

The ReactGenie File Browser is a command-line interface application that utilizes the `reactgenie-dsl` package to
allow users to navigate and interact with their local file system using natural language commands.

## Prerequisites

Before getting started, make sure you have the following requirements in place:

- Node.js version 18 or higher, preferably installed through Node Version manager (NVM).
- Access to OpenAI API Key

## Running the Demo

Run the following command in your terminal to install the package along with its dependencies:

   ```bash
   npm install
   ```

Export your OpenAI API key into your session environment variables:

  ```bash
  export api_key=sk-***** # your api key here
  ```

To run this demo, prepare the application by running the following command in the terminal:

   ```bash
   npm run prepare
   ```

This will use Babel to transpile ReactGenie due to the decorators it uses.

To start the application, run the following command:

   ```bash
   npm run start
   ```

When running `npm run start`, if you receive the following error:

   ```bash
node:internal/modules/cjs/loader:798
      throw new ERR_UNKNOWN_BUILTIN_MODULE(request);
      ^

Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:readline/promises
   ```

It is likely that you're not using Node.js version 18 or higher. You can install and use the correct version by running the following commands:

   ```bash
nvm install 18
nvm use 18
nvm alias default 18 // if you want to use this version by default
   ```

The CLI should now be running in your terminal.

## Usage

Once setup is complete, you can run the CLI application and navigate your file browser through natural language commands! This application continues to handle user inputs in a loop until manually stopped.

Example usage:

```shell
Current path: /Users/user/Documents
Enter command: what is the first directory?
```

## How the Demo is Structured with ReactGenie

ReactGenie allows for the creation of highly interactive multimodal applications that respond to natural language commands, offering a unique way for users to interact with your application.
In the following steps, we will walk developers through the structure of using ReactGenie in an application, using the file browser CLI as an example.

In the src directory, you will find the following files:

- **package.json:** Lists metadata and dependencies that are installed using `npm install`.

- **tsconfig.json:** The configuration file for the TypeScript compiler, dictating how TypeScript code should be compiled into JavaScript.

- **babel.config.js:** The configuration file for Babel, a JavaScript compiler crucial for ReactGenie due to the decorators it uses. Decorators are not yet supported natively in all environments, so Babel is used to transpile them into Javascript understood by the environment.

ReactGenie is incorporated into the application through the following steps:

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

3. **Initialize:** Before the program is run, `setup()` will be called first. If you want to initialize any object, do so here. For example:

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
   // The rest of your examples
   ];
   ```

5. **Interact with ReactGenie:** In your `main.ts` file, call the ReactGenie interpreter to process user inputs. This interpreter uses the Genie files to interpret the commands, perform the associated actions, and return the results. The interpreter uses the `nlParser.parse` method to parse the user's command and the `dslInterpreter.interpret` method to interpret it. The interpretation result is then transformed into a JSON response. In this example's main.ts:

   ```typescript
   // create the interpreter
   const interpreter = new NlInterpreter([GeniePath.ClassDescriptor], process.env.api_key, undefined, GeniePathExample);
   // ask the user for input
        const user_utterance = await rl.question('Enter command: ');
        // parse the user utterance
        const parsed = await interpreter.nlParser.parse(user_utterance);
        // interpret the parsed user utterance
        const funcCallResult = await interpreter.dslInterpreter.interpret(parsed);
   ```



It is important to note that all Genie functions need to have a return type as ReactGenie does not perform type inferencing. Use the `int` and `float` types provided by ReactGenie instead of the number type where required.






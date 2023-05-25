import {initGenie, NlInterpreter} from "reactgenie-dsl";
import {GeniePath, GeniePathExample} from "./genie/GeniePath";
import {matchesAny} from "typedoc/dist/lib/utils/paths";
import * as readline from 'node:readline/promises';

initGenie()

// const interpreter = new NlInterpreter(allDescriptors, process.env.api_key, undefined, examples);
//   const funcCallResult = await interpreter.interpret('what is the name of the hamburger?');

// get command line input into user utterance (similar to python code "user_utterance = input()")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// create the interpreter
const interpreter = new NlInterpreter([GeniePath.ClassDescriptor], process.env.api_key, undefined, GeniePathExample);

async function main() {
    while (true) {
// print the current path
        console.log("Current path: " + GeniePath.currentPath.absoluteString);


// ask the user for input
        const user_utterance = await rl.question('Enter command: ');
        // parse the user utterance
        const parsed = await interpreter.nlParser.parse(user_utterance);
        // interpret the parsed user utterance
        const funcCallResult = await interpreter.dslInterpreter.interpret(parsed);
        // get the description of the result
        const lastResult = funcCallResult;
        let resultStr;
        if (lastResult.type === "object") {
            if (lastResult.objectType === "string" || lastResult.objectType === "int" || lastResult.objectType === "boolean") {
                resultStr = JSON.stringify({value: lastResult.value});
            } else if (lastResult.objectType === "void") {
                resultStr = '{"result": "done"}';
            } else {
                resultStr = JSON.stringify(lastResult.value.description());
            }
        } else if (lastResult.type === "array") {
            resultStr = JSON.stringify(lastResult.value.map((element) => element.value.description()));
        }
        // respond to the user
        const response = await interpreter.nlParser.respond(user_utterance, parsed, resultStr);
        // log the response to the console
        console.log(response);
    }
}

main().then(() => {
    process.exit(0);
});
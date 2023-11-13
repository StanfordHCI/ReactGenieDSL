import { ExampleParse } from "./prompt-gen";

export const pre_section_separator = "\n";
export const post_section_separator = "\n\n\n";

export const class_prequel = "// Here are all the functions";

export const array_definition =
  "extension Array<Type> {\n" +
  "    // Find items with matching fields in an array\n" +
  "    Array<Type> matching(field: Field, value: Type);\n" +
  "\n" +
  "    // Find items with field in an array that contains a specific value\n" +
  "    Array<Type> contains(field: Field, value: Type);\n" +
  "\n" +
  "    // Find items with exact fields in an array\n" +
  "    Array<Type> equals(field: Field, value: Type);\n" +
  "\n" +
  "    // Find items with the field between two values in an array\n" +
  "    Array<Type> between(field: Field, from: Type, to: Type);\n" +
  "\n" +
  "    // Sort an array based on a specific field in ascending or descending order\n" +
  "    Array<Type> sort(field: Field, ascending: bool);\n" +
  "\n" +
  "    // Get length of an array\n" +
  "    int length();\n" +
  "}";

export const class_separator = "\n\n";

export const example_prequel = "// Here are all the examples that we have";

export function example_pair(example: ExampleParse) {
  return (
    `user: ${example.user_utterance}\n` + `parsed: ${example.example_parsed}`
  );
}

export const example_separator = "\n\n";

export function example_parses(examples: ExampleParse[]) {
  return examples
    .map((example) => example_pair(example))
    .join(example_separator);
}

export const user_interaction_prequel = "// New user interaction";

export function user_interaction_prompt(user_utterance: string) {
  return `user: ${user_utterance}\n` + `parsed:`;
}

export function agent_response_prompt(
  user_utterance: string,
  parsed: string,
  result: string
) {
  return (
    `user: ${user_utterance}\n` +
    `parsed: ${parsed}\n` +
    `result: ${result}\n` +
    `agent_response:`
  );
}

export const parse_issues = `
// Here are the issues that need to be noticed
// 1. Use "Array[index]" instead of index related functions. For example, "hotels[0]" instead of "hotels.first()"
// 2. Use "setProperty(value) instead of "property = value". For example, "hotel.setName(123)" instead of "hotel.name = 123"
// 3. Use ";" between multiple function calls. For example, "hotel.setName(123); hotel.setDesc(123)"`

const exampleDeveloperClasses = `
// Here are all the function that we have
extension Array<Type> {
    // find items with matching field in an array
    Array<Type> matching(field: Field, value: Type);

    // find items with field in an array that contains a specific value
    Array<Type> contains(field: Field, value: Type);

    // find items with exact field in an array
    Array<Type> equals(field: Field, value: Type);

    // find items with field between two values in an array
    Array<Type> between(field: Field, from: Type, to: Type);

    // sort an array based on a specific field in ascending or descending order
    Array<Type> sort(field: Field, ascending: bool);
}

class Counter {
    string name;
    string type;
    int count;
    static float Version;
    static Counter GetCounter(name: string);
    void increment();
    void decrement();
    static Counter[] All();
    static Counter Current();
}


// Here are all the examples that we have
user: increment
parsed: Counter.Current().increment()

user: what is the count
parsed: Counter.Current().count

user: what is the count of potato
parsed: Counter.GetCounter(name: "potato").count

user: increment potato counter
parsed: Counter.GetCounter(name: "potato").increment()

user: show me all vegetables counters
parsed: Counter.All().matching(field: .type, value: "vegetable")
`

export function parseCodePrompt(appBasicPrompt: string): string {
    return `
Below are the developer class definitions, methods, and their descriptions as the comments of an example app. 
After that, code parses from another app using ReactGenieDSL will be given. 
A code parse is a voice command the user gives to be parsed into code that completes the requested action.

BEGIN
\`
${exampleDeveloperClasses}
\`
END

Note that all function calls have to have explicit parameter names in ReactGenieDSL.

For example:
\`
parsed: Counter.All().matching(.type, "vegetable")
\`
Is INCORRECT.

This is correct:
\`
parsed: Counter.All().matching(field: .type, value: "vegetable")
\`

And here is the developer classes and (optionally) code parses for this app in ReactGenieDSL:\n
BEGIN
\`
${appBasicPrompt}
\`
END

For code translation using \`ReactGenieDSL\`, follow these guidelines:

1. Formatting: Directly output code without code blocks. Use semicolons for separating multiple statements.
2. Be Creative: Introduce new functions, classes, or methods for requests not covered by existing functions.
3. Retrieval Over Answers: Translate user queries into code for information retrieval, not direct answers.
4. Contextual 'Current': Use 'Current' for items the user is directly interacting with or viewing.
5. Indexing: Use bracket notation for array indexing, supporting negative indices for last element.
6. No Math Operations: Replace direct math operations with method calls (e.g., 1.plus(1)).
7. Simplified Array Operations: Avoid map/lambda expressions; apply functions directly to array elements.
8. No Default Constructors: Use 'Create' methods for object creation; otherwise, selection from existing options.
9. Static vs. Non-Static Methods: Use static methods for direct class calls; retrieve instances for non-static methods.
10. Optional Parameters: Optional parameters are noted by \`?\` after their type, they can be omitted in function calls.
11. Use Setters: Avoid assignments; utilize function calls (set[Something]) for selections or changes.

New user interaction:

`;
}
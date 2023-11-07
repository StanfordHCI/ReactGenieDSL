import { ExampleParse } from "./prompt-gen";

export const pre_section_separator = "\n";
export const post_section_separator = "\n\n\n";

export const class_prequel = "// Here are all the functions";

export const array_definition =
  "extension Array<Type> {\n" +
  "    //Find items with matching fields in an array\n" +
  "    Array<Type> matching(field: Field, value: Type);\n" +
  "\n" +
  "    // Find items with field in an array that contains a specific value\n" +
  "    Array<Type> contains(field: Field, value: Type);\n" +
  "\n" +
  "    // Find items with exact fields in an array\n" +
  "    Array<Type> equals(field: Field, value: Type);\n" +
  "\n" +
  "    //Find items with the field between two values in an array\n" +
  "    Array<Type> between(field: Field, from: Type, to: Type);\n" +
  "\n" +
  "    //Sort an array based on a specific field in ascending or descending order\n" +
  "    Array<Type> sort(field: Field, ascending: bool);\n" +
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

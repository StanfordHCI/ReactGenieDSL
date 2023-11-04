import {
  agent_response_prompt,
  array_definition,
  class_prequel,
  class_separator,
  example_parses,
  example_prequel,
  post_section_separator,
  pre_section_separator,
  user_interaction_prequel,
  user_interaction_prompt,
  parse_issues,
} from "./prompt-res";
import { ClassDescriptor, GenieObject } from "../dsl-descriptor";

export interface PromptGen {
  prompt(user_utterance: string): string;

  response_prompt(
    user_utterance: string,
    parsed: string,
    result: string
  ): string;
}

export class ExampleParse {
  constructor(readonly user_utterance, readonly example_parsed) {}
}

export class BasicPromptGen {
  constructor(
    private class_descriptions: string[],
    private examples: ExampleParse[],
    private extraPrompt?: string
  ) {}

  prompt_basic(): string {
    let prompt =
      `${class_prequel}${pre_section_separator}` +
      `${array_definition}${class_separator}` +
      `${this.class_descriptions.join(
        class_separator
      )}${post_section_separator}` +
      `${example_prequel}${pre_section_separator}` +
      `${example_parses(this.examples)}${post_section_separator}` +
      `${parse_issues}${post_section_separator}` +
      `${user_interaction_prequel}${pre_section_separator}`;
    if (this.extraPrompt !== undefined) {
      prompt += `${this.extraPrompt}${pre_section_separator}`;
    }
    return prompt;
  }

  prompt(user_utterance: string): string {
    let prompt = this.prompt_basic();
    prompt += `${user_interaction_prompt(user_utterance)}`;
    return prompt;
  }

  response_prompt(
    user_utterance: string,
    parsed: string,
    result: string
  ): string {
    let prompt = this.prompt_basic();
    prompt += `${agent_response_prompt(user_utterance, parsed, result)}`;
    return prompt;
  }
}

export class DescriptorPromptGen extends BasicPromptGen {
  constructor(
    private class_descriptors: ClassDescriptor<GenieObject>[],
    examples: ExampleParse[],
    extraPrompt?: string
  ) {
    super(
      class_descriptors.map((c) => c.description()),
      examples,
      extraPrompt
    );
  }
}

// TODO: automatically generate prompt from DSL Descriptors

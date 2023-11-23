import { PromptGen } from "./prompt-gen";
import { Configuration, OpenAIApi } from "openai";

export class NlParser {
  private openAiApi: OpenAIApi;

  constructor(
    prompt: PromptGen,
    private apiKey: string,
    private basePath: string
  ) {
    const configuration = new Configuration({
      apiKey: this.apiKey,
      basePath: this.basePath,
    });
    this.openAiApi = new OpenAIApi(configuration);
  }

  async oldParse(nl: string): Promise<string | null> {
    const prompt = this.prompt.prompt(nl);
    const response = await this.openAiApi.createCompletion({
      model: "code-davinci-002",
      prompt: prompt,
      temperature: 0,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["\n"],
    });
    return await response.data.choices[0]?.text.trim();
  }

  async parse(nl: string): Promise<string | null> {
    const prompt = this.prompt.zero_shot_prompt(nl);
    const response = await this.openAiApi.createChatCompletion({
      model: "gpt-4",
      temperature: 0,
      top_p: 1,
      n: 1,
      stream: false,
      max_tokens: 256,
      presence_penalty: 0,
      frequency_penalty: 0,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    return response.data.choices[0]?.message.content.replaceAll("`", "").trim();
  }

  async parseGpt4(nl: string): Promise<string | null> {
    const prompt = this.prompt.prompt(nl);
    const response = await this.openAiApi.createChatCompletion({
      model: "gpt-4",
      temperature: 0,
      top_p: 1,
      n: 1,
      stream: false,
      max_tokens: 256,
      presence_penalty: 0,
      frequency_penalty: 0,
      messages: [
        {
          role: "system",
          content: "only generate one line of code",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    return await response.data.choices[0]?.message.content.trim();
  }

  async respond(
    nl: string,
    parsed: string,
    result: string
  ): Promise<string | null> {
    const prompt = this.prompt.response_prompt(nl, parsed, result);
    const response = await this.openAiApi.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 512,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["\n", "user:"],
    });
    return await response.data.choices[0]?.text.trim();
  }
}

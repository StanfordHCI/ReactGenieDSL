import {PromptGen} from "./nl";
import {ClassDescriptor, GenieObject} from "./dsl-descriptor";
import {NlParser} from "./nl";
import {DslInterpreter} from "./dsl";
import {DescriptorPromptGen, ExampleParse} from "./nl/prompt-gen";

export class NlInterpreter {
  public nlParser: NlParser;
  public dslInterpreter: DslInterpreter;

  constructor(
    private descriptions: ClassDescriptor<GenieObject>[],
    private apiKey: string,
    private prompt?: PromptGen,
    private examples?: ExampleParse[],
    private extraPrompt?: string,
    private basePath: string = undefined
  ) {
    if (this.basePath === undefined) {
      this.basePath = "https://api.openai.com/v1";
    }
    if (this.prompt === undefined) {
      console.assert(this.examples !== undefined)
      this.prompt = new DescriptorPromptGen(this.descriptions, this.examples, extraPrompt);
    }
    this.nlParser = new NlParser(this.prompt, apiKey, basePath);
    this.dslInterpreter = new DslInterpreter(descriptions);
  }

  async interpret(nl: string): Promise<GenieObject | null> {
    const command = await this.nlParser.parse(nl);
    if (command === null) {
      return null;
    }
    return this.dslInterpreter.interpret(command);
  }

  async respond(nl: string, parsed: string, result: string): Promise<string | null> {
    return await this.nlParser.respond(nl, parsed, result);
  }
}

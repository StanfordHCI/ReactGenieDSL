import { NlInterpreter } from '../nl-interpreter';
import { allDescriptors, examples } from './example_descriptor';
import { initGenie } from '../decorators';

initGenie();

jest.setTimeout(30000);

test('Simple function', async () => {
  const interpreter = new NlInterpreter(
    allDescriptors,
    process.env.OPENAI_API_KEY,
    undefined,
    examples,
    process.env.OPENAI_API_BASE_URL
  );
  const funcCallResult = await interpreter.interpret(
    'what is the name of the hamburger?'
  );
  expect(funcCallResult).toEqual({
    objectType: 'string',
    type: 'object',
    value: 'Hamburger',
  });
});

test('Intermediate function', async () => {
  const interpreter = new NlInterpreter(
    allDescriptors,
    process.env.OPENAI_API_KEY,
    undefined,
    examples,
    process.env.OPENAI_API_BASE_URL
  );
  const user_utterance = 'get me the cheapest restaurant in palo alto';
  const parsed = await interpreter.nlParser.parseGpt4(user_utterance);
  const funcCallResult = await interpreter.dslInterpreter.interpret(parsed);
  const resultString = JSON.stringify(funcCallResult.value.description());
  const response = await interpreter.nlParser.respond(
    user_utterance,
    parsed,
    resultString
  );
  console.log(response);
});

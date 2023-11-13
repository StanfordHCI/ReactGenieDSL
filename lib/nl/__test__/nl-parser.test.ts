import { NlParser } from '../nl-parser';
import { BasicPromptGen } from '../prompt-gen';
import { classDescriptions, examples } from '../../__test__/example_descriptor';
import { initGenie } from '../../decorators';

initGenie();
jest.setTimeout(30000);

test('Parser basics', async () => {
  const parser = new NlParser(
    new BasicPromptGen(classDescriptions, examples),
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_API_BASE_URL
  );
  const parsed = await parser.parse(
    'get me the cheapest restaurant in palo alto'
  );
  return expect(parsed).toBe(
    'Restaurant.all().matching(field: .address, value: "palo alto").sort(field: .priceGrade, ascending: true)[0]'
  );
});

test('Parser complex', async () => {
  const parser = new NlParser(
    new BasicPromptGen(classDescriptions, examples),
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_API_BASE_URL
  );
  const parsed = await parser.parse(
    'order the same burger that I ordered at mcDonald last time'
  );
  return expect(parsed).toBe(
    'Order.current().addFoods(foods: [Order.all().matching(field: .restaurant, value: Restaurant.all().matching(field: .name, value: "mcDonald")[0]).sort(field: .dateTime, ascending: false)[0].foods.matching(field: .name, value: "burger")[0]])'
  );
});

test('Parser complex voice', async () => {
  const parser = new NlParser(
    new BasicPromptGen(
      classDescriptions,
      examples,
      '// We utilize voice recognition technology, which may occasionally result in errors. Please consider the possibility of words with similar sounds being misinterpreted. For instance, the word "order" might be mistakenly recognized as "elder".'
    ),
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_API_BASE_URL
  );
  const parsed = await parser.parseGpt4(
    'elder the same foods that I ordered at mcDonald last time'
  );
  return expect(parsed).toBe(
    'Order.current().addFoods(foods: Order.all().matching(field: .restaurant, value: Restaurant.all().matching(field: .name, value: "mcDonald")[0]).sort(field: .dateTime, ascending: false)[0].foods)'
  );
});

import {NlParser} from "../nl-parser";
import {BasicPromptGen} from "../prompt-gen";
import {classDescriptions, examples} from "../../__test__/example_descriptor";

jest.setTimeout(30000);

test('Parser basics', async () => {
    const parser = new NlParser(new BasicPromptGen(classDescriptions, examples), process.env.api_key);
    const parsed = await parser.parse("get me the cheapest restaurant in palo alto");
    return expect(parsed).toBe("Restaurant.all().matching(field: .address, value: \"palo alto\").sort(field: .price, ascending: true)[0]");
});

test('Parser complex', async () => {
    const parser = new NlParser(new BasicPromptGen(classDescriptions, examples), process.env.api_key);
    const parsed = await parser.parse("order the same burger that I ordered at mcDonald last time");
    return expect(parsed).toBe("Order.current().addFoods(foods: Order.all().matching(field: .restaurant, value: Restaurant.all().matching(field: .name, value: \"mcDonald\")[0]).sort(field: .dateTime, ascending: false)[0].foods.matching(field: .name, value: \"burger\"))");
});

test('Parser complex voice', async () => {
    const parser = new NlParser(
        new BasicPromptGen(
            classDescriptions,
            examples,
            "// we are using voice recognition. so there may be errors. Try to think about words with similar sounds. For example \"elder\" can actually be \"order\"."),
        process.env.api_key
    );
    const parsed = await parser.parse("elder the same foods that I elder at mcDonald last time");
    return expect(parsed).toBe("Order.current().addFoods(foods: Order.all().matching(field: .restaurant, value: Restaurant.all().matching(field: .name, value: \"mcDonald\")[0]).sort(field: .dateTime, ascending: false)[0].foods)");
});
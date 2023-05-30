import {Restaurant} from './example_descriptor'

test("Restaurant Description", async () => {
  const description = Restaurant._ClassDescriptor.description();
  expect(description).toEqual("class Restaurant {\n" +
      "\tstring name;\n" +
      "\tFood[] menu;\n" +
      "\tint rating;\n" +
      "\tfloat priceGrade;\n" +
      "\tstring cuisine;\n" +
      "\tstring address;\n" +
      "\tOrder[] orders;\n" +
      "\t// All active restaurants\n" +
      "\tstatic Restaurant[] all();\n" +
      "\t// The current restaurant\n" +
      "\tstatic Restaurant current();\n" +
      "\t// Book a table for a given date time\n" +
      "\tvoid book(dateTime: DateTime);\n" +
      "}");
});
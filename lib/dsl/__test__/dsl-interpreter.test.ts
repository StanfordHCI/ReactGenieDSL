import { DslInterpreter } from "../dsl-interpreter";
import { allDescriptors, recentBooking, Restaurant } from "../../__test__/example_descriptor";
import { initGenie } from "../../decorators";

initGenie();

test("Basic function call", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.current().book(dateTime: DateTime(year: 2020, month: 1, day: 1, hour: 12, minute: 0))"
  );
  expect(recentBooking).toEqual("McDonald's is booking for 2020-1-1 12:0");
  expect(funcCallResult).toEqual({
    objectType: "void",
    type: "object",
    value: undefined
  });
});

test("Indexing", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret("Restaurant.all()[1].name");
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "KFC"
  });
});

test("Array", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "[Restaurant.all()[1].name, Restaurant.current().name]"
  );
  expect(funcCallResult).toEqual({
    type: "array",
    value: [
      {
        objectType: "string",
        type: "object",
        value: "KFC"
      },
      {
        objectType: "string",
        type: "object",
        value: "McDonald's"
      }
    ]
  });
});

test("Array matching", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.current().menu.matching(field: .name, value: \"hamburger\")[0].name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "Hamburger"
  });
});

test("Array between", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Order.all().between(field: .dateTime, from: DateTime.today().addDateOffset(day: -7), to: DateTime.today())[0].restaurant.name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "McDonald's"
  });
});

test("Array between one side", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Order.all().between(field: .dateTime, from: DateTime.today().addDateOffset(day: -7))[-1].restaurant.name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "McDonald's"
  });
});

test("Array between one side deep accessor", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Order.all().between(field: .dateTime.day, from: 2, to: 3)[-1].dateTime.day"
  );
  expect(funcCallResult).toEqual({
    "objectType": "int",
    "type": "object",
    "value": 3
  });
});

test("Array equals", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.all().equals(field: .priceGrade, value: 1)[0].name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "KFC"
  });
});

test("Array sort", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.all().sort(field: .priceGrade, ascending: false)[0].name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "Taste"
  });
});

test("Array in array", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.all().menu.matching(field:.name, value:\"Hamburger\")[0][0].name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "Hamburger"
  });
});

test("length", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.all()[0].menu.matching(field:.name, value:\"Hamburger\").length()"
  );
  expect(funcCallResult).toEqual({
    "objectType": "int",
    "type": "object",
    "value": 1
  });
});

// test("index in Array.Array", async () => {
//   const interpreter = new DslInterpreter(allDescriptors);
//   const funcCallResult = await interpreter.interpret(
//     "Restaurant.all().menu.matching(field:.name, value:\"Hamburger\")[0]"
//   );
//   expect(funcCallResult).toEqual({
//     objectType: "string",
//     type: "object",
//     value: "Taste",
//   });
// });

test("find burger name", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.current().menu.matching(field: .name, value: \"hamburger\")[0].name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "Hamburger"
  });
});

test("find burger price", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.current().menu.matching(field: .name, value: \"hamburger\")[0].price"
  );
  expect(funcCallResult).toEqual({
    objectType: "float",
    type: "object",
    value: 5
  });
});

test("best restaurant", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.all().matching(field: .address, value: \"palo alto\").sort(field: .rating, ascending: false)[0]"
  );
  expect(await interpreter.describe(funcCallResult)).toEqual({
    type: "object",
    value: {
      address: "123 Main St, Palo Alto, USA",
      cuisine: "Chinese",
      name: "Taste",
      priceGrade: 3,
      rating: 5
    }
  });
});

test("find cheap chinese restaurant", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Restaurant.all().matching(field: .cuisine, value: \"chinese\").sort(field: .priceGrade, ascending: true)[0]"
  );
  expect(await interpreter.describe(funcCallResult)).toEqual({
    type: "object",
    value: {
      address: "123 Main St, Palo Alto, USA",
      cuisine: "Chinese",
      name: "Steam",
      priceGrade: 2,
      rating: 4
    }
  });
});

test("add hamburger to the order", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Order.current().addFoods(foods: [Restaurant.current().menu.matching(field: .name, value: \"hamburger\")[0]])"
  );
  expect(await interpreter.describe(funcCallResult)).toEqual({
    type: "object",
    value: "undefined"
  });
});

test("add hamburger to the order (steps)", async () => {
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult: any[] = await interpreter.interpretSteps(
    "Restaurant.all().equals(field: .priceGrade, value: 1)[0].name"
  );
  const describeSteps =(await interpreter.describeSteps(
    funcCallResult[funcCallResult.length - 1].steps
  )).reverse()
  expect((describeSteps[1])).toEqual({
    type: "object",
    value: {
      address: "123 Main St, Palo Alto, USA",
      cuisine: "Fast Food",
      name: "KFC",
      priceGrade: 1,
      rating: 3
    }
  });
});

test("DateTime object comparison", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors);
  // order yestersday
  const funcCallResult = await interpreter.interpret(
    "Order.all().between(field: .dateTime, from: DateTime(year: 2020, month: 2, day: 1, hour: 0, minute: 0), to: DateTime(year: 2020, month: 2, day: 1, hour: 23, minute: 59))[0].restaurant.name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "McDonald's"
  });
});

test("Order containing burger", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors);
  // const funcCallResult = await interpreter.interpret(
  //     'Order.all().containing(field: .foods, value: Restaurant.current().menu.matching(field: .name, value: "hamburger")[0])[0].restaurant.name'
  // )
  const funcCallResult = await interpreter.interpret(
    "Order.all().contains(field: .foods, value: Restaurant.current().menu.matching(field: .name, value: \"hamburger\")[0])[0].restaurant.name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: "McDonald's"
  });
});

test("Order array distribution field", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Order.all().dateTime[0].dayOfWeek"
  );
  expect(funcCallResult).toEqual({
    "objectType": "string",
    "type": "object",
    "value": "Wednesday"
  });
});

test("Order array distribution function", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Order.all().placeOrder()"
  );
  expect(funcCallResult["objectType"]).toEqual("void");
});

test("Multiple actions", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Order.all().placeOrder(); Order.all().dateTime[0].dayOfWeek"
  );
  expect(funcCallResult["objectType"]).toEqual("string");
});

test("Single actions with semicolon", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors);
  const funcCallResult = await interpreter.interpret(
    "Order.all().dateTime[0].dayOfWeek;"
  );
  expect(funcCallResult["objectType"]).toEqual("string");
});


test("[dry run] Order containing burger", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors, true);
  const funcCallResult = await interpreter.interpret(
    "Order.all().contains(field: .foods, value: Restaurant.current().menu.matching(field: .name, value: \"hamburger\")[0])[0].restaurant.name"
  );
  expect(funcCallResult).toEqual({
    objectType: "string",
    type: "object",
    value: null
  });
});

test("[dry run][error] Restaurant noise level", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors, true);
  try {
    await interpreter.interpret(
      "Restaurant.All().matching(field: .noiseLevel, value: \"quiet\")"
    );
  } catch (e) {
    expect(e.message).toEqual("Field Restaurant.noiseLevel is missing");
  }
});

test("[dry run][error] Restaurant noise level 2", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors, true);
  try {
    await interpreter.interpret(
      "Restaurant.All()[0].noiseLevel"
    );
  } catch (e) {
    expect(e.message).toEqual("Field Restaurant.noiseLevel is missing");
  }
});

test("[dry run][error] Restaurant notify when near", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors, true);
  try {
    await interpreter.interpret(
      "Order.current().notifyWhenNearLocation()"
    );
  } catch (e) {
    expect(e.message).toEqual("Function Order.notifyWhenNearLocation is missing");
  }
});

test("[dry run][error] Login", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors, true);
  try {
    await interpreter.interpret(
      "User.login()"
    );
  } catch (e) {
    expect(e.message).toEqual("Class User is missing");
  }
});


test("[dry run][error] String", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors, true);
  try {
    await interpreter.interpret(
      "Restaurant.All().matching(field: .location, value: \"near me\")"
    );
  } catch (e) {
    console.log(e);
    expect(e.message).toEqual("Field Restaurant.location is missing");
  }
});

test("GetObject", async () => {
  Restaurant.all();
  const interpreter = new DslInterpreter(allDescriptors, true);
  try {
    await interpreter.interpret(
      "Restaurant.GetObject(id:0)"
    );
  } catch (e) {
    console.log(e);
    expect(e.message).toEqual("Function Restaurant.GetObject is missing");
  }
});





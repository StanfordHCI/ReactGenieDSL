import {DslInterpreter} from '../dsl-interpreter';
import {allDescriptors, recentBooking, Restaurant} from "../../__test__/example_descriptor";

test('Basic function call', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret("Restaurant.current().book(dateTime: DateTime(year: 2020, month: 1, day: 1, hour: 12, minute: 0))");
    expect(recentBooking).toEqual("McDonald's is booking for 2020-1-1 12:0");
    expect(funcCallResult).toEqual({"objectType": "void", "type": "object", "value": undefined});
});

test('Indexing', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret("Restaurant.all()[1].name");
    expect(funcCallResult).toEqual({
        "objectType": "string",
        "type": "object",
        "value": "KFC"
    });
});

test('Array', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret("[Restaurant.all()[1].name, Restaurant.current().name]");
    expect(funcCallResult).toEqual({
        "type": "array",
        "value": [
            {
                "objectType": "string",
                "type": "object",
                "value": "KFC"
            },
            {
                "objectType": "string",
                "type": "object",
                "value": "McDonald's"
            }
        ]
    });
});

test('Array matching', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret('Restaurant.current().menu.matching(field: .name, value: \"hamburger\")[0].name');
    expect(funcCallResult).toEqual({
        "objectType": "string",
        "type": "object",
        "value": "Hamburger"
    });
})

test('Array between', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret(
        'Order.all().between(field: .dateTime, from: DateTime.today().addDateOffset(day: -7), to: DateTime.today())[0].restaurant.name'
    );
    expect(funcCallResult).toEqual({
        "objectType": "string",
        "type": "object",
        "value": "McDonald's"
    });
});

test('Array equals', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret(
        'Restaurant.all().equals(field: .priceGrade, value: 1)[0].name'
    )
    expect(funcCallResult).toEqual({
        "objectType": "string",
        "type": "object",
        "value": "KFC"
    });
});

test('Array sort', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret(
        'Restaurant.all().sort(field: .priceGrade, ascending: false)[0].name'
    )
    expect(funcCallResult).toEqual({
        "objectType": "string",
        "type": "object",
        "value": "Taste"
    });
});

test('find burger name', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret(
        'Restaurant.current().menu.matching(field: .name, value: "hamburger")[0].name'
    )
    expect(funcCallResult).toEqual({
        "objectType": "string",
        "type": "object",
        "value": "Hamburger"
    });
});

test('best restaurant', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret(
        'Restaurant.all().matching(field: .address, value: \"palo alto\").sort(field: .rating, ascending: false)[0]'
    )
    expect(interpreter.describe(funcCallResult)).toEqual({
        "type": "object",
        "value": {
            "address": "123 Main St, Palo Alto, USA",
            "cuisine": "Chinese",
            "name": "Taste",
            "priceGrade": 3,
            "rating": 5
        }
    });
});

test('find cheap chinese restaurant', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret(
        'Restaurant.all().matching(field: .cuisine, value: "chinese").sort(field: .price, ascending: true)[0]'
    )
    expect(interpreter.describe(funcCallResult)).toEqual({
        "type": "object",
        "value": {
            "address": "123 Main St, Palo Alto, USA",
            "cuisine": "Chinese",
            "name": "Taste",
            "priceGrade": 3,
            "rating": 5
        }
    });
});

test('add hamburger to the order', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpret(
        'Order.current().addFoods(foods: [Restaurant.current().menu.matching(field: .name, value: "hamburger")[0]])'
    )
    expect(interpreter.describe(funcCallResult)).toEqual({
        "type": "object",
        "value": "undefined"
    });
});

test('add hamburger to the order (steps)', () => {
    const interpreter = new DslInterpreter(allDescriptors);
    const funcCallResult = interpreter.interpretSteps(
        'Restaurant.all().equals(field: .priceGrade, value: 1)[0].name'
    )
    expect(interpreter.describeSteps(funcCallResult).reverse()[1]).toEqual({
        "type": "object",
        "value": {
            "address": "123 Main St, Palo Alto, USA",
            "cuisine": "Fast Food",
            "name": "KFC",
            "priceGrade": 1,
            "rating": 3
        }
    });
});

test('DateTime object comparison', () => {
    Restaurant.all();
    const interpreter = new DslInterpreter(allDescriptors);
    // order yestersday
    const funcCallResult = interpreter.interpret(
        'Order.all().between(field: .dateTime, from: DateTime(year: 2020, month: 2, day: 1, hour: 0, minute: 0), to: DateTime(year: 2020, month: 2, day: 1, hour: 23, minute: 59))[0].restaurant.name'
    )
    expect(funcCallResult).toEqual({
        "objectType": "string",
        "type": "object",
        "value": "McDonald's"
    });
});

test('Order containing burger', () => {
    Restaurant.all();
    const interpreter = new DslInterpreter(allDescriptors);
    // const funcCallResult = interpreter.interpret(
    //     'Order.all().containing(field: .foods, value: Restaurant.current().menu.matching(field: .name, value: "hamburger")[0])[0].restaurant.name'
    // )
    const funcCallResult = interpreter.interpret(
        'Order.all().contains(field: .foods, value: Restaurant.current().menu.matching(field: .name, value: "hamburger")[0])[0].restaurant.name'
    )
    expect(funcCallResult).toEqual({
        "objectType": "string",
        "type": "object",
        "value": "McDonald's"
    });
});
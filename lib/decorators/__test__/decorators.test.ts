import "../decorators";
import * as assert from "assert";
import {ClassDescriptor, FieldDescriptor, FuncDescriptor, GenieObject} from "../../dsl-descriptor";
import {setSharedStore} from "../store";
import {createStore} from "redux";
import {initGenie} from "../decorators";


function essentialFuncDescriptor(original: FuncDescriptor) {
    return {
        name: original.func_name,
        // comment: original.comment, // don't compare comments
        params: original.parameters,
        returnType: original.returnType,
        isStatic: original.isStatic
    }
}

function essentialFieldDescriptor(original: FieldDescriptor) {
    return {
        name: original.field,
        // comment: original.comment, // don't compare comments
        type: original.fieldType,
        isStatic: original.isStatic
    }
}

function compareClassDescriptor(a: ClassDescriptor<GenieObject>, b: ClassDescriptor<GenieObject>) {
    assert.equal(a.className, b.className);
    assert.equal(a.classConstructor, b.classConstructor);
    assert.equal(a.functions.size, b.functions.size);
    assert.equal(a.fields.size, b.fields.size);
    expect(Array.from(a.functions).map(essentialFuncDescriptor).sort()).toEqual(Array.from(b.functions).map(essentialFuncDescriptor).sort());
}
test("Restaurant Descriptor", async () => {
    initGenie();
    const { Restaurant } = await import("../../__test__/example_descriptor");
    compareClassDescriptor(Restaurant.ClassDescriptor, Restaurant._ClassDescriptor);
    Restaurant.all();
    const restaurant1 = Restaurant.GetObject({name: "McDonald's"});
    const restaurant2 = Restaurant.GetObject({name: "McDonald's"});
    restaurant2.rating = 5;
    assert.equal(restaurant1.rating, 5);
    restaurant2.rating = 3;
    assert.equal(restaurant1.rating, 3);
});

test("Food Descriptor", async () => {
    initGenie();
    const { Food } = await import("../../__test__/example_descriptor");
    compareClassDescriptor(Food.ClassDescriptor, Food._ClassDescriptor);
    Food.all();
    const foodItem1 = Food.GetObject({
        name: "Hamburger",
        price: 5.99,
        restaurant: {name: "McDonald's"}
    });
    const foodItem2 = Food.GetObject({
        name: "Hamburger",
        price: 5.99,
        restaurant: {name: "McDonald's"}
    });
    foodItem2.price = 6.99;
    assert.equal(foodItem1.price, 6.99);
    foodItem2.price = 5.99;
    assert.equal(foodItem1.price, 5.99);
});


import "../decorators";
import * as assert from "assert";
import {
  ClassDescriptor,
  FieldDescriptor,
  FuncDescriptor,
  DataClass, HelperClass, GenieObject
} from "../../dsl-descriptor";
import {GenieClass, GenieKey, GenieProperty, initGenie} from "../decorators";
import {
  DateTime,
  Food,
  Order,
  Restaurant,
} from "../../__test__/example_descriptor";
import {genieDispatch} from "../store";

initGenie();

function essentialFuncDescriptor(original: FuncDescriptor) {
  return {
    name: original.func_name,
    // comment: original.comment, // don't compare comments
    params: original.parameters,
    returnType: original.returnType,
    isStatic: original.isStatic,
  };
}

function essentialFieldDescriptor(original: FieldDescriptor) {
  return {
    name: original.field,
    // comment: original.comment, // don't compare comments
    type: original.fieldType,
    isStatic: original.isStatic,
  };
}

function sortDescriptor(a: { name: string }, b: { name: string }) {
  return a.name.localeCompare(b.name);
}

function compareClassDescriptor(
  a: ClassDescriptor<GenieObject>,
  b: ClassDescriptor<GenieObject>
) {
  assert.equal(a.className, b.className);
  assert.equal(a.classConstructor, b.classConstructor);
  assert.equal(a.functions.size, b.functions.size);
  assert.equal(a.fields.size, b.fields.size);
  expect(
    Array.from(a.functions).map(essentialFuncDescriptor).sort(sortDescriptor)
  ).toEqual(
    Array.from(b.functions).map(essentialFuncDescriptor).sort(sortDescriptor)
  );
  expect(
    Array.from(a.fields).map(essentialFieldDescriptor).sort(sortDescriptor)
  ).toEqual(
    Array.from(b.fields).map(essentialFieldDescriptor).sort(sortDescriptor)
  );
}
test("Restaurant Descriptor", async () => {
  compareClassDescriptor(
    Restaurant.ClassDescriptor,
    Restaurant._ClassDescriptor
  );
  Restaurant.all();
  const restaurant1 = Restaurant.GetObject({ name: "McDonald's" });
  const restaurant2 = Restaurant.GetObject({ name: "McDonald's" });
  restaurant2.rating = 5;
  assert.equal(restaurant1.rating, 5);
  restaurant2.rating = 3;
  assert.equal(restaurant1.rating, 3);
});

test("Food Descriptor", async () => {
  console.log("Food descriptor", Food.ClassDescriptor);
  console.log("Food descriptor", Food._ClassDescriptor);
  compareClassDescriptor(Food.ClassDescriptor, Food._ClassDescriptor);
  Restaurant.all();
  Food.all();
  const foodItem1 = Food.GetObject({ name: "Hamburger" });
  const foodItem2 = Food.GetObject({ name: "Hamburger" });
  foodItem2.price = 6.99;
  assert.equal(foodItem1.price, 6.99);
  foodItem2.price = 5.99;
  assert.equal(foodItem1.price, 5.99);
});

test("Order Descriptor", async () => {
  compareClassDescriptor(Order.ClassDescriptor, Order._ClassDescriptor);
  Restaurant.all();
  Order.all();
  const order1 = Order.GetObject({ orderId: 1 });
  const order2 = Order.GetObject({ orderId: 1 });
  order2.dateTime = DateTime.CreateObject({
    year: 2023,
    month: 1,
    day: 1,
    hour: 13,
    minute: 0,
  });
  assert.equal(
    order1.dateTime.toString(),
    new DateTime({
      year: 2023,
      month: 1,
      day: 1,
      hour: 13,
      minute: 0,
    }).toString()
  );
  order2.dateTime =  DateTime.CreateObject({
    year: 2023,
    month: 1,
    day: 2,
    hour: 13,
    minute: 0,
  });
  assert.equal(
    order1.dateTime.toString(),
    new DateTime({
      year: 2023,
      month: 1,
      day: 2,
      hour: 13,
      minute: 0,
    }).toString()
  );
});

@GenieClass("To-do list item")
class TodoListItem extends HelperClass {
  @GenieProperty("Name of the item")
  name: string;
  @GenieProperty("Whether the item is done")
  done: boolean;

  constructor({name, done}: {name: string, done: boolean}) {
    super({});
    this.name = name;
    this.done = done;
  }
}

@GenieClass("To-do list")
class TodoList extends DataClass {
  @GenieKey
  @GenieProperty("Name of the list")
  name: string;
  @GenieProperty("Items in the list")
  items: TodoListItem[];

  constructor({name, items}: {name: string, items: TodoListItem[]}) {
    super({});
    this.name = name;
    this.items = items;
  }

  static setup() {
    TodoList.CreateObject({name: "Groceries", items: [
        TodoListItem.CreateObject({name: "Milk", done: false}),
        TodoListItem.CreateObject({name: "Eggs", done: false}),
        TodoListItem.CreateObject({name: "Bread", done: false}),
        ]});
  }
}

test("Change TodoList", async () => {
  genieDispatch(() => {
    const groceriesList = TodoList.GetObject({ name: "Groceries" });
    const item = groceriesList.items[0];
    item.done = true;
    const groceriesListItems = groceriesList.items;
    groceriesListItems.push(TodoListItem.CreateObject({name: "Butter", done: false}));
  });
});
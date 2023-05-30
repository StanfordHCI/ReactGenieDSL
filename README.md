ReactGenieDSL: language parser and interpreter for ReactGenie
=========================================================
Jackie Yang (jackie@jackieyang.me)
----------------------------------

ReactGenieDSL is a Javascript library that extends ReactGenie, a multimodal React framework, to support error handling 
with the help of a natural language parser. ReactGenieDSL is written in Typescript.

## Install

before run:

```bash
npm ci

#or 

npm install
```

## Testing

```bash
export api_key=sk-***** # your api key here
npx jest
```

## Creating Class Objects
ReactGenie objects are created by extending the `GenieObject` class. A ReactGenie object has the following descriptors,
which must be used to annotate the class. This will tell the natural language parser how to interpret the class.
- `GenieClass`: Assigned to the class. 
- `GenieFunction`: Assigned to static functions.
- `GenieKey`: Assigned to the primary key of the class. This is how the class object is identified in the shared state database.
- `GenieProperty`: Assigned to fields of the class.
You must also include a static `_ClassDescriptor` field in the class, which is used to store an example of the different
class descriptors to use for testing purposes. 

```bash
@GenieClass("A food item")
export class Food extends GenieObject {
  static _all: Food[] = [];

  @GenieFunction("Get all food items")
  static all(): Food[] {
    return Food._all;
  };

  @GenieKey
  @GenieProperty("Name of the food item")
  public name: string;
  @GenieProperty("Price of the food item")
  public price: float;
  @GenieProperty("Restaurant of the food item")
  public restaurant: LazyType<Restaurant>;

  constructor({name, price, restaurant} : {name: string, price: float, restaurant: LazyType<Restaurant>}) {
    super({name: name});
    this.name = name;
    this.price = price;
    this.restaurant = restaurant;
    Food._all.push(this);
  }

  description(): {} {
    return {
      name: this.name,
      price: this.price,
      restaurant: this.restaurant.name
    };
  }

  static _ClassDescriptor = new ClassDescriptor<Food>(
    "Food",
    [
        new FuncDescriptor("all", [], "Food[]", true, "All foods")
    ],
    [
      new FieldDescriptor("name", "string", false),
      new FieldDescriptor("price", "float", false),
      new FieldDescriptor("restaurant", "Restaurant", false, "The restaurant this food is served at")
    ],
    Food
  );
}
```

## Writing Tests 
State Management: Tests are written in the `decorators.test.ts` file in the `__tests__` folder. See the following 
example to test whether state management works for the ReactGenie class objects.
`compareClassDescriptor` is used to compare the class descriptors that Genie identifies and the static `_ClassDescriptor` 
that is predefined in the class object.

```bash
test("Food Descriptor", async () => {
    compareClassDescriptor(Food.ClassDescriptor, Food._ClassDescriptor);
    Food.all();
    const foodItem1 = Food.GetObject({name: "Hamburger"});
    const foodItem2 = Food.GetObject({name: "Hamburger"});
    foodItem2.price = 6.99;
    assert.equal(foodItem1.price, 6.99);
    foodItem2.price = 5.99;
    assert.equal(foodItem1.price, 5.99);
});
```


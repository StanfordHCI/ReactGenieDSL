ReactGenieDSL: A language parser and interpreter for ReactGenie
=========================================================
Jackie Yang (jackie@jackieyang.me)
----------------------------------

ReactGenieDSL is a domain specific programming language that extends <a href="https://github.com/StanfordHCI/reactgenie">ReactGenie</a>, a multimodal React framework, to support error handling 
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

## Creating Genie Class Objects
ReactGenie objects are created by extending the `GenieObject` class. A ReactGenie object has the following descriptors,
which must be used to annotate the class. This will tell the natural language parser how to interpret the class.
- `GenieClass`: Assigned to the class. 
- `GenieFunction`: Assigned to static functions.
- `GenieKey`: Assigned to the primary key of the class. This is how the class object is identified in the shared state database.
- `GenieProperty`: Assigned to fields of the class.

The all() function gets all objects of that class from the shared state database. This must be destructured into a static
field called `_all` in the class to be used by the natural language parser.

You must use LazyTypes when referencing other ReactGenie objects that have not been created yet in that instance. For 
example, in the Food class below, the restaurant field is a LazyType of the Restaurant class because Restaurant is initiated 
after the Food class.


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
}
```


ReactGenieDSL: language parser and interpreter for ReactGenie
=========================================================
Jackie Yang (jackie@jackieyang.me)
----------------------------------

ReactGenieDSL is a Javascript library that extends ReactGenie, a multimodal React framework, to support error handling 
with the help of a natural language parser. ReactGenieDSL is written in Typescript. It provides a specialized syntax and 
set of features tailored to assist with ReactGenie. 

## Installation
Install dependencies:
```bash
npm ci

#or 

npm install
```
Please ensure that the `babel.config.js` file is present in the root directory of your project. This file is required
to configure Babel with the appropriate transpiler plugin for ReactGenieDSL. Make sure to include ReactGenieDSL as a
dependency in your `package.json` file, as well.


## Running ReactGenie DSL
This command sets an environment variable api_key to your Open AI API key. This step is necessary because ReactGenieDSL 
relies on Open AI for generating error messages.

By executing `npx jest`, you trigger the test runner to execute tests that verify state management. The test results 
will be displayed in the terminal, indicating whether the tests passed or failed.

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

In this example, we used `LazyType<Restaurant>` to enable delayed evaluation of type inference until it is explicitly 
required, providing improved performance and flexibility in generating React components.

The all() function needs to be destructured to access the Food._all array, which is a static property of the Food class.
As a result, it needs to be referenced through the Food class itself.

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

## Contributing
Contributions to ReactGenieDSL are welcome! If you encounter any issues or have suggestions for improvements, please 
create a new issue on the repository. Pull requests are also appreciated.

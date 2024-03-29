ReactGenieDSL: A language parser and interpreter for ReactGenie
=========================================================
ReactGenie Team
----------------------------------

ReactGenieDSL is a Javascript library that extends ReactGenie, a multimodal React library, to support complex interactions
using both voice and touch commands. If you are creating a voice or text-based React application, ReactGenieDSL
can help you with state management, parsing the user's voice input, executing user voice commands, and error handling.  

ReactGenieDSL is written in Typescript. It provides a specialized syntax and 
set of features tailored to assist with ReactGenie. 

## Prerequisites

Before getting started, make sure you have the following requirements in place:

- Node Version Manager (NVM) version 18 or higher.
- Access to OpenAI API key

## How to Use

### Installation
Installation can be done through `npm`.
    
  ```bash
  npm install --dev reactgenie-dsl
  ```

### Creating Genie Class Objects
ReactGenie objects are created by extending the `GenieObject` class. These objects are used to define states in your app
for state management. A ReactGenie object has the following descriptors,
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


The all() function needs to be destructured to access the Food._all array, which is a static property of the Food class.
As a result, it needs to be referenced through the Food class itself.

```typescript
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

By annotating our class with these Genie descriptors, ReactGenieDSL will be able to parse the user's input utterance and 
automatically generate a command that can be executed by the app. For example, if the user says "What is the price of a 
burger?", the parser will generate the following command: `Food.current().getPrice()`.

Here some more examples of complex commands that can be generated by the parser:
- User utterance: "I want to order a burger"
  - Parsed Result: `Order.GetActiveCart().addItems(items: [OrderItem.CreateOrderItem(FoodItem.GetFoodItem(name: \"burger\"))])`
- User utterance: What is the delivery fee of McDonalds?
  - Parsed Result: `Restaurant.GetRestaurant(name: "mcdonalds").deliveryFee`

### How it Works
The ReactGenie interpreter processes user inputs by processing the Genie objects, performing their associated actions, and
returning the results. The interpreter uses the `nlParser.parse method` to parse the user's command and the 
`dslInterpreter.interpret` method to interpret it. The interpretation result is then transformed into a JSON response. 
Please look at the [File Browser Example](https://github.com/StanfordHCI/ReactGenieDSL/tree/main/example/file_browser) 
for more details on how to use the interpreter.

## Contributing to the Library
Contributions to ReactGenieDSL are welcome! The following sections will provide instructions on how to set up your
development environment and run tests.

If you encounter any issues or have suggestions for improvements, please 
create a new issue on the repository. Pull requests are also appreciated.

### Setting up development environment

Install dependencies using `npm`:
```bash
npm ci

#or 

npm install
```
Please ensure that the `babel.config.js` and `tsconfig.json` file is present in the root directory of your project. The developer 
dependencies should match those of the [File Browser Example](https://github.com/StanfordHCI/ReactGenieDSL/tree/main/example/file_browser).
If it does not exist, please copy those files and dependencies from the example. 

This file is required to configure Babel with the appropriate transpiler plugin for ReactGenieDSL. 
Make sure to include ReactGenieDSL as a dependency in your `package.json` file, as well.


### Running ReactGenie DSL

First, copy the .env.example file as .env and fill in the OPENAI_API_KEY and BASEURL if needed. 

By executing `npx jest`, you trigger the test runner to execute tests that verify state management. The test results
will be displayed in the terminal, indicating whether the tests passed or failed.

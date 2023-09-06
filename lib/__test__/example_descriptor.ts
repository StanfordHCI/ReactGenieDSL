import {
  ClassDescriptor,
  FieldDescriptor,
  FuncDescriptor,
  DataClass,
  ParamDescriptor,
  HelperClass,
} from "../dsl-descriptor";
import { ExampleParse } from "../nl";
import {
  float,
  GenieClass,
  GenieFunction,
  GenieKey,
  GenieProperty,
  int,
  LazyType,
} from "../decorators";

export let recentBooking = null;

@GenieClass("Representing a date and time")
export class DateTime extends HelperClass {
  private date: Date;

  public year: number;
  public month: number;
  public day: number;
  public dayOfWeek: string;
  public hour: number;
  public minute: number;

  private updateDate() {
    this.year = this.date.getFullYear();
    this.month = this.date.getMonth() + 1;
    this.day = this.date.getDate();
    this.hour = this.date.getHours();
    this.minute = this.date.getMinutes();
    this.dayOfWeek = this.date.toLocaleDateString("en-US", { weekday: "long" });
  }

  static today() {
    return DateTime.CreateObject({
      year: 2020,
      month: 2,
      day: 4,
      hour: 12,
      minute: 0,
    });
  }

  static sunday = 0;
  static monday = 1;
  static tuesday = 2;
  static wednesday = 3;
  static thursday = 4;
  static friday = 5;
  static saturday = 6;

  static fromDate(date: Date) {
    const dt = DateTime.CreateObject({});
    dt.date = date;
    dt.updateDate();
    return dt;
  }

  description(): {} {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
      dayOfWeek: this.dayOfWeek,
      hour: this.hour,
      minute: this.minute,
    };
  }

  // custom comparator for sorting

  static compare(a: DateTime, b: DateTime) {
    return a.date.getTime() - b.date.getTime();
  }

  constructor({
    year = undefined,
    month = undefined,
    day = undefined,
    hour = undefined,
    minute = undefined,
  }: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  }) {
    super({});
    this.date = new Date();
    this.setDate({ year, month, day, hour, minute });
  }

  _getConstructorParams(): any {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
      hour: this.hour,
      minute: this.minute,
    };
  }

  addDateOffset({
    year = 0,
    month = 0,
    day = 0,
    hour = 0,
    minute = 0,
  }: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  }) {
    this.date.setFullYear(this.date.getFullYear() + year);
    this.date.setMonth(this.date.getMonth() + month);
    this.date.setDate(this.date.getDate() + day);
    this.date.setHours(this.date.getHours() + hour);
    this.date.setMinutes(this.date.getMinutes() + minute);
    this.updateDate();
    return this;
  }

  setDate({
    year = undefined,
    month = undefined,
    day = undefined,
    hour = undefined,
    minute = undefined,
    day_of_the_week = undefined,
  }: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    day_of_the_week?: number;
  }) {
    if (year !== undefined) {
      this.date.setFullYear(year);
    }
    if (month !== undefined) {
      this.date.setMonth(month - 1);
    }
    if (day !== undefined) {
      this.date.setDate(day);
    }
    if (day_of_the_week !== undefined) {
      this.date.setDate(
        this.date.getDate() + (day_of_the_week - this.date.getDay())
      );
    }
    if (hour !== undefined) {
      this.date.setHours(hour);
    }
    if (minute !== undefined) {
      this.date.setMinutes(minute);
    }
    this.updateDate();
    return this;
  }

  toString() {
    return `${this.year}-${this.month}-${this.day} ${this.hour}:${this.minute}`;
  }

  static _ClassDescriptor = new ClassDescriptor<DateTime>(
    "DateTime",
    [
      new FuncDescriptor(
        "addDateOffset",
        [
          new ParamDescriptor("year", "int"),
          new ParamDescriptor("month", "int"),
          new ParamDescriptor("day", "int"),
          new ParamDescriptor("hour", "int"),
          new ParamDescriptor("minute", "int"),
        ],
        "DateTime",
        false,
        "Add a date offset to the current date"
      ),
      new FuncDescriptor(
        "constructor",
        [
          new ParamDescriptor("year", "int", false),
          new ParamDescriptor("month", "int", false),
          new ParamDescriptor("day", "int", false),
          new ParamDescriptor("hour", "int", false),
          new ParamDescriptor("minute", "int", false),
        ],
        "DateTime",
        false,
        "Create a new date time object"
      ),
      new FuncDescriptor(
        "setDate",
        [
          new ParamDescriptor("year", "int", false),
          new ParamDescriptor("month", "int", false),
          new ParamDescriptor("day", "int", false),
          new ParamDescriptor("hour", "int", false),
          new ParamDescriptor("minute", "int", false),
          new ParamDescriptor("day_of_the_week", "int", false),
        ],
        "DateTime",
        false,
        "Set the date of the date time object"
      ),
      new FuncDescriptor(
        "today",
        [],
        "DateTime",
        true,
        "Get the current date time"
      ),
    ],
    [
      new FieldDescriptor("year", "int", false),
      new FieldDescriptor("month", "int", false),
      new FieldDescriptor("day", "int", false),
      new FieldDescriptor("hour", "int", false),
      new FieldDescriptor("minute", "int", false),
      new FieldDescriptor("dayOfWeek", "string", false),
      new FieldDescriptor("sunday", "int", true),
      new FieldDescriptor("monday", "int", true),
      new FieldDescriptor("tuesday", "int", true),
      new FieldDescriptor("wednesday", "int", true),
      new FieldDescriptor("thursday", "int", true),
      new FieldDescriptor("friday", "int", true),
      new FieldDescriptor("saturday", "int", true),
    ],
    DateTime
  );
}

@GenieClass("A food item")
export class Food extends DataClass {
  static _all: Food[] = [];

  @GenieFunction("Get all food items")
  static all(): Food[] {
    return Food._all;
  }

  @GenieKey
  @GenieProperty("Name of the food item")
  public name: string;
  @GenieProperty("Price of the food item")
  public price: float;
  @GenieProperty("Restaurant of the food item")
  public restaurant: LazyType<Restaurant>;

  constructor({
    name,
    price,
    restaurant,
  }: {
    name: string;
    price: float;
    restaurant: LazyType<Restaurant>;
  }) {
    super({});
    this.name = name;
    this.price = price;
    this.restaurant = restaurant;
    Food._all.push(this);
  }

  description(): {} {
    return {
      name: this.name,
      price: this.price,
      restaurant: this.restaurant.name,
    };
  }

  static _ClassDescriptor = new ClassDescriptor<Food>(
    "Food",
    [new FuncDescriptor("all", [], "Food[]", true, "All foods"),
      new FuncDescriptor("All", [], "Food[]", true, "")
    ],

    [
      new FieldDescriptor("name", "string", false),
      new FieldDescriptor("price", "float", false),
      new FieldDescriptor(
        "restaurant",
        "Restaurant",
        false,
        "The restaurant this food is served at"
      ),
    ],
    Food
  );
}

@GenieClass("An Order")
export class Order extends DataClass {
  static _all: Order[] = [];
  @GenieFunction("Get all orders")
  static all(): Order[] {
    return Order._all;
  }

  static _current: Order = undefined;

  @GenieFunction("Get the current order")
  static current(): Order {
    if (this._current === undefined) {
      this._current = Order.CreateObject({
        orderId: (Order.all().length + 1).toString(),
        dateTime: DateTime.fromDate(new Date()),
        foods: [],
        restaurant: Restaurant.current(),
      });
    }
    return this._current;
  }

  @GenieKey
  @GenieProperty("Order ID number")
  public orderId: string;
  @GenieProperty("Time that order is placed")
  public dateTime: DateTime;
  @GenieProperty("Foods in the order")
  public foods: Food[];
  @GenieProperty("Restaurant of the order")
  public restaurant: LazyType<Restaurant>;

  constructor({
    orderId,
    dateTime,
    foods,
    restaurant,
  }: {
    orderId: string;
    dateTime: DateTime;
    foods: Food[];
    restaurant: LazyType<Restaurant> | null;
  }) {
    super({ orderId: orderId });
    this.orderId = (Order.all().length + 1).toString();
    this.dateTime = dateTime;
    this.foods = foods;
    this.restaurant = restaurant;
    Order._all.push(this);
  }

  @GenieFunction("Add foods to the order")
  addFoods({ foods }: { foods: Food[] }): void {
    this.foods.push(...foods);
  }

  @GenieFunction("Remove foods from the order")
  removeFoods({ foods }: { foods: Food[] }): void {
    this.foods = this.foods.filter((f) => !foods.includes(f));
  }

  @GenieFunction("Place the order")
  placeOrder(): void {
    this.restaurant.orders.push(this);
  }

  description(): {} {
    return {
      dateTime: this.dateTime.toString(),
      foods: this.foods.map((f) => f.name),
      restaurant: this.restaurant.name,
    };
  }

  static _ClassDescriptor = new ClassDescriptor<Order>(
    "Order",
    [
      new FuncDescriptor(
        "addFoods",
        [new ParamDescriptor("foods", "Food[]")],
        "void",
        false,
        "Add a list of foods to the order"
      ),
      new FuncDescriptor(
        "removeFoods",
        [new ParamDescriptor("foods", "Food[]")],
        "void",
        false,
        "Remove a list of foods from the order"
      ),
      new FuncDescriptor("placeOrder", [], "void", false, "Place the order"),
      new FuncDescriptor("current", [], "Order", true, "The current order"),
      new FuncDescriptor("all", [], "Order[]", true, "All past orders"),
      new FuncDescriptor("All", [], "Order[]", true, ""),

    ],
    [
      new FieldDescriptor("orderId", "string", false),
      new FieldDescriptor("dateTime", "DateTime", false),
      new FieldDescriptor("foods", "Food[]", false),
      new FieldDescriptor("restaurant", "Restaurant", false),
    ],
    Order
  );
}

@GenieClass("A restaurant")
export class Restaurant extends DataClass {
  static _all: Restaurant[] = undefined;
  @GenieProperty("Past orders of the restaurant")
  public orders: Order[] = [];

  @GenieFunction("Get all restaurants")
  static all(): Restaurant[] {
    if (this._all === undefined) {
      const mcDonald = Restaurant.CreateObject({
        name: "McDonald's",
        menu: [],
        rating: 4,
        priceGrade: 2,
        cuisine: "Fast Food",
        address: "123 Main St, Mountain view, USA",
      });
      const kfc = Restaurant.CreateObject({
        name: "KFC",
        menu: [],
        rating: 3,
        priceGrade: 1,
        cuisine: "Fast Food",
        address: "123 Main St, Palo Alto, USA",
      });
      const pizzaHut = Restaurant.CreateObject({
        name: "Pizza Hut",
        menu: [],
        rating: 4,
        priceGrade: 2,
        cuisine: "Fast Food",
        address: "123 Main St, Palo Alto, USA",
      });
      const burgerKing = Restaurant.CreateObject({
        name: "Burger King",
        menu: [],
        rating: 4,
        priceGrade: 2,
        cuisine: "Fast Food",
        address: "123 Main St, Mountain View, USA",
      });
      const taste = Restaurant.CreateObject({
        name: "Taste",
        menu: [],
        rating: 5,
        priceGrade: 3,
        cuisine: "Chinese",
        address: "123 Main St, Palo Alto, USA",
      });
      const orensHummus = Restaurant.CreateObject({
        name: "Oren's Hummus",
        menu: [],
        rating: 4,
        priceGrade: 2,
        cuisine: "Middle Eastern",
        address: "123 Main St, Mountain View, USA",
      });
      const steam = Restaurant.CreateObject({
        name: "Steam",
        menu: [],
        rating: 4,
        priceGrade: 2,
        cuisine: "Chinese",
        address: "123 Main St, Palo Alto, USA",
      });

      mcDonald.createFood("Hamburger", 5);
      mcDonald.createFood("Cheeseburger", 6);
      mcDonald.createFood("McFlurry", 3);
      mcDonald.createFood("McChicken", 4);
      mcDonald.createFood("McDouble", 4);
      mcDonald.createFood("Coca Cola Coke", 2);
      mcDonald.createOrder(
        (Order.all().length + 1).toString(),
        DateTime.CreateObject({
          year: 2020,
          month: 1,
          day: 1,
          hour: 12,
          minute: 0,
        }),
        [mcDonald.menu[0], mcDonald.menu[1]]
      );
      mcDonald.createOrder(
        (Order.all().length + 1).toString(),
        DateTime.CreateObject({
          year: 2020,
          month: 1,
          day: 1,
          hour: 13,
          minute: 0,
        }),
        [mcDonald.menu[2], mcDonald.menu[3]]
      );
      mcDonald.createOrder(
        (Order.all().length + 1).toString(),
        DateTime.CreateObject({
          year: 2020,
          month: 2,
          day: 1,
          hour: 14,
          minute: 0,
        }),
        [mcDonald.menu[4], mcDonald.menu[5]]
      );

      kfc.createFood("Chicken", 5);
      kfc.createFood("Fries", 2);
      kfc.createFood("Pepsi Coke", 2);
      kfc.createOrder(
        (Order.all().length + 1).toString(),
        DateTime.CreateObject({
          year: 2020,
          month: 1,
          day: 1,
          hour: 15,
          minute: 0,
        }),
        [kfc.menu[0], kfc.menu[1]]
      );

      this._all = [
        mcDonald,
        kfc,
        pizzaHut,
        burgerKing,
        taste,
        orensHummus,
        steam,
      ];
    }
    return this._all;
  }

  description(): {} {
    return {
      name: this.name,
      cuisine: this.cuisine,
      rating: this.rating,
      priceGrade: this.priceGrade,
      address: this.address,
    };
  }

  createFood(name: string, price: float) {
    const food: Food = Food.CreateObject({ name, price, restaurant: this });
    this.menu.push(food);
    return food;
  }

  createOrder(orderId: string, dateTime: DateTime, foods: Food[]) {
    const order = Order.CreateObject({
      orderId,
      dateTime,
      foods,
      restaurant: this,
    });
    this.orders.push(order);
    return order;
  }

  @GenieFunction("Get the current restaurant")
  static current(): Restaurant {
    return this.all()[0];
  }

  @GenieFunction("Book a table for a given date time")
  book({ dateTime }: { dateTime: DateTime }): void {
    console.log(`${this.name} is booking for ${dateTime.toString()}`);
    recentBooking = `${this.name} is booking for ${dateTime.toString()}`;
  }

  @GenieKey
  @GenieProperty("Name of the restaurant")
  public name: string;
  @GenieProperty("Menu of the restaurant")
  public menu: Food[];
  @GenieProperty("Rating of the restaurant")
  public rating: int;
  @GenieProperty("Price grade of the restaurant")
  public priceGrade: float;
  @GenieProperty("Cuisine of the restaurant")
  public cuisine: string;
  @GenieProperty("Address of the restaurant")
  public address: string;

  @GenieProperty()
  public menus: string[];

  constructor({
    name,
    menu,
    rating = 0,
    priceGrade = 0,
    cuisine = "",
    address = "",
  }: {
    name: string;
    menu: Food[];
    rating: number;
    priceGrade: number;
    cuisine: string;
    address: string;
  }) {
    super({ name: name });
    this.name = name;
    this.menu = menu;
    this.rating = rating;
    this.priceGrade = priceGrade;
    this.cuisine = cuisine;
    this.address = address;
  }

  static _ClassDescriptor = new ClassDescriptor<Restaurant>(
    "Restaurant",
    [
      new FuncDescriptor(
        "all",
        [],
        "Restaurant[]",
        true,
        "All active restaurants"
      ),
      new FuncDescriptor(
          "All",
          [],
          "Restaurant[]",
          true,
          "All active restaurants"
      ),
      new FuncDescriptor(
        "current",
        [],
        "Restaurant",
        true,
        "The current restaurant"
      ),
      new FuncDescriptor(
        "book",
        [new ParamDescriptor("dateTime", "DateTime")],
        "void",
        false,
        "Book a table for a given date time"
      ),
    ],
    [
      new FieldDescriptor("name", "string", false),
      new FieldDescriptor("menu", "Food[]", false),
      new FieldDescriptor("rating", "int", false),
      new FieldDescriptor("priceGrade", "float", false),
      new FieldDescriptor("cuisine", "string", false),
      new FieldDescriptor("address", "string", false),
      new FieldDescriptor("orders", "Order[]", false),
    ],
    Restaurant
  );
}

export const allDescriptors = [
  Restaurant.ClassDescriptor,
  Food.ClassDescriptor,
  Order.ClassDescriptor,
  DateTime._ClassDescriptor,
];

export const classDescriptions = allDescriptors.map((d) => d.description());

export const examples: ExampleParse[] = [
  {
    user_utterance: "get me the best restaurant in palo alto",
    example_parsed:
      'Restaurant.all().matching(field: .address, value: "palo alto").sort(field: .rating, ascending: false)[0]',
  },
  {
    user_utterance:
      "get me the least expensive restaurant that serves chinese food",
    example_parsed:
      'Restaurant.all().matching(field: .cuisine, value: "chinese").sort(field: .price, ascending: true)[0]',
  },
  {
    user_utterance: "add hamburger to the order",
    example_parsed:
      'Order.current().addFoods(foods: [Restaurant.current().menu.matching(field: .name, value: "hamburger")[0]])',
  },
  {
    user_utterance: "remove hamburger from the order",
    example_parsed:
      'Order.current().removeFoods(foods: Order.current().foods.matching(field: .name, value: "hamburger"))',
  },
  {
    user_utterance: "what do I have in my order",
    example_parsed: "Order.current().foods",
  },
  {
    user_utterance: "what did I ordered at mcDonald last time?",
    example_parsed:
      'Order.all().matching(field: .restaurant, value: Restaurant.all().matching(field: .name, value: "mcDonald")[0]).sort(field: .dateTime, ascending: false)[0].foods\n',
  },
  {
    user_utterance: "what's my recent order with a milkshake?",
    example_parsed:
      'Order.all().contains(field: .foods, value: Food.all().matching(field: .name, value: "milkshake")[0]).sort(field: .dateTime, ascending: false)[0]',
  },
];

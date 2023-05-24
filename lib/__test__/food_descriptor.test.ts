import {ClassDescriptor, FieldDescriptor, FuncDescriptor, GenieObject, ParamDescriptor} from "../dsl-descriptor";
import {DateTime} from "./example_descriptor";
import {NlInterpreter} from "../nl-interpreter";
import stateJson from "./food_descriptor.state.json";
import {initGenie} from "../decorators";
initGenie();

export interface SanityDish {
    Price: number,
    _createdAt: string,
    _id: string,
    _rev: string,
    _type: string,
    _updatedAt: string,
    name: string,
    short_description: string
}

export interface SanityRestaurant {
    _createdAt: string;
    _id: string;
    _rev: string;
    _type: string;
    _updatedAt: string;
    address: string;
    lat: number;
    long: number;
    rating: number;
    short_description: string;
    dishes: SanityDish[];
    name: string;
}

export interface SanityFeaturedRow {
    _createdAt: string,
    _id: string,
    _rev: string,
    _type: string,
    _updatedAt: string,
    name: string
    short_description: string
    restaurants: number[]
}

export interface State {
    basket: {
        items: SanityDish[]
    },
    restaurant: {
        restaurants: SanityRestaurant[],
        featuredRows: SanityFeaturedRow[],
        activeRestaurantIdx: number
    }
}

let state: State = stateJson;

function findAllDishes(): SanityDish[] {
    return state.restaurant.restaurants.reduce((acc, restaurant) => {
        return acc.concat(restaurant.dishes)
    }, new Array<SanityDish>());
}

class GenieDish extends GenieObject {
    public price: number = 0;
    public created: DateTime = DateTime.today();
    public name: string = "";
    public short_description: string = "";
    public id: string = "";

    description(): {} {
        return {name: this.name, price: this.price, short_description: this.short_description};
    }

    static all(): GenieDish[] {
        return findAllDishes().map(dish => GenieDish.fromSanityDish(dish));
    }

    static fromSanityDish(dish: SanityDish): GenieDish {
        const ld = new GenieDish({name: dish.name});
        ld.name = dish.name;
        ld.price = dish.Price;
        ld.short_description = dish.short_description;
        ld.created = DateTime.fromDate(new Date(dish._createdAt));
        ld.id = dish._id;
        return ld;
    }

    static ClassDescriptor = new ClassDescriptor<GenieDish>(
        "Dish",
        [
            new FuncDescriptor("all", [], "Dish[]", true),
        ],
        [
            new FieldDescriptor("price", "int", false),
            new FieldDescriptor("created", "DateTime", false),
            new FieldDescriptor("name", "string", false),
            new FieldDescriptor("short_description", "string", false)
        ],
        GenieDish
    );
}

class GenieRestaurant extends GenieObject {
    public name: string = "";
    public created: DateTime = DateTime.today();
    public updated: DateTime = DateTime.today();
    public address: string = "";
    public dishes: GenieDish[] = [];
    public rating: number = 0;
    public short_description: string = "";
    public id: string = "";

    static all(): GenieRestaurant[] {
        console.log("all_restaurants" + state.restaurant.restaurants.map(r => GenieRestaurant.fromSanityRestaurant(r)))
        return state.restaurant.restaurants.map(r => GenieRestaurant.fromSanityRestaurant(r));
    }

    static current(): GenieRestaurant {
        return GenieRestaurant.fromSanityRestaurant(state.restaurant.restaurants[state.restaurant.activeRestaurantIdx]);
    }

    description(): {} {
        return {name: this.name, address: this.address, rating: this.rating, short_description: this.short_description};
    }

    static select(restaurant: GenieRestaurant) {
        const idx = state.restaurant.restaurants.findIndex(r => r._id === restaurant.id);
        if (idx !== -1) {
            state.restaurant.activeRestaurantIdx = idx;
        }
    }

    static fromSanityRestaurant(restaurant: SanityRestaurant): GenieRestaurant {
        const lr = new GenieRestaurant({name: restaurant.name});
        lr.name = restaurant.name;
        lr.address = restaurant.address;
        lr.rating = restaurant.rating;
        lr.short_description = restaurant.short_description;
        lr.created = DateTime.fromDate(new Date(restaurant._createdAt));
        lr.updated = DateTime.fromDate(new Date(restaurant._updatedAt));
        lr.dishes = restaurant.dishes.map(dish => GenieDish.fromSanityDish(dish));
        lr.id = restaurant._id;
        return lr;
    }

    static ClassDescriptor = new ClassDescriptor<GenieRestaurant>(
        "Restaurant",
        [
            new FuncDescriptor("all", [], "Restaurant[]", true),
            new FuncDescriptor("current", [], "Restaurant", true),
            new FuncDescriptor("select", [new ParamDescriptor("restaurant", "Restaurant", true)], "void", true)
        ],
        [
            new FieldDescriptor("name", "string", false),
            new FieldDescriptor("created", "DateTime", false),
            new FieldDescriptor("updated", "DateTime", false),
            new FieldDescriptor("address", "string", false),
            new FieldDescriptor("dishes", "Dish[]", true),
            new FieldDescriptor("rating", "int", false),
            new FieldDescriptor("short_description", "string", false)
        ],
        GenieRestaurant
    );
}

class GenieOrder extends GenieObject {

    static addFoods({dishes}: { dishes: GenieDish[] }) {
        const ids_to_add = dishes.map(dish => dish.id);
        state.basket.items = [...state.basket.items, ...findAllDishes().filter(dish => ids_to_add.includes(dish._id))];
    }

    static removeFoods({dishes}: { dishes: GenieDish[] }) {
        const ids_to_remove = dishes.map(dish => dish.id);
        state.basket.items = state.basket.items.filter(item => !ids_to_remove.includes(item._id));
    }

    static orderedFoods(): GenieDish[] {
        return state.basket.items.map(item => GenieDish.fromSanityDish(item));
    }

    static ClassDescriptor = new ClassDescriptor<GenieOrder>(
        "Order",
        [
            new FuncDescriptor("addFoods", [
                new ParamDescriptor("dishes", "Dish[]", true)
            ], "void", true),
            new FuncDescriptor("removeFoods", [
                new ParamDescriptor("dishes", "Dish[]", true)
            ], "void", true),
            new FuncDescriptor("orderedFoods", [], "Dish[]", true),
        ], [],
        GenieOrder
    );

    description(): {} {
        return {};
    }
}

export const GenieClassDescriptors = [
    GenieRestaurant.ClassDescriptor,
    GenieDish.ClassDescriptor,
    GenieOrder.ClassDescriptor,
    DateTime._ClassDescriptor
];
export const GenieClassesExamples = [
    {
        user_utterance: "select subway",
        example_parsed: "Restaurant.select(restaurant: Restaurant.all().matching(field: .name, value: \"subway\")[0])"
    },
    {
        user_utterance: "order steak",
        example_parsed: "Order.addFoods(dishes: [Dish.all().matching(field: .name, value: \"steak\")])",
    },
    {
        user_utterance: "order fries from current restaurant",
        example_parsed: "Order.addFoods(dishes: [Restaurant.current().dishes.matching(field: .name, value: \"fries\")])\n",
    },
    {
        user_utterance: "add two hamburgers",
        example_parsed: "Order.addFoods(dishes: [Dish.all().matching(field: .name, value: \"hamburger\")[0], Dish.all().matching(field: .name, value: \"hamburger\")[0]])",
    }
]

jest.setTimeout(30000);

test('Simple function', async () => {
    const interpreter = new NlInterpreter(GenieClassDescriptors, process.env.api_key, undefined, GenieClassesExamples);
    const funcCallResult = await interpreter.interpret('add a sub to basket');
    expect(funcCallResult).toEqual({
        "objectType": "void",
        "type": "object"
    })
})




import { parse } from "../parser.gen.js";

test("parse", () => {
  const result = parse(
    "Order.past_orders.between(field:.order_date,from:Date.today.add_date(day:-7).day_of_the_same_week(new_day_of_the_week:Day.Monday),to:Date.today.add_date(day:-7).day_of_the_same_week(new_day_of_the_week:Day.Sunday))[0].foods[0]",
    {}
  )[0];
  expect(result).toEqual({
    type: "index",
    parent: {
      type: "access",
      parent: {
        type: "index",
        parent: {
          type: "access",
          parent: { type: "access", parent: "Order", access: "past_orders" },
          access: {
            type: "function_call",
            func_name: "between",
            parameters: [
              {
                parameter: "field",
                value: { type: "accessor", field: "order_date" },
              },
              {
                parameter: "from",
                value: {
                  type: "access",
                  parent: {
                    type: "access",
                    parent: { type: "access", parent: "Date", access: "today" },
                    access: {
                      type: "function_call",
                      func_name: "add_date",
                      parameters: [
                        { parameter: "day", value: { type: "int", value: -7 } },
                      ],
                    },
                  },
                  access: {
                    type: "function_call",
                    func_name: "day_of_the_same_week",
                    parameters: [
                      {
                        parameter: "new_day_of_the_week",
                        value: {
                          type: "access",
                          parent: "Day",
                          access: "Monday",
                        },
                      },
                    ],
                  },
                },
              },
              {
                parameter: "to",
                value: {
                  type: "access",
                  parent: {
                    type: "access",
                    parent: { type: "access", parent: "Date", access: "today" },
                    access: {
                      type: "function_call",
                      func_name: "add_date",
                      parameters: [
                        { parameter: "day", value: { type: "int", value: -7 } },
                      ],
                    },
                  },
                  access: {
                    type: "function_call",
                    func_name: "day_of_the_same_week",
                    parameters: [
                      {
                        parameter: "new_day_of_the_week",
                        value: {
                          type: "access",
                          parent: "Day",
                          access: "Sunday",
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        index: 0,
      },
      access: "foods",
    },
    index: 0,
  });

  const result2 = parse(
    'Restaurant.default.matching(field: .name, value: "Panda Express")[0].remove_favorite_restaurant()'
  )[0];
  expect(result2).toEqual({
    type: "access",
    parent: {
      type: "index",
      parent: {
        type: "access",
        parent: { type: "access", parent: "Restaurant", access: "default" },
        access: {
          type: "function_call",
          func_name: "matching",
          parameters: [
            { parameter: "field", value: { type: "accessor", field: "name" } },
            {
              parameter: "value",
              value: { type: "string", value: "Panda Express" },
            },
          ],
        },
      },
      index: 0,
    },
    access: {
      type: "function_call",
      func_name: "remove_favorite_restaurant",
      parameters: null,
    },
  });

  const result3 = parse(
    'Current.order.add_to_order(foods: [Current.food.matching(field: .name, value: "hamburger")])'
  )[0];
  expect(result3).toEqual({
    type: "access",
    parent: { type: "access", parent: "Current", access: "order" },
    access: {
      type: "function_call",
      func_name: "add_to_order",
      parameters: [
        {
          parameter: "foods",
          value: {
            type: "array",
            value: [
              {
                type: "access",
                parent: { type: "access", parent: "Current", access: "food" },
                access: {
                  type: "function_call",
                  func_name: "matching",
                  parameters: [
                    {
                      parameter: "field",
                      value: { type: "accessor", field: "name" },
                    },
                    {
                      parameter: "value",
                      value: { type: "string", value: "hamburger" },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  });

  const result4 = parse(
    'Order.current.add_to_order(foods: [Restaurant.all.matching(field: .name, value: "mcDonalds")[0].get_menu().matching(field: .name, value: "coke")[0]])'
  )[0];
  expect(result4).toEqual({
    type: "access",
    parent: { type: "access", parent: "Order", access: "current" },
    access: {
      type: "function_call",
      func_name: "add_to_order",
      parameters: [
        {
          parameter: "foods",
          value: {
            type: "array",
            value: [
              {
                type: "index",
                parent: {
                  type: "access",
                  parent: {
                    type: "access",
                    parent: {
                      type: "index",
                      parent: {
                        type: "access",
                        parent: {
                          type: "access",
                          parent: "Restaurant",
                          access: "all",
                        },
                        access: {
                          type: "function_call",
                          func_name: "matching",
                          parameters: [
                            {
                              parameter: "field",
                              value: { type: "accessor", field: "name" },
                            },
                            {
                              parameter: "value",
                              value: { type: "string", value: "mcDonalds" },
                            },
                          ],
                        },
                      },
                      index: 0,
                    },
                    access: {
                      type: "function_call",
                      func_name: "get_menu",
                      parameters: null,
                    },
                  },
                  access: {
                    type: "function_call",
                    func_name: "matching",
                    parameters: [
                      {
                        parameter: "field",
                        value: { type: "accessor", field: "name" },
                      },
                      {
                        parameter: "value",
                        value: { type: "string", value: "coke" },
                      },
                    ],
                  },
                },
                index: 0,
              },
            ],
          },
        },
      ],
    },
  });
  const result5 = parse(
    "Order.all().sort(field: .date, ascending: true)[0].restaurant.name"
  )[0];
  expect(result5).toEqual({
    access: "name",
    parent: {
      access: "restaurant",
      parent: {
        index: 0,
        parent: {
          access: {
            func_name: "sort",
            parameters: [
              {
                parameter: "field",
                value: {
                  field: "date",
                  type: "accessor",
                },
              },
              {
                parameter: "ascending",
                value: {
                  type: "boolean",
                  value: true,
                },
              },
            ],
            type: "function_call",
          },
          parent: {
            access: {
              func_name: "all",
              parameters: null,
              type: "function_call",
            },
            parent: "Order",
            type: "access",
          },
          type: "access",
        },
        type: "index",
      },
      type: "access",
    },
    type: "access",
  });
});

test("parser error test", () => {
  const result = parse("Booking.Current().payment.setProperty(method: \"MasterCard\"); Booking.Current().confirm();");
  console.log(result);
});
import { parse } from "./parser.gen.js";
import {
  ClassDescriptor,
  FuncDescriptor,
  GenieObject,
  ParamDescriptor,
} from "../dsl-descriptor";

function parseType(value_type: string): {
  is_array: boolean;
  original_type: string;
} {
  if (value_type.endsWith("[]")) {
    return {
      is_array: true,
      original_type: value_type.substring(0, value_type.length - 2),
    };
  } else {
    return { is_array: false, original_type: value_type };
  }
}

export class InterpreterError extends Error {
}

export class ClassMissingError extends InterpreterError {
  constructor(public class_name: string) {
    super(`Class ${class_name} is missing`);
  }
}

export class FieldMissingError extends InterpreterError {
  constructor(public class_name: string, public field_name: string) {
    super(`Field ${class_name}.${field_name} is missing`);
  }
}

export class FieldStaticError extends InterpreterError {
    constructor(public class_name: string, public field_name: string) {
        super(`Field ${class_name}.${field_name} should be static`);
    }
}

export class FunctionMissingError extends InterpreterError {
  constructor(public class_name: string, public func_name: string) {
    super(`Function ${class_name}.${func_name} is missing`);
  }
}

export class FunctionStaticError extends InterpreterError {
  constructor(public class_name: string, public func_name: string) {
    super(`Function ${class_name}.${func_name} should be static`);
  }
}

export class DslInterpreter {
  // region array functions

  // TODO: better comparison functions
  private matching(value: any, template: any) {
    console.assert(typeof value === typeof template);
    if (typeof value === "string") {
      value = value.toLowerCase();
      template = template.toLowerCase();
      return value.includes(template);
    }
    // primitive types
    else if (typeof value === "number" || typeof value === "boolean") {
      return value === template;
    } else {
      return (
        JSON.stringify(value._getConstructorParams()) ===
        JSON.stringify(template._getConstructorParams())
      );
    }
  }

  private contains(value: any, template: any) {
    console.assert(typeof value === typeof template);
    if (typeof value === "string") {
      value = value.toLowerCase();
      template = template.toLowerCase();
      return value.includes(template);
    }
    // array
    else if (Array.isArray(value)) {
      let contains = false;
      for (let i = 0; i < value.length; i++) {
        // use matching
        if (this.matching(value[i], template)) {
          contains = true;
          break;
        }
      }
      return contains;
    } else {
      return value === template;
    }
  }

  private equals(a: any, b: any) {
    if (a === b) {
      return true;
    } else if (typeof a === "string" && typeof b === "string") {
      return a.toLowerCase() === b.toLowerCase();
    } else {
      return false;
    }
  }

  // for common array functions: matching, between, equals, sort, and access
  private arrayFunctionDescriptors: FuncDescriptor[] = [
    new FuncDescriptor(
      "matching",
      [
        new ParamDescriptor("field", "accessor"),
        new ParamDescriptor("value", "object"),
      ],
      "object[]",
      false
    ),
    new FuncDescriptor(
      "contains",
      [
        new ParamDescriptor("field", "accessor"),
        new ParamDescriptor("value", "object"),
      ],
      "object[]",
      false
    ),
    new FuncDescriptor(
      "between",
      [
        new ParamDescriptor("field", "accessor"),
        new ParamDescriptor("from", "object"),
        new ParamDescriptor("to", "object"),
      ],
      "object[]",
      false
    ),
    new FuncDescriptor(
      "equals",
      [
        new ParamDescriptor("field", "accessor"),
        new ParamDescriptor("value", "object"),
      ],
      "object[]",
      false
    ),
    new FuncDescriptor(
      "sort",
      [
        new ParamDescriptor("field", "accessor"),
        new ParamDescriptor("ascending", "boolean"),
      ],
      "object[]",
      false
    ),
    new FuncDescriptor(
      "index",
      [new ParamDescriptor("index", "int")],
      "object",
      false
    ),
  ];
  // implementations of functions
  private arrayFunctionImplementations: {
    [name: string]: (...args: any[]) => any;
  } = {
    matching: ({
      field,
      value,
      array,
    }: {
      field: any;
      value: any;
      array: any[];
    }) => {
      console.assert(field.type === "accessor");
      const fieldName = field.field;
      return array.filter((v) => this.matching(v[fieldName], value));
    },
    contains: ({
      field,
      value,
      array,
    }: {
      field: any;
      value: any;
      array: any[];
    }) => {
      console.assert(field.type === "accessor");
      const fieldName = field.field;
      return array.filter((v) => this.contains(v[fieldName], value));
    },
    between: ({
      field,
      from,
      to,
      array,
    }: {
      field: any;
      from: any;
      to: any;
      array: any[];
    }) => {
      console.assert(field.type === "accessor");
      const fieldName = field.field;
      return array.filter((v) => {
        let first: boolean;
        let second: boolean;
        let value = v[fieldName];
        let fromIsPrimitive =
          typeof from === "string" ||
          typeof from === "number" ||
          typeof from === "boolean";
        let toIsPrimitive =
          typeof to === "string" ||
          typeof to === "number" ||
          typeof to === "boolean";
        let valueIsPrimitive =
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean";
        if (fromIsPrimitive && valueIsPrimitive) {
          first = value >= from;
        } else if (fromIsPrimitive && !valueIsPrimitive) {
          first = value.constructor.compare(value, from) >= 0;
        } else if (!fromIsPrimitive && valueIsPrimitive) {
          first = from.constructor.compare(value, from) >= 0;
        } else {
          first = from.constructor.compare(value, from) >= 0;
        }
        if (toIsPrimitive && valueIsPrimitive) {
          second = value <= to;
        } else if (toIsPrimitive && !valueIsPrimitive) {
          second = value.constructor.compare(value, to) <= 0;
        } else if (!toIsPrimitive && valueIsPrimitive) {
          second = to.constructor.compare(value, to) <= 0;
        } else {
          second = to.constructor.compare(value, to) <= 0;
        }
        return first && second;
      });
    },
    equals: ({
      field,
      value,
      array,
    }: {
      field: any;
      value: any;
      array: any[];
    }) => {
      console.assert(field.type === "accessor");
      const fieldName = field.field;
      return array.filter((v) => this.equals(v[fieldName], value));
    },
    sort: ({
      field,
      ascending,
      array,
    }: {
      field: any;
      ascending: boolean;
      array: any[];
    }) => {
      console.assert(field.type === "accessor");
      const fieldName = field.field;
      return array.sort((a, b) => {
        if (ascending) {
          if (a[fieldName] < b[fieldName]) {
            return -1;
          } else if (a[fieldName] > b[fieldName]) {
            return 1;
          } else {
            return 0;
          }
        } else {
          if (a[fieldName] < b[fieldName]) {
            return 1;
          } else if (a[fieldName] > b[fieldName]) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    },
    index: ({ index, array }: { index: any; array: any[] }) => {
      console.assert(typeof index === "number");
      if (index < 0) {
        index = array.length + index;
      }
      return array[index];
    },
  };

  // endregion

  resolveSteps: any[] = [];
  resolveStepsEnabled: boolean = false;

  constructor(public classDescriptors: ClassDescriptor<GenieObject>[], public dry_run = false) {}

  /**
   * interpret a DSL expression
   **/
  public interpret(input: string): any {
    const ast = parse(input);
    // console.log(JSON.stringify(ast));
    // ast = {"type":"access","parent":{"type":"access","parent":"Restaurant","access":{"type":"function_call","func_name":"current","parameters":null}},"access":{"type":"function_call","func_name":"book","parameters":[{"parameter":"dateTime","value":{"type":"function_call","func_name":"DateTime","parameters":[{"parameter":"year","value":{"type":"int","value":2020}},{"parameter":"month","value":{"type":"int","value":1}},{"parameter":"day","value":{"type":"int","value":1}},{"parameter":"hour","value":{"type":"int","value":12}},{"parameter":"minute","value":{"type":"int","value":0}}]}}]}}
    return this.resolve(ast);
  }

  public interpretSteps(input: string): any[] {
    const ast = parse(input);
    // console.log(JSON.stringify(ast));
    this.resolveSteps = [];
    this.resolveStepsEnabled = true;
    this.resolve(ast);
    this.resolveStepsEnabled = false;
    return this.resolveSteps;
  }

  /**
   * Generate a description of the current ast
   * @param ast
   */
  public describe(ast: any) {
    switch (ast.type) {
      case "array":
        return {
          type: "array",
          elements: ast.value.map((e) => this.describe(e)),
        };
      case "string":
      case "int":
      case "boolean":
        return ast.value;
      case "object":
        if (ast.value !== undefined) {
          if (ast.objectType == "string") {
            return {
              type: "object",
              objectType: ast.objectType,
              value: ast.value,
            };
          } else {
            return { type: "object", value: ast.value.description() };
          }
        } else {
          console.assert(ast.objectType == "void");
          return { type: "object", value: "undefined" };
        }
    }
  }

  public describeSteps(list: any[]) {
    return list.map((e) => this.describe(e.result));
  }

  /**
   * strip all helper information from an ast node (so that it can be passed to a function)
   * @param ast
   */
  public strip(ast: any) {
    switch (ast.type) {
      case "class":
        return this.classDescriptors.find((c) => c.className === ast.value)
          .classConstructor;
      case "array":
        return ast.value.map((v) => this.strip(v));
      case "accessor":
        return ast;

      // return value for primitive types
      case "string":
      case "int":
      case "boolean":
      case "object":
        return ast.value;
    }
  }

  /**
   * resolve an ast node, make it a concrete value
   * @param ast the ast node to resolve
   * @param env the environment in which to resolve the node
   */
  public resolve(ast: any, env: null | any = null): any {
    let result = null;
    switch (ast.type) {
      case "access":
        result = this.resolveAccess(ast, env);
        break;
      case "index":
        result = this.resolveIndex(ast, env);
        break;
      case "function_call":
        result = this.resolveFunctionCall(ast, env);
        break;
      case "array":
        result = this.resolveArray(ast, env);
        break;

      // don't do anything for primitive types
      case "string":
      case "int":
      case "boolean":
      case "accessor":
        result = ast;
        break;
      default:
        throw new Error("Unsupported AST type: " + ast.type);
    }
    if (this.resolveStepsEnabled) {
      this.resolveSteps.push({ ast: ast, result: result });
    }
    return result;
  }

  /**
   * resolve an access node, make it a concrete value
   * @param ast the ast node to resolve
   * @param env the environment in which to resolve the node
   * @private
   */
  private resolveAccess(ast: any, env: any) {
    console.assert(env == null);
    let parent;
    if (typeof ast.parent === "string") {
      parent = { type: "class", value: ast.parent };
    } else if (ast.parent.type === "object") {
      parent = ast.parent;
    } else {
      parent = this.resolve(ast.parent, null);
    }
    if (typeof ast.access === "string") {
      const isObject = parent.type === "object";
      const className = isObject ? parent.objectType : parent.value;
      const classDescriptor = this.classDescriptors.find(
        (c) => c.className === className
      );
      if (classDescriptor === undefined) {
        if (parent.type == "array") {
          const arrayValue = parent.value.map(
              (v: any) => this.resolveAccess({
                ...ast,
                parent: v
              }, env)
          );
          return {
            type: "array",
            value: arrayValue,
            objectType: arrayValue[0].objectType
          };
        } else {
          throw new ClassMissingError(className);
        }
      }
      const fieldDescriptor = Array.from(classDescriptor.fields).find(
        (f) => f.field === ast.access
      );
      if (fieldDescriptor === undefined) {
        throw new FieldMissingError(className, ast.access);
      }
      // we can only access if the field is static or the parent is an object
      if (!isObject && !fieldDescriptor.isStatic) {
        throw new FieldStaticError(className, ast.access);
      }
      const fieldType = parseType(fieldDescriptor.fieldType);
      let fieldValue;
      if (this.dry_run) {
        if (fieldType.is_array) {
          fieldValue = [null];
        } else {
          fieldValue = null
        }
      } else {
        if (isObject) {
          fieldValue = this.strip(parent)[ast.access];
        } else {
          fieldValue = classDescriptor.classConstructor[ast.access];
        }
      }
      if (fieldType.is_array) {
        // noinspection JSObjectNullOrUndefined
        return {
          type: "array",
          value: fieldValue.map((v) => {
            return {
              type: "object",
              value: v,
              objectType: fieldType.original_type,
            };
          }),
        };
      } else {
        return {
          type: "object",
          value: fieldValue,
          objectType: fieldType.original_type,
        };
      }
    } else {
      return this.resolve(ast.access, parent);
    }
  }

  /**
   * resolve an index node, make it a concrete value
   * @param ast the ast node to resolve
   * @param env the environment in which to resolve the node
   * @private
   */
  private resolveIndex(ast: any, env: any) {
    console.assert(env == null);
    let indexParam;
    if (typeof ast.index === "number") {
      indexParam = { type: "int", value: ast.index };
    } else {
      indexParam = ast.index;
    }
    return this.resolve(
      {
        type: "access",
        parent: ast.parent,
        access: {
          type: "function_call",
          func_name: "index",
          parameters: [{ parameter: "index", value: indexParam }],
        },
      },
      env
    );
  }

  /**
   * resolve an array node, make it a concrete value
   * @param ast the ast node to resolve
   * @param env the environment in which to resolve the node
   * @private
   */
  private resolveArray(ast: any, env: any) {
    console.assert(env == null);
    const values = ast.value.map((v) => this.resolve(v, null));
    // make sure all the elements are objects
    console.assert(values.every((v) => v.type === "object"));
    // make sure all the elements have the same type
    console.assert(values.every((v) => v.objectType === values[0].objectType));
    return {
      type: "array",
      value: values,
    };
  }

  /**
   * resolve a function call node, make it a concrete value
   * @param ast the ast node to resolve
   * @param env the environment in which to resolve the node
   * @private
   */
  private resolveFunctionCall(ast: any, env: any) {
    const parameters =
      ast.parameters !== null
        ? new Map(
            ast.parameters.map((p) => [
              p.parameter,
              this.resolve(p.value, null),
            ])
          )
        : new Map([]);
    // find the function descriptor
    let classDescriptor: ClassDescriptor<GenieObject>;
    let funcDescriptor: FuncDescriptor;
    let isArray = false;
    let isArrayElementFunction = false;
    if (env !== null) {
      switch (env.type) {
        case "class":
          classDescriptor =
              this.classDescriptors.find((c) => c.className === env.value);
          if (classDescriptor === undefined) {
            throw new ClassMissingError(env.value);
          }
          funcDescriptor = Array.from(
            classDescriptor.functions
          ).find((f) => f.func_name === ast.func_name);
          if (funcDescriptor === undefined) {
            throw new FunctionMissingError(env.value, ast.func_name);
          } else if (!funcDescriptor.isStatic) {
            throw new FunctionStaticError(env.value, ast.func_name);
          }
          break;
        case "object":
          classDescriptor = this.classDescriptors.find((c) => c.className === env.objectType);
          if (classDescriptor === undefined) {
            throw new ClassMissingError(env.objectType);
          }
          funcDescriptor = Array.from(
            classDescriptor.functions
          ).find((f) => f.func_name === ast.func_name);
          if (funcDescriptor === undefined) {
            throw new FunctionMissingError(env.objectType, ast.func_name);
          }
          break;
        // deal with array functions (`matching`, `between`, `equals`)
        case "array":
          funcDescriptor = this.arrayFunctionDescriptors.find(
            (f) => f.func_name === ast.func_name
          );
          if (funcDescriptor === undefined) {
            const arrayValue = env.value.map((v) => this.resolveFunctionCall(ast, v));
            return {
                type: "array",
                value: arrayValue,
                objectType: arrayValue[0].objectType
            }
          }
          // if there is any element in the array, replace the descriptor with the correct type
          if (env.value.length > 0) {
            funcDescriptor = JSON.parse(JSON.stringify(funcDescriptor));
            funcDescriptor.returnType = funcDescriptor.returnType.replace(
              "object",
              env.value[0].objectType
            );
          }
          isArray = true;
          break;
      }
    } else {
      // function is class constructor
      const classDescriptor = this.classDescriptors.find(
        (c) => c.className === ast.func_name
      );
      funcDescriptor = Array.from(classDescriptor.functions).find(
        (f) => f.func_name === "constructor"
      );
    }
    // reformat the parameters to match the function signature
    let matchedParameters = {};
    for (const descriptor of funcDescriptor.parameters) {
      const param = parameters.get(descriptor.name);
      if (param != null) {
        matchedParameters[descriptor.name] = this.strip(param);
      }
    }

    if (isArray) {
      matchedParameters["array"] = this.strip(env);
    }

    // function is a class constructor
    if (env === null) {
      const classDescriptor = this.classDescriptors.find(
        (c) => c.className === ast.func_name
      );
      if (this.dry_run) {
        return {
          type: "object",
          value: null,
          objectType: ast.func_name,
        };
      } else {
        return {
          type: "object",
          value: new classDescriptor.classConstructor(matchedParameters),
          objectType: ast.func_name,
        };
      }
    }

    const returnType = parseType(funcDescriptor.returnType);

    const targetImplementation = isArray
      ? this.arrayFunctionImplementations
      : this.strip(env);

    if (isArray) {
      if (ast.func_name != "index") {
        const classDescriptor = this.classDescriptors.find(
          (c) => c.className === env.value[0].objectType
        );
        if (classDescriptor === undefined) {
          throw new ClassMissingError(env.value[0].objectType)
        }
        const fieldDescriptor = Array.from(classDescriptor.fields).find(
            (f) => f.field === matchedParameters["field"].field
        );
        if (fieldDescriptor === undefined) {
          throw new FieldMissingError(env.value[0].objectType, matchedParameters["field"].field)
        }
      }
    }

    // call the function
    if (returnType.is_array) {
      if (this.dry_run) {
        return {
          type: "array",
          value: [{
            type: "object",
            value: null,
            objectType: returnType.original_type,
          }],
        };
      } else {
        return {
          type: "array",
          value: targetImplementation[ast.func_name](matchedParameters).map(
              (v) => {
                return {
                  type: "object",
                  value: v,
                  objectType: returnType.original_type,
                };
              }
          ),
        };
      }
    } else {
      if (this.dry_run) {
        return {
          type: "object",
          value: null,
          objectType: returnType.original_type,
        };
      } else {
        return {
          type: "object",
          value: targetImplementation[ast.func_name](matchedParameters),
          objectType: returnType.original_type,
        };
      }
    }
  }
}

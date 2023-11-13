import "reflect-metadata";
import {
  ClassDescriptor,
  FieldDescriptor,
  FuncDescriptor,
  DataClass,
  ParamDescriptor,
  HelperClass,
  HelperClassGetterSetter, GenieObject,
} from "../dsl-descriptor";
import { Store } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  genieDispatch,
  objects,
  setSharedState,
  setSharedStore,
  sharedState,
  storeReducer,
} from "./store";

export type int = number;
export type float = number;

export const AllGenieObjects: { [key: string]: any } = {};

export type GenieClassModifier = (target: any) => void;
export type GenieFunctionModifier = (
  target: any,
  functionKey: string,
  isStatic: boolean
) => void;
export type GeniePropertyModifier = (
  target: any,
  propertyKey: string,
  isStatic: boolean
) => void;

let genieClassModifier: GenieClassModifier = undefined;
let genieFunctionModifier: GenieFunctionModifier = undefined;
let geniePropertyModifier: GeniePropertyModifier = undefined;

let genieInitialized = false;

export function initGenie({
  initGenieClassModifier,
  initGenieFunctionModifier,
  initGeniePropertyModifier,
}: {
  initGenieClassModifier?: GenieClassModifier;
  initGenieFunctionModifier?: GenieFunctionModifier;
  initGeniePropertyModifier?: GeniePropertyModifier;
} = {}): Store {
  if (initGenieClassModifier) {
    genieClassModifier = initGenieClassModifier;
  }
  if (initGenieFunctionModifier) {
    genieFunctionModifier = initGenieFunctionModifier;
  }
  if (initGeniePropertyModifier) {
    geniePropertyModifier = initGeniePropertyModifier;
  }
  let genieStore = configureStore({ reducer: storeReducer });
  setSharedStore(genieStore);
  // call modifiers for existing classes
  for (let className in AllGenieObjects) {
    const target = AllGenieObjects[className];
    if (genieClassModifier) {
      genieClassModifier(target);
    }
    // for all properties
    for (let propertyDescriptor of target.ClassDescriptor.fields) {
      if (geniePropertyModifier) {
        geniePropertyModifier(
          target,
          propertyDescriptor.field,
          propertyDescriptor.isStatic
        );
      }
    }
    // for all functions
    for (let functionDescriptor of target.ClassDescriptor.functions) {
      if (genieFunctionModifier) {
        genieFunctionModifier(
          target,
          functionDescriptor.func_name,
          functionDescriptor.isStatic
        );
      }
    }
  }
  // call setup for existing classes
  for (let className in AllGenieObjects) {
    const target = AllGenieObjects[className];
    target.setup();
  }
  genieInitialized = true;
  return genieStore;
}

export type LazyType<T> = T;

function getJsonByPath(json: any, path: (string | number)[]): any {
  let current = json;
  for (let pathElement of path) {
    current = current[pathElement];
  }
  return current;
}

function setJsonByPath(json: any, path: (string | number)[], value: any): any {
  if (path.length === 0) {
    return value;
  } else {
    if (Array.isArray(json)) {
        const array = json as any[];
        const index = path[0] as number;
        return [
            ...array.slice(0, index),
            setJsonByPath(array[index], path.slice(1), value),
            ...array.slice(index + 1),
        ];
    } else {
      return {
        ...json,
        [path[0]]: setJsonByPath(json[path[0]], path.slice(1), value),
      };
    }
  }
}

class ObservableArray<T> extends Array<T> {
  private callback: () => void;

  constructor(callback: (array: ObservableArray<T>) => void, ...items: T[]) {
    super(...items);
    this.callback = () => callback(this);
  }

  push(...items: T[]): number {
    const result = super.push(...items);
    this.callback();
    return result;
  }

  pop(): T {
    const result = super.pop();
    this.callback();
    return result;
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const result = super.splice(start, deleteCount, ...items);
    this.callback();
    return result;
  }

  shift(): T {
    const result = super.shift();
    this.callback();
    return result;
  }

  unshift(...items: T[]): number {
    const result = super.unshift(...items);
    this.callback();
    return result;
  }

  set(index: number, item: T): void {
    this[index] = item;
    this.callback();
  }

  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
    return [...super.map(callbackfn, thisArg)];
  }
}

const serializeField =
  (
    generateGetterSetter: (path: (string | number)[]) => HelperClassGetterSetter
  ) =>
  (value: any, path: (string | number)[] = []) => {
    // if field is array
    if (Array.isArray(value)) {
      return value.map((item, index) => {
        return serializeField(generateGetterSetter)(item, path.concat(index));
      });
    } else if (
      value != null &&
      value.constructor.__genieObjectType == "DataClass"
    ) {
      return {
        __genieObjectType: "DataClass",
        __genieObjectClass: value.constructor.name,
        __genieObjectKey: value[value.genieKey],
      };
    } else if (
      value != null &&
      value.constructor.__genieObjectType == "HelperClass"
    ) {
      (value as HelperClass).localStoreGetterSetter =
        generateGetterSetter(path);
      let serializedValue = (value as HelperClass).localStore;
      if (serializedValue == null) {
        throw new Error(
            "HelperClass is not initialized.\n" +
            "Please make sure to use CreateObject() to create HelperClass instance."
        );
      }
      serializedValue["__genieObjectType"] = "HelperClass";
      serializedValue["__genieObjectClass"] = value.constructor.name;

      // console.log(typeof serializedValue["__genieObjectClass"]);
      return serializedValue;
    }
    return value;
  };

const deserializeField =
  (
    generateGetterSetter: (path: (string | number)[]) => HelperClassGetterSetter
  ) =>
  (value: any, path: (string | number)[] = []) => {
    // if field is array
    if (Array.isArray(value)) {
      return new ObservableArray(
        (newArray) => {
          generateGetterSetter(path)[1](
            serializeField(generateGetterSetter)(newArray, path)
          );
        },
        ...value.map((item, index) => {
          return deserializeField(generateGetterSetter)(
            item,
            path.concat(index)
          );
        })
      );
    } else if (value != null && value.__genieObjectType == "DataClass") {
      return objects[value.__genieObjectClass][value.__genieObjectKey];
    } else if (value != null && value.__genieObjectType == "HelperClass") {
      let obj = AllGenieObjects[value.__genieObjectClass] as (typeof HelperClass);
      let deserializedValue = obj.CreateObject(value);
      deserializedValue.localStoreGetterSetter = generateGetterSetter(path);
      return deserializedValue;
    }
    return value;
  };

export function GenieClass(comment: string = "") {
  return function (target: any) {
    // console.debug("GenieClass decorator called on " + target.name);

    target.prototype.comment = comment;
    if (!target.ClassDescriptor) {
      target.ClassDescriptor = new ClassDescriptor(
        target.name,
        target.__class_descriptor_functions,
        target.__class_descriptor_properties,
        target,
        comment
      );
    }

    // if target extends DataClass
    if (target.prototype instanceof DataClass) {
      target._createObject = function (...args: any[]) {
        const obj = new target(...args);

        const generateGetterSetter = function (
          path: (string | number)[]
        ): HelperClassGetterSetter {
          return [
            () => getJsonByPath(sharedState["OBJECT"][target.name][obj[keyField]], path),
            (value) => {
              genieDispatch(() => {
                setSharedState({
                  ...sharedState,
                  ["OBJECT"]: {
                    ...sharedState["OBJECT"],
                    [target.name]: {
                      ...sharedState["OBJECT"][target.name],
                      [obj[keyField]]: setJsonByPath(
                        sharedState["OBJECT"][target.name][obj[keyField]],
                        path,
                        value
                      ),
                    },
                  }
                });
              });
            },
          ];
        };

        // find all fields not starting with _
        let allFields = Object.getOwnPropertyNames(obj).filter((name) => name[0] !== "_");
        // filter out functions
        allFields = allFields.filter((field) => {
          return typeof obj[field] !== "function";
        });
        let keyField = obj.genieKey;
        // check if keyField is in allFields
        if (allFields.indexOf(keyField) === -1) {
          throw new Error(
            "keyField " + keyField + " not found in class " + target.name
          );
        }
        // check if keyField exists
        if (obj[keyField]=== null || obj[keyField]=== undefined) {
          throw new Error(
            "keyField " +
              keyField +
              " not found in object " +
              obj.constructor.name +
              "\n" +
              "Did you have @GenieKey on the key field?\n" +
              "Did set the key field in the constructor?"
          );
        }
        // save data to store
        genieDispatch(() => {
          let objectState = {};
          if (sharedState["OBJECT"][target.name]) {
            objectState = {
              ...sharedState["OBJECT"][target.name],
            };
          }
          // overwrite existing object
          // if (sharedState[target.name][obj[keyField]]) {
          //     throw new Error("object with key " + obj[keyField] + " already exists in store");
          // }
          objectState[obj[keyField]] = {};
          // save all fields
          allFields.forEach((field) => {
            // console.log(field, obj[field])
            objectState[obj[keyField]][field] = serializeField(
              generateGetterSetter
            )(obj[field], [field]);
          });
          setSharedState({
            ...sharedState,
            ["OBJECT"]: {
              ...sharedState["OBJECT"],
              [target.name]: objectState,
            }
          });
        });
        // replace fields with getters and setters
        allFields.forEach((field) => {
          if (field == keyField) {
            return;
          }
          Object.defineProperty(obj, field, {
            get: function () {
              let value = sharedState["OBJECT"][target.name][obj[keyField]][field];
              return deserializeField(generateGetterSetter)(value, [field]);
            },
            set: function (value) {
              genieDispatch(() => {
                setSharedState({
                  ...sharedState,
                  ["OBJECT"]: {
                    ...sharedState["OBJECT"],
                    [target.name]: {
                      ...sharedState["OBJECT"][target.name],
                      [obj[keyField]]: {
                        ...sharedState["OBJECT"][target.name][obj[keyField]],
                        [field]: serializeField(generateGetterSetter)(value, [
                          field,
                        ]),
                      },
                    },
                  },
                });
              });
            },
          });
        });
        if (!objects[target.name]) {
          objects[target.name] = {};
        }
        objects[target.name][obj[keyField]] = obj;
        obj.__getState = function () {
          return {
            "object": sharedState["OBJECT"][target.name][obj[keyField]],
            "class": sharedState["CLASS"][target.name]
          }
        }
        return obj;
      };

      // add a static method to get all objects of this type
      target.GetObject = function (key: {}) {
        return objects[target.name][key[target.prototype.genieKey]];
      };

      target.DeleteObject = function (key: {}) {
        genieDispatch(() => {
        let obj = objects[target.name][key[target.prototype.genieKey]];
        obj.__deleted = true;
        return obj;
        })
      }
    } else if (target.prototype instanceof HelperClass) {
      target._createObject = function (...args: any[]){
        const obj = new target(...args);

        const generateGetterSetter = function (
          path: (string | number)[]
        ): HelperClassGetterSetter {
          return [
            () => 
              genieDispatch(() => {
              if (obj.localStoreGetterSetter != null) {
                obj.localStore = obj.localStoreGetterSetter[0]();
              }
              return getJsonByPath(obj.localStore, path);
              })
            ,
            (value) => {
              genieDispatch(() => {
                if (obj.localStoreGetterSetter != null) {
                  obj.localStore = obj.localStoreGetterSetter[0]();
                }
                setJsonByPath(obj.localStore, path, value);
                if (obj.localStoreGetterSetter != null) {
                  obj.localStoreGetterSetter[1](obj.localStore);
                }
              });
            },
          ];
        };

        // find all fields
        let allFields = Object.getOwnPropertyNames(obj).filter((name) => name[0] !== "_");
        // filter out functions
        allFields = allFields.filter((field) => {
          // console.log(field);
          return typeof obj[field] !== "function" && field !=="localStore" && field !=="localStoreGetterSetter";
        });

        (obj as HelperClass).localStore = {};
        // save all fields
        allFields.forEach((field) => {
          (obj as HelperClass).localStore[field] = serializeField(
            generateGetterSetter
          )(obj[field], [field]);
        });
        // console.log(obj.localStore)

        let targetObj = obj as HelperClass;//??
        // replace fields with getters and setters
        // console.log(allFields);
        allFields.forEach((field) => {
          // get field type
          Object.defineProperty(obj, field, {
            get: function () {
              if (targetObj.localStoreGetterSetter != null) {
                targetObj.localStore = targetObj.localStoreGetterSetter[0]();
              }
              let value = targetObj.localStore[field];
              return deserializeField(generateGetterSetter)(value, [field]);
            },
            set: function (value) {
              let serializedValue = serializeField(generateGetterSetter)(
                value,
                [field]
              );
              if (targetObj.localStoreGetterSetter != null) {
                targetObj.localStore = targetObj.localStoreGetterSetter[0]();
              }
              targetObj.localStore = {
                ...targetObj.localStore,
                [field]: serializedValue,
              };
              if (targetObj.localStoreGetterSetter != null) {
                targetObj.localStoreGetterSetter[1](targetObj.localStore);
              }

            },
          });
        });
        return obj;
      };
    }

    if (target.prototype instanceof DataClass) {
      // append method `current()` to the class
      /**
       * Retrieves all instances of GenieObject in this context
       * @returns {any} the GenieObject
       */
      function All() {
        let allObjects = [];
        for (let key in objects[target.name]) {
          if (objects[target.name][key].__deleted) {
            continue;
          }
          allObjects.push(objects[target.name][key]);
        }
        return allObjects;
      }

      target.All = All;

      // append additional function descriptor to class descriptor
      target.ClassDescriptor.functions.add(
        new FuncDescriptor(
          "All",
          [],
          target.ClassDescriptor.className + "[]",
          true
        )
      );
    }

    if (genieClassModifier) {
      genieClassModifier(target);
    }

    AllGenieObjects[target.name] = target;
    if (genieInitialized) {
      (target as (typeof GenieObject)).setup();
    }
    return target;
  };
}

function classToName(object: any): string {
  if (object.constructor.name === "Object") {
    if (object["type"]) {
      if (object["type"].name !== "Array") {
        throw new Error("non-array type not supported");
      }
      if (object["elementType"]) {
        if (object["elementType"].name) {
          return object["elementType"].name + "[]";
        } else {
          return object["elementType"] + "[]";
        }
      } else {
        throw new Error("array elementType missing");
      }
    }
  } else if (object.constructor.name === "String") {
    return object;
  } else if (object === String) {
    return "string";
  } else if (object === Boolean) {
    return "bool";
  } else if (object.hasOwnProperty("name")) {
    return object.name;
  }
  throw new Error("classToName not implemented for " + object);
}

export function GenieFunction(comment: string = "") {
  return function (target: any, propertyKey: string) {
    if (!target.ClassDescriptor) {
      // console.debug(
      //   "GenieFunction decorator called on " +
      //     target.constructor.name +
      //     "." +
      //     propertyKey
      // );
      const paramTypes = Reflect.getMetadata(
        "design:paramtypes",
        target,
        propertyKey
      );
      const returnType = Reflect.getMetadata(
        "design:returntype",
        target,
        propertyKey
      );
      const isStaticMeta = Reflect.getMetadata(
        "design:is_static",
        target,
        propertyKey
      );
      const destructuringParamTypes = Reflect.getMetadata(
        "design:destructuringparamtypes",
        target,
        propertyKey
      );

      const destructingParamValues = Reflect.getMetadata(
        "design:destructuringparamvalues",
        target,
        propertyKey
      );

      const funcName = propertyKey;

      if (returnType === undefined) {
        throw new Error(
          `Genie functions must have a return type: ${target.constructor.name}.${propertyKey}`
        );
      }
      const returnTypeStr = classToName(returnType);

      let parameters = [];

      if (paramTypes.length > 1) {
        throw new Error(
          "Genie functions can only have one destructuring parameter"
        );
      }
      if (paramTypes.length == 1) {
        // get the parameter names
        if (destructuringParamTypes.length !== 1 || destructingParamValues.length !== 1) {
          throw new Error(
            "deconstructed parameters should be the same number as the number of parameters"
          );
        }
        const paramTypeObj = destructuringParamTypes[0];
        const paramValueObj = destructingParamValues[0];
        parameters = Object.keys(paramTypeObj).map((paramName) => {
          const paramType = classToName(paramTypeObj[paramName].type);
          let paramValue = paramValueObj[paramName];
          if (paramValue === undefined || paramValue === "undefined") {
            paramValue = null;
          }
          const paramOptional = paramTypeObj[paramName].optional;
          return new ParamDescriptor(paramName, paramType, !paramOptional, paramValue);
        });
      }

      const isStatic = isStaticMeta === true;

      const funcDescriptor = new FuncDescriptor(
        funcName,
        parameters,
        returnTypeStr,
        isStatic,
        comment
      );

      const targetClass = isStatic ? target : target.constructor;
      if (!targetClass.__class_descriptor_functions) {
        targetClass.__class_descriptor_functions = [];
      }
      // console.debug(`pushing function descriptor ${funcDescriptor}`);
      targetClass.__class_descriptor_functions.push(funcDescriptor);
      if (genieFunctionModifier) {
        genieFunctionModifier(target, propertyKey, isStatic);
      }
    }
  };
}

export function GenieKey(target: any, propertyKey: string) {
  // console.debug(
  //   "GenieKey decorator called on " +
  //     target.constructor.name +
  //     "." +
  //     propertyKey
  // );
  target.genieKey = propertyKey;
}

export function GenieProperty(comment: string = "") {
  return function (target: any, propertyKey: string) {
    // console.debug(
    //   "GenieProperty decorator called on " +
    //     target.constructor.name +
    //     "." +
    //     propertyKey
    // );
    const typeObj = Reflect.getMetadata("design:type", target, propertyKey);
    const isStaticMeta = Reflect.getMetadata(
      "design:is_static",
      target,
      propertyKey
    );
    const isStatic = isStaticMeta === true;
    const type = classToName(typeObj);

    const targetClass = isStatic ? target : target.constructor;
    if (!targetClass.__class_descriptor_properties) {
      targetClass.__class_descriptor_properties = [];
    }
    const propertyDescriptor = new FieldDescriptor(
      propertyKey,
      type,
      isStatic,
      comment
    );
    // console.debug(`pushing property descriptor: ${propertyDescriptor}`);
    targetClass.__class_descriptor_properties.push(propertyDescriptor);
    if (geniePropertyModifier) {
      geniePropertyModifier(target, propertyKey, isStatic);
    }
  };
}

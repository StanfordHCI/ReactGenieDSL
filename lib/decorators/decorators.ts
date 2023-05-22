import "reflect-metadata";
import {ClassDescriptor, FieldDescriptor, FuncDescriptor, GenieObject, ParamDescriptor} from "../dsl-descriptor";
import {createStore, Store} from "redux";
import {genieDispatch, objects, originalClasses, setSharedStore, sharedState, sharedStore, storeReducer} from "./store";

export type int = number;
export type float = number;

export const AllGenieObjects: { [key: string]: any } = {};

export type GenieClassModifier = (target: any) => void;
export type GenieFunctionModifier = (target: any, propertyKey: string) => void;
export type GeniePropertyModifier = (target: any, propertyKey: string) => void;

let genieClassModifier: GenieClassModifier = undefined;
let genieFunctionModifier: GenieFunctionModifier = undefined;
let geniePropertyModifier: GeniePropertyModifier = undefined;

let genieCalledBeforeInit = false;

export function initGenie({genieClassModifier, genieFunctionModifier, geniePropertyModifier}: {
    genieClassModifier?: GenieClassModifier,
    genieFunctionModifier?: GenieFunctionModifier,
    geniePropertyModifier?: GeniePropertyModifier
} = {}) {
    if (genieCalledBeforeInit) {
        throw new Error("initGenie must be called before any Genie decorators");
    }
    if (genieClassModifier) {
        this.genieClassModifier = genieClassModifier;
    }
    if (genieFunctionModifier) {
        this.genieFunctionModifier = genieFunctionModifier;
    }
    if (geniePropertyModifier) {
        this.geniePropertyModifier = geniePropertyModifier;
    }

    setSharedStore(createStore(storeReducer));
}

interface ClassWithDescriptor<T extends GenieObject> {
  ClassDescriptor: ClassDescriptor<T>
}

export function GenieClass(comment: string) {
    return function (target: any) {
        genieCalledBeforeInit = true;
        console.log("GenieClass decorator called on " + target.name);

        target.prototype.comment = comment;
        if (!target.ClassDescriptor) {
            target.ClassDescriptor = new ClassDescriptor(target.name, target.__class_descriptor_functions, target.__class_descriptor_properties, target);
        }

        // replace original constructor
        const original = target;

        originalClasses[target.name] = original;
        target._createObject = function (...args: any[]) {
            const obj = new original(...args);
            // find all fields
            let allFields = Object.getOwnPropertyNames(obj);
            // filter out functions
            allFields = allFields.filter((field) => {
                return typeof obj[field] !== "function";
            });
            let keyField = obj.genieKey;
            // check if keyField is in allFields
            if (allFields.indexOf(keyField) === -1) {
                throw new Error("keyField " + keyField + " not found in class " + target.name);
            }
            // check if keyField exists
            if (!obj[keyField]) {
                throw new Error("keyField " + keyField + " not found in object " + obj);
            }
            // save data to store
            genieDispatch(() => {
                if (!sharedState[target.name]) {
                    sharedState[target.name] = {};
                }
                if (sharedState[target.name][obj[keyField]]) {
                    throw new Error("object with key " + obj[keyField] + " already exists in store");
                }
                sharedState[target.name][obj[keyField]] = {};
                // save all fields
                allFields.forEach((field) => {
                    sharedState[target.name][obj[keyField]][field] = obj[field];
                });
            });
            // replace fields with getters and setters
            allFields.forEach((field) => {
                if (field == keyField) {
                    return;
                }
                Object.defineProperty(obj, field, {
                    get: function () {
                        return sharedState[target.name][obj[keyField]][field];
                    },
                    set: function (value) {
                        genieDispatch(() => {
                            sharedState[target.name][obj[keyField]][field] = value;
                        });
                    }
                });
            });
            if (!objects[target.name]) {
                objects[target.name] = {};
            }
            objects[target.name][obj[keyField]] = obj;
            return obj;
        }
        // const newConstructor = newTarget.prototype.constructor;
        // newTarget.prototype = original.prototype;
        // newTarget.prototype.constructor = newConstructor;
        // newTarget.prototype.constructor = newTarget;
        // // copy over all static methods
        // Object.getOwnPropertyNames(original).forEach((key) => {
        //     // skip read-only properties
        //     if (!(key === "length" || key === "prototype" || key === "name" || key === "constructor")) {
        //         newTarget[key] = original[key];
        //     }
        // });

        // add a static method to get all objects of this type
        target.GetObject = function (key: {}) {
            return objects[target.name][key[target.prototype.genieKey]];
        }

        if (genieClassModifier) {
            genieClassModifier(target);
        }

        AllGenieObjects[target.name] = target;

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
        return "bool"
    } else if (object.hasOwnProperty("name")) {
        return object.name;
    }
    throw new Error("classToName not implemented for " + object);
}

export function GenieFunction(comment: string = "") {
    return function (target: any, propertyKey: string) {
        genieCalledBeforeInit = true;
        if (!target.ClassDescriptor) {
            console.log("GenieFunction decorator called on " + target.constructor.name + "." + propertyKey);
            const paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
            const returnType = Reflect.getMetadata("design:returntype", target, propertyKey);
            const isStaticMeta = Reflect.getMetadata("design:is_static", target, propertyKey);
            const destructuringParamTypes = Reflect.getMetadata("design:destructuringparamtypes", target, propertyKey);

            const funcName = propertyKey;


            if (returnType === undefined) {
                throw new Error(`Genie functions must have a return type: ${target.constructor.name}.${propertyKey}`);
            }
            const returnTypeStr = classToName(returnType);

            let parameters = [];

            if (paramTypes.length > 1) {
                throw new Error("Genie functions can only have one destructuring parameter");
            }
            if (paramTypes.length == 1) {
                // get the parameter names
                if (destructuringParamTypes.length !== 1) {
                    throw new Error("deconstructed parameters should be the same number as the number of parameters");
                }
                const paramTypeObj = destructuringParamTypes[0]
                parameters = Object.keys(paramTypeObj).map((paramName) => {
                    const paramType = classToName(paramTypeObj[paramName]);
                    return new ParamDescriptor(paramName, paramType);
                });
            }

            const isStatic = isStaticMeta === true;

            const funcDescriptor = new FuncDescriptor(funcName, parameters, returnTypeStr, isStatic, comment);

            const targetClass = isStatic ? target : target.constructor;
            if (!targetClass.__class_descriptor_functions) {
                targetClass.__class_descriptor_functions = [];
            }
            console.log(`pushing function descriptor ${funcDescriptor}`);
            targetClass.__class_descriptor_functions.push(funcDescriptor);
            if (genieFunctionModifier) {
                genieFunctionModifier(target, propertyKey);
            }
        }
    };

}

export function GenieKey (target: any, propertyKey: string) {
    console.log("GenieKey decorator called on " + target.constructor.name + "." + propertyKey);
    target.genieKey = propertyKey;
}

export function GenieProperty(comment: string = "") {
    return function (target: any, propertyKey: string) {
        genieCalledBeforeInit = true;
        console.log("GenieProperty decorator called on " + target.constructor.name + "." + propertyKey);
        const typeObj = Reflect.getMetadata("design:type", target, propertyKey);
        const isStaticMeta = Reflect.getMetadata("design:is_static", target, propertyKey);
        const isStatic = isStaticMeta === true;
        const type = classToName(typeObj);

        const targetClass = isStatic ? target : target.constructor;
        if (!targetClass.__class_descriptor_properties) {
            targetClass.__class_descriptor_properties = [];
        }
        const propertyDescriptor = new FieldDescriptor(propertyKey, type, isStatic, comment)
        console.log(`pushing property descriptor: ${propertyDescriptor}`);
        targetClass.__class_descriptor_properties.push(propertyDescriptor);
        if (geniePropertyModifier) {
            geniePropertyModifier(target, propertyKey);
        }
    };
}


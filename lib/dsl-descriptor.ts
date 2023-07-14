let constructorInCreateObject = false;

export class GenieObject {
  static __genieObjectType: string;
  constructor({}) {
    if (!constructorInCreateObject) {
      console.error(
        "Constructor not called in CreateObject\nAll GenieObject should be created using CreateObject"
      );
    }
  }

  // placeholder, should be replaced by GenieClass decorator
  static _createObject<T extends typeof GenieObject>(
    this: T,
    ...args: any[]
  ): InstanceType<T> {
    throw new Error(
      "Not implemented. Did you forget to decorate the class with @GenieClass?"
    );
  }

  static CreateObject<T extends typeof GenieObject>(
    this: T,
    ...args: any[]
  ): InstanceType<T> {
    constructorInCreateObject = true;
    let returnValue = this._createObject(...args);
    constructorInCreateObject = false;
    return returnValue;
  }

  // placeholder, other code that should run after initGenie
  static setup() {}
}

/**
 * DataClass are objects that controls the interactions.
 *
 * DataClass will be automatically indexed by ReactGenie.
 */
export class DataClass extends GenieObject {
  static genieKey: string;
  static __genieObjectType: string = "DataClass";

  constructor({}) {
    super({});
  }

  // noinspection JSUnusedGlobalSymbols
  _getConstructorParams(): any {
    const name = this.constructor.prototype.genieKey;
    return {
      [name]: this[name],
    };
  }

  // placeholder, should be replaced by GenieClass decorator
  static GetObject<T extends typeof DataClass>(
    this: T,
    ...args: any[]
  ): InstanceType<T> {
    throw new Error(
      "Not implemented. Did you forget to decorate the class with @GenieClass?"
    );
  }

  static DeleteObject<T extends typeof DataClass>(
    this: T,
    ...args: any[]
  ): InstanceType<T> {
    throw new Error(
      "Not implemented. Did you forget to decorate the class with @GenieClass?"
    );
  }

  description(): {} {
    return this;
  }

  static ClassDescriptor: ClassDescriptor<DataClass>;
}

export type HelperClassGetter = () => {};
export type HelperClassSetter = (value: {}) => void;
export type HelperClassGetterSetter = [HelperClassGetter, HelperClassSetter];

/**
 * Helper class are for storing complex data types in DataClass.
 */
export class HelperClass extends GenieObject {
  localStore: {} = null;
  localStoreGetterSetter: HelperClassGetterSetter = null;
  static __genieObjectType: string = "HelperClass";

  constructor(value: { __genieObjectType: {} } | {}) {
    super(value);
    if (value && value.hasOwnProperty("__genieObjectType")) {
      this.localStore = value;
    }
  }
}

export class ParamDescriptor {
  // noinspection JSUnusedGlobalSymbols
  constructor(
    public name: string,
    public type: string,
    public required: boolean = true,
    public defaultValue?: any
  ) {}
  description(): string {
    return (
      `${this.name}: ${this.type}` +
      (this.defaultValue ? ` = ${this.defaultValue}` : "")
    );
  }
}

export class FuncDescriptor {
  constructor(
    public func_name: string,
    public parameters: ParamDescriptor[],
    public returnType: string,
    public isStatic: boolean = false,
    public comment: string = ""
  ) {}
  description(): string {
    return (
      (this.comment !== "" ? `// ${this.comment}\n\t` : "") +
      (this.isStatic ? `static ` : "") +
      `${this.returnType} ${this.func_name}(${this.parameters
        .map((p) => p.description())
        .join(", ")});`
    );
  }

  isSame(another: FuncDescriptor) {
    return (
      this.func_name === another.func_name &&
      this.returnType === another.returnType &&
      this.isStatic === another.isStatic &&
      this.parameters.length === another.parameters.length &&
      this.parameters.every(
        (p, i) =>
          p.name === another.parameters[i].name &&
          p.type === another.parameters[i].type
      )
    );
  }
}

export class FieldDescriptor {
  constructor(
    public field: string,
    public fieldType: string,
    public isStatic: boolean = false,
    public comment: string = ""
  ) {}

  description(): string {
    return (
      (this.comment !== "" ? `// ${this.comment}\n\t` : "") +
      (this.isStatic ? `static ` : "") +
      `${this.fieldType} ${this.field};`
    );
  }

  isSame(another: FieldDescriptor) {
    return (
      this.field === another.field &&
      this.fieldType === another.fieldType &&
      this.isStatic === another.isStatic
    );
  }
}

export class ClassDescriptor<T extends GenieObject> {
  public functions: Set<FuncDescriptor>;
  public fields: Set<FieldDescriptor>;

  constructor(
    public className: string,
    functions: FuncDescriptor[],
    fields: FieldDescriptor[],
    public classConstructor: { new (...any): T }
  ) {
    this.functions = new Set(functions);
    this.fields = new Set(fields);
  }

  description(): string {
    return (
      `class ${this.className} {\n` +
      Array.from(this.fields)
        .map((f) => "\t" + f.description())
        .join("\n") +
      "\n" +
      Array.from(this.functions)
        .map((f) => "\t" + f.description())
        .join("\n") +
      "\n" +
      `}`
    );
  }
}

export class GenieObject {
  private readonly _initParams: any;
  constructor(initParams: any) {
    this._initParams = initParams;
  }

  _getConstructorParams(): any {
    return this._initParams;
  }

  description(): {} {
    return this;
  }
}

export class ParamDescriptor {
  constructor(public name: string, public type: string, public required: boolean = true, public defaultValue?: any) {
  }
  description(): string {
    return `${this.name}: ${(this.type)}` + (this.defaultValue ? ` = ${this.defaultValue}` : "");
  }
}

export class FuncDescriptor {
  constructor(public func_name: string, public parameters: ParamDescriptor[], public returnType: string, public isStatic: boolean = false, public comment: string = "") {
  }
  description(): string {
    return (this.comment !== "" ? `// ${this.comment}\n\t` : "") +
      (this.isStatic? `static ` : "") +
      `${this.returnType} ${this.func_name}(${this.parameters.map(p => p.description()).join(", ")});`;
  }
}

export class FieldDescriptor {
  constructor(public field: string, public fieldType: string, public isStatic: boolean = false, public comment: string = "") {
  }

  description(): string {
    return (this.comment !== "" ? `// ${this.comment}\n\t` : "") +
      (this.isStatic? `static ` : "") +
      `${this.fieldType} ${this.field};`;
  }
}

export class ClassDescriptor<T extends GenieObject> {
  constructor(
    public className: string,
    public functions: FuncDescriptor[],
    public fields: FieldDescriptor[],
    public classConstructor: { new(...any): T }
  ) {
  }

  description(): string {
    return `class ${this.className} {\n` +
      this.fields.map(f => "\t" + f.description()).join("\n") + "\n" +
      this.functions.map(f => "\t" + f.description()).join("\n") + "\n" +
      `}`;
  }
}
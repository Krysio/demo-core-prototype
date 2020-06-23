import BufferWrapper from "@/libs/BufferWrapper";

type BaseOptions = {
    override?: boolean
};
const EmptyOptions = {};
const EmptyBuffer = BufferWrapper.alloc(0) as BufferWrapper;

export abstract class Base {
    protected originalPrototype = typeof Base;
    protected abstract value: any = null;
    protected $cursorStart: number = -1;
    protected $cursorEnd: number = -1;
    protected parent: BaseStructure | null = null;
    protected invalid = false;
    protected name: string | null = null;
    protected options: BaseOptions = {};
    protected buffer: BufferWrapper;

    abstract fromBuffer(buffer: BufferWrapper): this;
    abstract toBuffer(): BufferWrapper;

    constructor() {
        this.originalPrototype = Object.getPrototypeOf(this);
    }

    init(): void {};

    get(fieldKey: string): Base {
        throw new Error();
    }
    set(fieldKey: string, value: number | Base | BufferWrapper): this {
        throw new Error();
    }

    getValue(arg1?: any) {
        return this.value;
    }
    setValue(
        newValue: any,
        arg2?: any
    ) {
        this.value = newValue;
        return this;
    }

    getParent() {
        return this.parent;
    }
    setParent(ref: BaseStructure) {
        this.parent = ref;
        return this;
    }

    getName() {
        return this.name;
    }
    setName(value: string) {
        this.name = value;
        return this;
    }

    isValid() { return !this.invalid; }
    setInvalid(value: boolean) {
        this.invalid = value;
    }

    setOptions(
        value: BaseOptions
    ) {
        Object.assign(this.options, value);
        return this;
    }

    *[Symbol.iterator]() {
        yield this as Base;
    }

    [Symbol.for('nodejs.util.inspect.custom')]() { return this.inspect(); }
    inspect() {
        return `${this['__proto__'].constructor.name} [${this.value}]<${this.$cursorEnd},${this.$cursorEnd}>`;
    }
}

export abstract class BaseStructure extends Base {
    protected structure = {} as { [key: string]: Base };
    protected abstract schema = {} as { [key: number]: Base };
    protected orignalSchema: BaseStructure["schema"];
    protected value = null;

    constructor() {
        super();
        //@ts-ignore
        this.orignalSchema = this.schema;
    }

    init() {
        for (let key in this.schema) {
            const constructor = this.schema[ key ];
            //@ts-ignore
            const field = new constructor();

            this.set(key, field);
        }
    }

    public get(
        fieldKey: string
    ): Base {
        const value = this.structure[fieldKey];

        if (value === undefined) {
            const parent = this.getParent();

            if (parent !== null) {
                return parent.get(fieldKey);
            }

            return undefined;
        }

        return value;
    }

    //@ts-ignore
    public set(
        key: string,
        value: Base,
        special = false
    ) {
        const field = this.get(key);

        if (!this.schema[ key ]
            || !(value instanceof Object.getPrototypeOf(this.schema[ key ]))
        ) {
            debugger;
            throw new Error();
        }
        value.setName(key);
        if (special === false) {
            value.setParent(this);
        }
        this.structure[ key ] = value;

        return this;
    }

    //@ts-ignore
    public getValue(
        key: string
    ) {
        const field = this.get(key);

        if (field !== undefined) {
            return field.getValue();
        }

        return null;
    }

    //@ts-ignore
    public setValue(
        key: string,
        value: any
    ): this {
        const field = this.get(key);

        if (field !== undefined) {
            field.setValue(value);
        }

        return this;
    }

    isValid() {
        let result = 1;

        for (let key in this.structure) {
            const field = this.structure[ key ];

            result &= field.isValid() ? 1 : 0;
        }

        return result ? true : false;
    }

    fromBuffer(
        buffer: BufferWrapper
    ) {
        this.buffer = buffer;
        this.$cursorStart = this.buffer.cursor;

        for (let key in this.schema) {
            const constructor = this.schema[key];

            if (constructor instanceof Base) {
                if (!!this.options.override === false) {
                    //@ts-ignore
                    constructor.create(this.buffer, key, this).setName(key);
                } else {
                    //@ts-ignore
                    constructor.create(this.buffer, key, this.getParent()).setName(key);
                }
            } else if (typeof constructor === 'object') {
                //@ts-ignore
                const instance = BaseStructure.create(this.buffer, key, this).setName(key);

                Object.assign(instance, { shema: constructor });
                instance.readBuffer();
            }
        }

        this.$cursorEnd = this.buffer.cursor;
        return this;
    }
    toBuffer() {
        const bufferList = [] as Buffer[];

        for (let key in this.structure) {
            const field = this.structure[ key ];

            bufferList.push(
                field.toBuffer()
            );
        }

        return BufferWrapper.concat(bufferList);
    }

    *[Symbol.iterator]() {
        for (let key in this.structure) {
            yield this.structure[ key ];
        }
    }
}

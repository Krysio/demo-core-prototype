import BufferWrapper from "@/libs/BufferWrapper";

type BaseOptions = {
    override?: boolean
};
const EmptyOptions = {};
const EmptyBuffer = BufferWrapper.alloc(0) as BufferWrapper;

export abstract class Base {
    protected abstract value: any = null;
    protected $cursorStart: number = -1;
    protected $cursorEnd: number = -1;
    protected parent: BaseStructure | null = null;
    protected invalid = false;
    protected name: string | null = null;
    protected options: BaseOptions = {};

    constructor(
        protected buffer: BufferWrapper
    ) { }
    abstract readBuffer(): this;
    abstract toBuffer(): Buffer;

    get(fieldKey: string): Base {
        throw new Error();
    }
    set(fieldKey: string, value: number | Base | BufferWrapper): this {
        throw new Error();
    }

    getValue() {
        return this.value;
    }
    setValue(
        newValue: any
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

    static create(
        buffer: BufferWrapper = EmptyBuffer,
        name: string = '',
        parent: BaseStructure = null,
        options: BaseOptions = EmptyOptions
    ) {
        //@ts-ignore
        const instance: Base = new this(buffer);

        instance.setName(name);
        instance.setOptions(options);
        if (parent !== null) {
            instance.setParent(parent);
            if (!!instance.options.override === false) {
                parent.setOrAddField(instance);
            }
        }
        // możliwe nadpisanie klasy przez pole 'type'
        return instance.readBuffer();
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
    protected structureMap = {} as { [key: string]: Base };
    protected structureList = [] as Base[];
    protected abstract schema = {} as { [key: number]: Base };
    protected value = null;

    get(
        fieldKey: string
    ): Base {
        const value = this.structureMap[fieldKey];

        if (value === undefined) {
            const parent = this.getParent();

            if (parent !== null) {
                return parent.get(fieldKey);
            }

            return undefined;
        }

        return value;
    }

    set(
        fieldKey: string,
        newValue: any
    ): this {
        const field = this.get(fieldKey);

        if (field !== undefined) {
            /**
             * Wstawiając podstrukture, pole zostanie zamienione
             */
            if (newValue instanceof Base) {
                if (!(newValue instanceof Object.getPrototypeOf(field).constructor)) {
                    throw new Error();
                }
                newValue.setName(fieldKey);
                this.setOrAddField(newValue, fieldKey);
            } else {
                field.setValue(newValue);
            }
        }

        return this;
    }

    isValid() {
        let result = 1;

        for (let filed of this.structureList) {
            result &= filed.isValid() ? 1 : 0;
        }

        return result ? true : false;
    }

    readBuffer() {
        this.$cursorStart = this.buffer.cursor;

        for (let key in this.schema) {
            const constructor = this.schema[key];

            if (typeof constructor !== 'string') {
                if (!!this.options.override === false) {
                    //@ts-ignore
                    constructor.create(this.buffer, key, this).setName(key);
                } else {
                    //@ts-ignore
                    constructor.create(this.buffer, key, this.getParent()).setName(key);
                }
            }
        }

        this.$cursorEnd = this.buffer.cursor;
        return this;
    }
    toBuffer() {
        const bufferList = [] as Buffer[];

        for (let item of this.structureList) {
            bufferList.push(
                item.toBuffer()
            );
        }

        return BufferWrapper.concat(bufferList);
    }


    setOrAddField(
        instance: Base,
        name = instance.getName()
    ) {
        const oldValue = this.structureMap[name];

        if (oldValue !== undefined) {
            this.structureList.splice(
                this.structureList.indexOf(oldValue),
                1,
                instance
            );
        } else {
            this.structureList.push(instance);
        }
        this.structureMap[name] = instance;
    }

    *[Symbol.iterator]() {
        for (let key in this.structureMap) {
            yield this.structureMap[key];
        }
    }
}

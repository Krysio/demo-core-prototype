import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "./Base";

/******************************/

export function structure<
    S extends { [Key in keyof S]: S[Key] }
>(
    schema: S
) {
return class Structure extends Base<S> {
    static schema = schema;
    protected value = null;
    protected structure = {} as { [Key in keyof S]: InstanceType<S[Key]> };
    protected $prototypeStructure = Structure.prototype;

    init() {
        this.initFields();
        return this;
    }
    initFields() {
        for (let key in schema) {
            const constructor = schema[key];
            //@ts-ignore
            const field = new constructor();

            field.init();
            this.set(key, field);
        }
    }

    //@ts-ignore redefine
    public getValue<
        K extends Extract<keyof S, string>,
        V extends S[K] extends new (...args: any) => Base<infer R> ? R : any
    >(
        key: K
    ): V;
    //@ts-ignore redefine
    public getValue<
        T extends new () => any,
        V extends T extends new (...args: any) => Base<infer R> ? R : any
    >(
        key: string,
        type: T
    ): V;

    //@ts-ignore redefine
    public getValue(key) {
        //@ts-ignore
        return this.get(key).getValue();
    }

    //@ts-ignore redefine
    setValue<
        K extends Extract<keyof S, string>,
        V extends S[K] extends new (...args: any) => Base<infer R> ? R : any
    >(
        key: K,
        value: V
    ) {
        //@ts-ignore
        this.get(key).setValue(value);
        return this;
    }

    public has<
        K extends Extract<keyof S, string>
    >(
        key: K
    ) {
        return key in this.structure;
    }

    //@ts-ignore redefine
    public get<
        K extends Extract<keyof S, string>
    >(
        key: K
    ): InstanceType<S[K]>;
    //@ts-ignore redefine
    get<Type extends new () => any>(key: string, type: Type): InstanceType<Type>;

    //@ts-ignore redefine
    public get(key) {
        return this.structure[key];
    }

    //@ts-ignore redefine
    public set<
        K extends Extract<keyof S, string>
    >(
        key: K,
        value: InstanceType<S[K]>
    ) {
        this.structure[key] = value;
        return this;
    }

    toBuffer() {
        const arrayOfBuff = [] as BufferWrapper[];

        for (let key in this.structure) {
            const field = this.get(key) as Base<unknown>;

            try {
                arrayOfBuff.push(field.toBuffer());
            } catch (error) {
                console.log(`Field ${key} can't to be convert to buffer`, field);
                throw error;
            }
        }
        return BufferWrapper.concat(arrayOfBuff);
    }

    fromBuffer(buffer: BufferWrapper) {
        this.$buffer = buffer;
        this.$cursor = buffer.cursor;

        for (let key in this.structure) {
            const field = this.get(key) as Base<unknown>;

            field.fromBuffer(buffer);
        }

        return this;
    }

    fromStructure(
        structure: any
    ) {
        for (let key in this.structure) {
            const field = this.get(key) as any;

            field.fromStructure((structure as any).get(key));
        }
        return this;
    }

    getKeys() {
        return Object.keys(this.structure);
    }

    isValid() {
        for (let key in this.structure) {
            const field = this.get(key) as Base<unknown>;

            if (!field.isValid()) {
                return false;
            }
        }
        return true;
    }
}
}
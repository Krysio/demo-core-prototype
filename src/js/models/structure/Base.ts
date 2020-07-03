import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export abstract class Base<T> {
    protected value: T;
    protected parent: Base<{}> = null;
    protected $prototype = Object.getPrototypeOf(this);

    public setValue(value: T) {
        this.value = value;
        return this;
    }
    public getValue() {
        return this.value;
    }

    public get(): never { throw new Error() };
    public set(): never { throw new Error };

    public fromBuffer(buffer: BufferWrapper): this { throw new Error() };
    public toBuffer(): BufferWrapper { throw new Error };
    public init() {return this;}

    public getParent() {
        return this.parent;
    }
    public setParent(value: Base<unknown>) {
        this.parent = value;
        return this;
    }

    public isValid() {
        return true;
    }
}

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
                this.set(key, new constructor())
            }
        }

        //@ts-ignore redefine
        getValue<
            K extends Extract<keyof S, string>,
            V extends S[K] extends new (...args: any) => Base<infer R> ? R : any
        >(
            key: K
        ) {
            //@ts-ignore
            return this.get(key).getValue() as V;
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
        ): InstanceType<S[K]> {
            return this.structure[key];
        }
        //@ts-ignore redefine
        public set<
            K extends Extract<keyof S, string>
        >(
            key: K,
            value: S[K]
        ) {
            this.structure[key] = value;
            return this;
        }

        toBuffer() {
            const arrayOfBuff = [] as BufferWrapper[];

            for (let key in this.structure) {
                const field = this.get(key) as Base<unknown>;
                arrayOfBuff.push(field.toBuffer());
            }
            return BufferWrapper.concat(arrayOfBuff);
        }

        fromBuffer(buffer: BufferWrapper) {
            const arrayOfBuff = [] as BufferWrapper[];

            for (let key in this.structure) {
                const field = this.get(key) as Base<unknown>;

                field.fromBuffer(buffer);
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

/******************************/

import { Uleb128 } from "./Uleb128";

type ExtractValueType<T> = T extends new (...args: any) => Base<infer R> ? R : any;
export function typedStructure<
    S extends { [Key in keyof S]: S[Key] } & {
        "type": {
            [KeyType in Extract<keyof S["type"], number>]: S["type"][KeyType]
        }
    }
>(schema: S) {
    type Keys = Exclude<keyof S, 'type'>;

    return class TypedStructure<
        //@ts-ignore
        T extends keyof S['type'] = keyof S['type']
    > extends structure(schema) {
        static types: keyof S['type'];
        //@ts-ignore
        protected substructure = null as InstanceType<S["type"][T]>;

        fromBuffer(buffer: BufferWrapper) {
            const arrayOfBuff = [] as BufferWrapper[];

            let keys = Object.keys(this.structure);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[ i ];

                if (key === 'type') {
                    const type = buffer.readUleb128() as any;

                    this.setValue('type', type);
                    keys = Object.keys(this.structure);
                } else {
                    const field = this.get(key as any);

                    field.fromBuffer(buffer);
                }
            }

            return this;
        }

        //#region init

        isType<
            Type extends Extract<keyof S['type'], number>
        >(
            type: Type
        ): this is InstanceType<
                //@ts-ignore
                S['type'][Type]
            > & this
        {
            if (this.get('type').getValue() === type) {
                return true;
            }
            return false;
        }

        asType<
            Type extends Extract<keyof S['type'], number>
        >() {
            return this as InstanceType<
                //@ts-ignore
                S['type'][Type]
            > & this;
        }

        init(): this;
        init<
            Type extends keyof S['type']
        >(): InstanceType<
                //@ts-ignore
                S['type'][Type]
            > & this;
        init() {
            this.initFields();
            return this;
        }

        initFields() {
            const previousStructure = { ...this.structure };

            //@ts-ignore
            this.structure = {};

            for (let key in schema) {
                const constructor = schema[ key ];
                let instance: typeof schema[Keys];

                if (key === 'type') {
                    if (previousStructure[ key ]) {
                        instance = previousStructure[ key ];
                    } else {
                        //@ts-ignore
                        instance = new Uleb128();
                    }
                    this.set(key, instance);
                    if (this.substructure !== null) {
                        //@ts-ignore
                        for (let fieldKey of this.substructure.getKeys()) {
                            this.set(
                                fieldKey,
                                //@ts-ignore
                                this.substructure.get(fieldKey)
                            );
                        }
                    }
                    continue;
                } else {
                    if (previousStructure[ key ]) {
                        instance = previousStructure[ key ];
                    } else {
                        //@ts-ignore
                        instance = new constructor();
                    }
                }

                this.set(key, instance);
            }
        }

        //#endregion
        //#region get

        public has<Key extends Extract<keyof S, string>>(key: Key): boolean;
        public has<Key extends keyof S['type'][T][Exclude<keyof S['type'][T], "prototype">]>(key: Key): boolean;
        public has(key: string): boolean;

        public has(
            key
        ) {
            return key in this.structure;
        }

        public get(
            key: 'type'
        ): Uleb128;

        public get<
            Key extends Exclude<keyof S, 'type'>
        >(
            key: Key
        ): InstanceType<S[Key]>;

        public get<
            Key extends keyof S['type'][T][Exclude<keyof S['type'][T], "prototype">]
        >(
            key: Key
        ): InstanceType<S['type'][T][Exclude<keyof S['type'][T], "prototype">][Key]>;

        // manual assign type
        public get<Type extends new () => any>(
            key: string,
            type: Type
        ): InstanceType<Type>;

        public get(key) {
            if (this.structure.hasOwnProperty(key)) {
                //@ts-ignore
                return this.structure[key];
            }
            if (this.substructure
                && this.substructure.hasOwnProperty(key)
            ) {
                //@ts-ignore
                return this.substructure.get(key);
            }

            throw new Error(`TODO ${key} ${this.getValue('type')}`);
        }

        //#endregion
        //#region set

        //@ts-ignore redefine
        public set<
            SubClass extends S['type'][T],
            SubStructure extends SubClass[Exclude<keyof SubClass, "prototype">],
            Key extends keyof S | keyof SubStructure,
            SubType extends
                Key extends 'type' ? typeof Uleb128 :
                Key extends keyof SubStructure ? SubStructure[Key] :
                Key extends Keys ? S[Key] :
                never
        >(
            key: Key,
            value: InstanceType<
                //@ts-ignore
                SubType
            >
        ): TypedStructure<T>
        {
            this.structure[ key ] = value;
            //@ts-ignore
            value.setParent(this);

            return this;
        }

        //#endregion
        //#region setValue

        //@ts-ignore redefine
        public setValue<
            V extends Extract<keyof S['type'], number>
        >(
            key: 'type',
            value: V
        ):
            InstanceType<
                //@ts-ignore
                S['type'][V]
            > & this;

        //@ts-ignore redefine
        public setValue<
            K extends Exclude<keyof S, 'type'>,
            V extends ExtractValueType<S[K]>
        >(
            key: K,
            value: V
        ): this;

        //@ts-ignore redefine
        public setValue<
            K extends keyof S['type'][T][Exclude<keyof S['type'][T], "prototype">],
            V extends ExtractValueType<S['type'][T][Exclude<keyof S['type'][T], "prototype">][K]>
        >(
            key: K,
            value: V
        ): this;

        //@ts-ignore redefine
        public setValue(
            key,
            value
        ) {
            if (key === 'type') {
                //@ts-ignore
                this.structure["type"].setValue(value);

                //@ts-ignore
                this.substructure = new schema['type'][ value ]();

                let substructurePrototype;

                if (!schema['type'][ value ]['$prototypeSubstructure']) {
                    substructurePrototype = Object.getPrototypeOf(this.substructure);

                    while (this.substructure['$prototypeStructure'] !== Object.getPrototypeOf(substructurePrototype)) {
                        substructurePrototype = Object.getPrototypeOf(substructurePrototype);
                    }

                    schema['type'][ value ]['$prototypeSubstructure'] = substructurePrototype;
                } else {
                    substructurePrototype = schema['type'][ value ]['$prototypeSubstructure'];
                    Object.setPrototypeOf(substructurePrototype, this.substructure['$prototypeStructure']);
                }

                //@ts-ignore
                this.substructure.setParent(this);
                //@ts-ignore
                this.substructure.init();
                this.initFields();

                //@ts-ignore
                const newPrototype = substructurePrototype;

                Object.setPrototypeOf(newPrototype, this.$prototype);
                Object.setPrototypeOf(this, newPrototype);

                return this;
            }

            //@ts-ignore
            this.get(key).setValue(value);

            return this;
        }

        //#endregion
        //#region getValue

        //@ts-ignore redefine
        public getValue<
            SubClass extends S['type'][T],
            SubStructure extends SubClass[Exclude<keyof SubClass, "prototype">],
            Key extends keyof S | keyof SubStructure,
            SubType extends
                Key extends keyof SubStructure ? SubStructure[Key] :
                Key extends Keys ? S[Key] :
                never,
            ValueType extends
                ExtractValueType<SubType>
        >(
            key: Key
        ) {
            if (this.structure.hasOwnProperty(key)) {
                //@ts-ignore
                return this.structure[key].getValue() as ValueType;
            }
            if (this.substructure
                && this.substructure.hasOwnProperty(key)
            ) {
                //@ts-ignore
                return this.substructure.get(key).getValue() as ValueType;
            }
        }

        //#endregion
    }
}
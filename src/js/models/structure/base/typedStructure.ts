import BufferWrapper from "@/libs/BufferWrapper";
import { Base } from "./Base";
import { structure } from "./structure";
import { Uleb128 } from "../Uleb128";

/******************************/

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
        protected $typedStricturePrototype = TypedStructure.prototype;
        //@ts-ignore
        protected substructure = null as InstanceType<S["type"][T]>;
        protected substructurePrototypes = {} as {[Keys in T]: any};

        fromBuffer(buffer: BufferWrapper) {
            const arrayOfBuff = [] as BufferWrapper[];

            this.$buffer = buffer;
            this.$cursor = buffer.cursor;

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
        >(type: Type) {
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
            function createPrototype(Class){
                const prototype = {};
                for (let field of Object.getOwnPropertyNames(Class.prototype)) {
                    prototype[ field ] = Class.prototype[ field ];
                }
                Object.setPrototypeOf(
                    prototype,
                    Object.getPrototypeOf(Class.prototype)
                );
                return prototype;
            }

            // prototypy
            for (let key in schema['type']) {
                const constructor = schema['type'][ key ];

                //console.log('-START-');
                let cProtoA = createPrototype(constructor);
                let cProtoB = this.substructurePrototypes[ key ] = cProtoA;

                //console.log(cProtoA);
                while (Object.getPrototypeOf(cProtoB).constructor !== Base) {
                    cProtoA = cProtoB;
                    cProtoB = createPrototype(Object.getPrototypeOf(cProtoB).constructor);
                    Object.setPrototypeOf(cProtoA, cProtoB);
                }

                Object.setPrototypeOf(cProtoA, Object.getPrototypeOf(this));
            }

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
                        //@ts-ignore
                        instance.init();
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
                        //@ts-ignore
                        instance.init();
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

                if (!schema['type'][ value ]) {
                    throw new Error(`Invalid type ${ value } in ${ Object.getPrototypeOf(this).constructor.name }`);
                }

                //@ts-ignore
                this.substructure = new schema['type'][ value ]();
                //@ts-ignore
                this.substructure.setParent(this);
                //@ts-ignore
                this.substructure.init();
                this.initFields();

                Object.setPrototypeOf(this, this.substructurePrototypes[ value ]);

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
                never
        >(
            key: Key
        ): ExtractValueType<SubType>;
        //@ts-ignore redefine
        public getValue<Type extends new () => any>(
            key: string,
            type: Type
        ): ExtractValueType<Type>;
        //@ts-ignore redefine
        public getValue(key, type) {
            if (this.structure.hasOwnProperty(key)) {
                //@ts-ignore
                return this.structure[key].getValue();
            }
            if (this.substructure
                && this.substructure.hasOwnProperty(key)
            ) {
                //@ts-ignore
                return this.substructure.get(key).getValue();
            }
        }

        //#endregion

        public fromStructure(structure: any) {
            this.setValue('type', structure.getValue('type'));

            return super.fromStructure(structure);
        }
    }
}
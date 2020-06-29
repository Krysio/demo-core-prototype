import BufferWrapper from "../../../libs/BufferWrapper";
import * as secp256k1 from "../../../services/crypto/ec/secp256k1";

/******************************/

const [privateKey, publicKey] = secp256k1.getKeys();
const buffTxn = `14 10  01 02 03  00 ${publicKey.toString('hex')}  17 33  04 11 22 33 44`.replace(/\s/g, '');

/******************************/


abstract class Base<T> {
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

    getParent() {
        return this.parent;
    }
    setParent(value: Base<unknown>) {
        this.parent = value;
        return this;
    }
}

/******************************/

class Uleb128 extends Base<number> {
    protected value = -1;

    public fromBuffer(buffer: BufferWrapper) {
        this.value = buffer.readUleb128();
        return this;
    }
    public toBuffer() {
        return BufferWrapper.numberToUleb128Buffer(this.value);
    }
    public isValid() {
        return this.value > -1;
    }
}

/******************************/

function structure<
    S extends { [Key in keyof S]: S[Key] }
>(schema: S) {
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
    }
}

/******************************/

const Coord = structure({
    'x': Uleb128,
    'y': Uleb128
});

type ExtractValueType<T> = T extends new (...args: any) => Base<infer R> ? R : any;
function typedStructure<
    S extends { [Key in keyof S]: S[Key] } & {
        "type": {
            [KeyType in Extract<keyof S["type"], number>]: S["type"][KeyType]
        }
    }
>(schema: S) {
    type Keys = Exclude<keyof S, 'type'>;
    type ValueTypes = keyof S['type'];

    return class TypedStructure<
        //@ts-ignore
        T extends keyof S['type'] = 0
    > extends structure(schema) {
        static types: keyof S['type'];
        //@ts-ignore
        protected substructure = null as InstanceType<S["type"][T]>;

        //#region init

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

        //@ts-ignore redefine
        public get<
            SubClass extends S['type'][T],
            SubStructure extends SubClass[Exclude<keyof SubClass, "prototype">],
            Key extends keyof S | keyof SubStructure,
            SubType extends
                Key extends 'type' ? typeof Uleb128 :
                Key extends keyof SubStructure ? SubStructure[Key] :
                Key extends Keys ? S[Key] :
                never
        >(
            key: Key
        ):
            InstanceType<
                //@ts-ignore
                SubType
            >
        {
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
        ): TypedStructure<V>;

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

                // ((obj) => {
                //     const chain = [];
                //     let prot = Object.getPrototypeOf(obj);
    
                //     while (prot !== null) {
                //         chain.push(prot.constructor.name);
                //         prot = Object.getPrototypeOf(prot);
                //     }
    
                //     console.log(chain);
                // })(this);

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

const typeMap = {
    Uleb128,
    Coord
};
type TypeMap = typeof typeMap;
class Structure {
    static create<Key extends keyof typeof typeMap, Type extends TypeMap[Key]>(key: Key) {
        const instance = new typeMap[key]();

        instance.init();
        //@ts-ignore
        return instance as InstanceType<Type>;
    }
}

/******************************/

describe('main', () => {
    it('Uleb128', () => {
        const values = [0, 1, 127, 128, 9999];

        for (let value of values) {
            const buffer = BufferWrapper.numberToUleb128Buffer(value);
            const element1 = Structure.create('Uleb128').setValue(value);
            const element2 = Structure.create('Uleb128').fromBuffer(buffer);

            expect(element1.getValue()).toBe(value);
            expect(element2.getValue()).toBe(value);
            expect(Buffer.compare(
                element1.toBuffer(),
                buffer
            )).toBe(0);
            expect(Buffer.compare(
                element2.toBuffer(),
                buffer
            )).toBe(0);
        }
    });
    it('fragment', () => {
        const values = [[0, 0], [1, 1], [127, 128]];

        for (let [x, y] of values) {
            const buffer = BufferWrapper.concat([
                BufferWrapper.numberToUleb128Buffer(x),
                BufferWrapper.numberToUleb128Buffer(y)
            ]);
            const element1 = Structure.create('Coord').setValue('x', x).setValue('y', y);
            const element2 = Structure.create('Coord').fromBuffer(buffer);
            const element3 = Structure.create('Coord');

            const field1 = element3.get('x');
            field1.setValue(x);
            element3.get('y').setValue(y);

            const value1 = element1.getValue('x');
            const value2 = element1.getValue('y');

            expect(value1).toBe(x);
            expect(value2).toBe(y);

            expect(Buffer.compare(
                element1.toBuffer(),
                buffer
            )).toBe(0);
            expect(Buffer.compare(
                element2.toBuffer(),
                buffer
            )).toBe(0);
            expect(Buffer.compare(
                element3.toBuffer(),
                buffer
            )).toBe(0);
        }
    });
});
describe('type', () => {
    const StructureA = class A extends structure({
        'a': Uleb128
    }) {
        test() {return 'A';}
    };
    const StructureB = class B extends structure({
        'b': Uleb128
    }) {
        test() {return 'B';}
    };
    const Typed = class Typed extends typedStructure({
        'id': Uleb128,
        'type': {
            1: StructureA,
            2: StructureB
        }
    }) {
        base() {
            return 'X';
        }
    };

    it('create', () => {
        const instance = new Typed().init();

        expect(instance instanceof Typed).toBe(true);
        expect(instance.get('type') instanceof Uleb128).toBe(true);
        expect(instance.get('type').getValue()).toBe(-1);
    });
    it('setType', () => {
        const instance = new Typed().init();
        const instance1 = instance.setValue('type', 1);

        expect(instance1.get('type').getValue()).toBe(1);
        expect(instance1.get('a').getValue()).toBe(-1);

        instance1.setValue('a', 3);

        expect(instance1.get('a').getValue()).toBe(3);

        const instance2 = instance1.setValue('type', 2);
        
        expect(instance2.get('type').getValue()).toBe(2);
        expect(instance2.get('b').getValue()).toBe(-1);

        //console.log(instance2);
    });
    it('pomirfizm', () => {
        const instance = new Typed().init();
        const instance1 = instance.setValue('type', 1);

        //@ts-ignore
        expect(instance1.test()).toBe('A');
        //@ts-ignore
        expect(instance1.base()).toBe('X');

        const instance2 = instance1.setValue('type', 2);
        
        //@ts-ignore
        expect(instance2.test()).toBe('B');
        //@ts-ignore
        expect(instance2.base()).toBe('X');
    });
});

/****************************** /
import BufferWrapper from "../../../libs/BufferWrapper";
import * as secp256k1 from "../../../services/crypto/ec/secp256k1";
import {
    TxnStandalone,
    User, Key,

    TYPE_USER_ADMIN,
    TYPE_KEY_Secp256k1,
    EMPTY_BLOCK_HASH
} from "@/models/structure";
import { Block } from "@/models/Block";


const [privateKey, publicKey] = secp256k1.getKeys();
const buffHex = `14 10  01 02 03  00 ${publicKey.toString('hex')}  17 33  04 11 22 33 44`.replace(/\s/g, '');
const buff = BufferWrapper.from(buffHex + buffHex, 'hex');
const obj1 = TxnStandalone.create(buff, '-');
const obj2 = TxnStandalone.create();
const obj3 = TxnStandalone.create(buff, '-');
const block = Block.create() as Block;

Object.assign(window, {
    test: {
        obj1, obj2, block
    }
});

const user = User.create()
    .set('type', TYPE_USER_ADMIN)
    .set('userId', 0x02)
    .set('level', 0x03)
    .set('key',
        Key.create()
            .set('type', TYPE_KEY_Secp256k1)
            .set('data', BufferWrapper.create(publicKey))
    );
obj2
    .set('version', 0x14)
    .set('type', 0x10)
    .set('data', user)
    .set('signingBlockIndex', 0x17)
    .set('author', 0x33)
    .set('signature', BufferWrapper.from([0x11, 0x22, 0x33, 0x44]));

block
    .set('version', 0x14)
    .set('time', Date.now())
    .set('index', 0x00)
    .set('previousBlockHash', EMPTY_BLOCK_HASH);

console.log(obj1, obj2, obj3, obj1.isValid(), obj2.isValid(), obj3.isValid(), block);

console.log(buff.toString('hex'));

const buff2 = obj1.toBuffer();
console.log(buff2.toString('hex'), Buffer.compare(buff, buff2) === 0);
console.log(obj2.toBuffer().toString('hex'));
console.log(1, block.get('body').getValue().toString('hex'));
block.insertTransaction(buff);
console.log(1, block.get('body').getValue().toString('hex'));
const blockBuff = block.toBuffer();
const block2 = Block.create(blockBuff);
console.log(2, block2.get('body').getValue().toString('hex'));
console.log(2, block2.get('body').getValue().toString('hex'));

console.log(8, blockBuff.toString('hex'), block2, TxnStandalone.create(block2.get('body').getValue()));

//*/
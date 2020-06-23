import BufferWrapper from "../../../libs/BufferWrapper";
import * as secp256k1 from "../../../services/crypto/ec/secp256k1";

/******************************/

const [privateKey, publicKey] = secp256k1.getKeys();
const buffTxn = `14 10  01 02 03  00 ${publicKey.toString('hex')}  17 33  04 11 22 33 44`.replace(/\s/g, '');

/******************************/

interface StructureElementType<T> {}

abstract class Base<T> implements StructureElementType<T> {
    protected value: T;
    protected parent: Base<{}> = null;

    public setValue(value: T) {
        this.value = value;
        return this;
    }
    public getValue() {
        return this.value;
    }

    public get(): never {throw new Error()};
    public set(): never {throw new Error};

    public fromBuffer(buffer: BufferWrapper): this {throw new Error()};
    public toBuffer(): BufferWrapper {throw new Error};
    public init() {}

    getParent() {
        return this.parent;
    }
    setParent(value: Base<unknown>) {
        this.parent = value;
        return this;
    }
}

/******************************/

class Uleb128 extends Base<number> implements StructureElementType<number> {
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
    return class Structure extends Base<S> implements StructureElementType<S> {
        protected value = null;
        protected structure = {} as { [Key in keyof S]: InstanceType<S[Key]> };

        init() {
            this.initFields();
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
            return this.structure[ key ];
        }
        //@ts-ignore redefine
        public set<
            K extends Extract<keyof S, string>
        >(
            key: K,
            value: S[K]
        ) {
            this.structure[ key ] = value;
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
    }
}

function typedStructure<
    S extends { [Key in keyof S]: S[Key] } & { "type": {
        [KeyType in Extract<keyof S["type"], number>]: {
            [SubKey in keyof S["type"][KeyType]]: S["type"][KeyType][SubKey]
        }
    } } = {"type": {}}
>(schema: S) {
    return class TypedStructure<
        T extends Extract<keyof S["type"], number>
    > extends structure(schema) implements StructureElementType<S> {
        protected type = new Uleb128();
        protected substructure = {} as { [Key in keyof S["type"][T]]: InstanceType<S["type"][T][Key]> };

        //@ts-ignore redefine
        public get(key: 'type'): Uleb128;
        //@ts-ignore redefine
        public get<
            K extends (Exclude<keyof S, 'type'> | keyof S["type"][T])
        >(
            key: K
        ):
            K extends Exclude<keyof S, 'type'> ? InstanceType<S[K]> :
            K extends keyof S["type"][T] ? InstanceType<S["type"][T][K]> :
            never;
        //@ts-ignore redefine
        public get(key) {
            if (key === 'type') {
                return this.type;
            }
            if (this.structure.hasOwnProperty(key)) {
                return this.structure[ key ];
            }
            if (this.substructure.hasOwnProperty(key)) {
                return this.substructure[ key ];
            }
        }

        public setValue<
            V extends Extract<keyof S["type"], number>
        >(
            key: 'type', value: V
        ): TypedStructure<V>;
        public setValue<
            K extends (Exclude<keyof S, 'type'> | keyof S["type"][T]),
            V extends (
                K extends Exclude<keyof S, 'type'>
                    ? S[K] extends new (...args: any) => Base<infer R> ? R : any :
                K extends keyof S["type"][T]
                    ? S["type"][T] extends new (...args: any) => Base<infer R> ? R : any :
                never
            )
        >(
            key: K,
            value: V
        ): this;
        public setValue(key, value): this {
            if (key === 'type') {
                this.type.setValue(value);
                //TODO rebulid structure
                //@ts-ignore
            }
            this.get(key).setValue(value);
            return this;
        }
    }
}

/******************************/

const Coord = structure({
    'x': Uleb128,
    'y': Uleb128
});

const typeMap = {
    Uleb128,
    Coord
};

const A = typedStructure({
    'id': Coord,
    'type': {
        1: {
            'points': Uleb128
        },
        2: {
            'position': Coord
        }
    }
});
const b = new A<2>();
const B = new A<1>();
const c = b.get('type');
const d = b.get('id');
const e = b.get('position');
const D = B.get('points');
const S = B.setValue('type', 2);
const Z = S.get('');


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

            console.log(
                element1.toBuffer().toString('hex'),
                buffer.toString('hex')
            );

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
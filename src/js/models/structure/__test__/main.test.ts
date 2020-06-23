import BufferWrapper from "../../../libs/BufferWrapper";
import * as secp256k1 from "../../../services/crypto/ec/secp256k1";

/******************************/

const [privateKey, publicKey] = secp256k1.getKeys();
const buffTxn = `14 10  01 02 03  00 ${publicKey.toString('hex')}  17 33  04 11 22 33 44`.replace(/\s/g, '');

/******************************/

abstract class Base<T> {
    protected value: T;
    protected parent: Base<{}> = null;

    public setValue(value: T) {
        this.value = value;
        return this;
    }
    public getValue() {
        return this.value;
    }

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

function structure<S extends {[Key in keyof S]: new () => Base<any>}>(schema: S) {
    class Structure<
        K extends Extract<keyof S, string>,
        T extends S[K],
        V extends T extends new (...args: any) => Base<infer R> ? R : any
    > extends Base<any> {
        protected value = null;
        protected structure = {} as { [Key in K]: Base<V> };

        //@ts-ignore
        getValue(
            key: K
        ) {
            const field = this.get(key);

            return field.getValue() as V;
        }
        //@ts-ignore
        setValue(key: K, value: V) {
            const field = this.get(key) as T & Base<unknown>;

            field.setValue(value);

            return this;
        }

        public get(
            key: K
        ) {
            const value = this.structure[ key ];

            return value as InstanceType<T>;
        }

        public init() {
            for (let key in schema) {
                const constructor = schema[ key ];
                const field = new constructor();

                this.set(key as K, field);
            }
        }
        public set(
            key: K,
            value: Base<V>
        ) {
            const field = this.get(key);

            if (!schema[ key ]
                || !(
                    value
                    instanceof
                    Object.getPrototypeOf(schema[ key ])
                )
            ) {
                debugger;
                throw new Error();
            }

            this.structure[ key as number ] = value;

            return this;
        }

        toBuffer() {
            const arrayOfBuff = [] as BufferWrapper[];

            for (let key in this.structure) {
                const field = this.get(key as K) as T & Base<unknown>;
                arrayOfBuff.push(field.toBuffer());
            }
            return BufferWrapper.concat(arrayOfBuff);
        }

        fromBuffer(buffer: BufferWrapper) {
            const arrayOfBuff = [] as BufferWrapper[];

            for (let key in this.structure) {
                const field = this.get(key as K) as T &  Base<unknown>;

                field.fromBuffer(buffer);
            }

            return this;
        }
    }

    return Structure;
}

const Coord = structure({
    'x': Uleb128,
    'y': Uleb128
});

const Village = structure({
    'id': Uleb128,
    //@ts-ignore
    'coord': Coord
});

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
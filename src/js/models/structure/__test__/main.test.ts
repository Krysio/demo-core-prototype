import BufferWrapper from "../../../libs/BufferWrapper";
import { Blob } from "../Blob";
import { Uleb128 } from "../Uleb128";
import {
    Base, structure, typedStructure
} from "../Base";
import Structure from "../";

/******************************/

const Coord = structure({
    'x': Uleb128,
    'y': Uleb128
});

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
    it('Blob', () => {
        function randomBuffer(
            length: number
        ) {
            let hex = '';
            for (let i = 0; i < length; i++) {
                hex+= ("f" + Math.random().toString(16).replace(".", "")).substr(-2, 2);
            }
            return BufferWrapper.from(hex, 'hex');
        }
        function randomKey() {
            return randomBuffer(32);
        }
        function randomData() {
            return randomBuffer(256 + Math.floor(Math.random() * 1024));
        }

        for (let i = 0; i < 100; i++) {
            const buffer = randomData();

            const element1 = Structure.create('Blob').setValue(buffer);
            const element2 = Structure.create('Blob').fromBuffer(BufferWrapper.concat([
                BufferWrapper.numberToUleb128Buffer(buffer.length),
                buffer
            ]));

            expect(Buffer.compare(
                element1.getValue(),
                buffer
            )).toBe(0);
            expect(Buffer.compare(
                element2.getValue(),
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
            const element1 = new Coord().init().setValue('x', x).setValue('y', y);
            const element2 = new Coord().init().fromBuffer(buffer);
            const element3 = new Coord().init();

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
    class Typed extends typedStructure({
        'id': Uleb128,
        'type': {
            1: class A extends structure({
                'a': Uleb128
            }) {
                test() {return 'A';}
            },
            2: class B extends structure({
                'b': Uleb128
            }) {
                test() {return 'B';}
            },
            3: class C extends structure({
                'data': Blob
            }) {
                test() {return 'C';}
            }
        }
    }) {
        base() {
            return 'X';
        }
    };
    class TypedSingle extends typedStructure({
        'id': Uleb128,
        'type': {
            1: class A extends structure({
                'a': Uleb128
            }) {
                test() {return 'A';}
            }
        }
    }) {
        base() {
            return 'TypedSingle';
        }
    }

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

        const instance2 = instance.setValue('type', 2);

        expect(instance2.get('type').getValue()).toBe(2);
        expect(instance2.get('b').getValue()).toBe(-1);
    });
    it('pomirfizm', () => {
        const instance = new Typed().init();
        const instance1 = instance.setValue('type', 1);

        expect(instance1.test()).toBe('A');
        expect(instance1.base()).toBe('X');

        const instance2 = instance.setValue('type', 2);

        expect(instance2.test()).toBe('B');
        expect(instance2.base()).toBe('X');

        const instance3 = instance.setValue('type', 3);

        expect(instance3.test()).toBe('C');
        expect(instance3.base()).toBe('X');

        if (instance.isType(3)) {
            expect(instance.test()).toBe('C');
            expect(instance.base()).toBe('X');
        }

        expect(instance.asType<3>().test()).toBe('C');
        expect(instance.asType<3>().base()).toBe('X');
    });
    it('buffer', () => {
        const buffHex = `14    03    04 11 22 33 44`.replace(/\s/g, '');
        const buffer = BufferWrapper.from(buffHex, 'hex');
        const instance = new Typed().init<3>();

        instance.fromBuffer(buffer);

        expect(instance.getValue('id')).toBe(0x14);
        expect(instance.get('type').getValue()).toBe(3);
        expect(BufferWrapper.compare(
            instance.getValue('data'),
            BufferWrapper.from('11223344', 'hex')
        )).toBe(0);
        expect(BufferWrapper.compare(
            instance.toBuffer(),
            buffer
        )).toBe(0);
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
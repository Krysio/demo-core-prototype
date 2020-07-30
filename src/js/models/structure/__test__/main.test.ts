import BufferWrapper from "../../../libs/BufferWrapper";
import Structure, {
    Base, structure, typedStructure,
    Blob, Uleb128,

    TYPE_USER_ROOT
} from "../";
import { Block } from "../../Block";
import { EMPTY_BLOCK_HASH } from "../Hash";

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
            },
            4: structure({
                'a': Blob,
                'b': Blob
            })
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

        expect(instance.asType(3).test()).toBe('C');
        expect(instance.asType(3).base()).toBe('X');

        const instance4 = instance.setValue('type', 4);
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
describe('node', () => {
    describe('User', () => {
        it('from buffer - root', () => {
            const hexPubKey = '02f03e6f795ad7458aa715efd87685551d5dddd2a6630f53316721acc8bf83ee0c'
            const hex = `00 00 ${ hexPubKey }`.replace(/\s/g, '');
            const buffer = BufferWrapper.from(hex, 'hex');
            const user = Structure.create('User').fromBuffer(buffer);

            expect(TYPE_USER_ROOT).toBe(0);
            expect(user.getValue('type')).toBe(TYPE_USER_ROOT);
            expect(user.get('key').getValue('data').toString('hex')).toBe(hexPubKey);
            expect(user.getValue('level', Uleb128)).toBe(0);
        });
    });
    describe('Txn', () => {
        it('Standalone to Internal', () => {
            const hexStandalone = `
                01
                10
                    01
                    01
                    01
                        00 02d735c11eb41e1793fcf818fc513ffbf9129371603b8fc83643c8f8e89cb3fdca
                00
                00
                40cdc3c3f7272a14a6ac4a4375e897bcc68cb6e9365f2c349956065c5c09f202706d82cd23540f6562a67b92107c242d649118534013ae3ee5d11a9c603daf42ed
            `.replace(/[\s\t\n\r]+/g, '');
            const hexInternal = `
                10
                    01
                    01
                    01
                        00 02d735c11eb41e1793fcf818fc513ffbf9129371603b8fc83643c8f8e89cb3fdca
                00
                40cdc3c3f7272a14a6ac4a4375e897bcc68cb6e9365f2c349956065c5c09f202706d82cd23540f6562a67b92107c242d649118534013ae3ee5d11a9c603daf42ed
            `.replace(/[^\da-f]+/g, '');
            const bufferStandalone = BufferWrapper.from(hexStandalone, 'hex');
            const bufferInternal = BufferWrapper.from(hexInternal, 'hex');
            const txnStandalone = Structure.create('TxnStandalone').fromBuffer(bufferStandalone);
            const txnInternal = Structure.create('TxnInternal').fromBuffer(bufferInternal);
            const txnInternalFromStandalone = Structure.create('TxnInternal').fromStructure(txnStandalone);

            expect(
                txnInternal.toBuffer.toString()
            ).toBe(
                txnInternalFromStandalone.toBuffer.toString()
            );
        });
    });
    describe('Block', () => {
        it('empty', () => {
            const block = new Block();

            block.init();
            block.setValue('version', 1);
            block.setValue('index', 32);
            block.setValue('previousBlockHash', EMPTY_BLOCK_HASH);
            block.setValue('time', Date.now());
            block.setValue('transactionCount', 0);

            const hash = block.getHash();
            const buffer1 = block.toBuffer();
            const block2 = Block.fromBuffer(buffer1);
            const buffer2 = block2.toBuffer();

            expect(BufferWrapper.compare(
                buffer1,
                buffer2
            )).toBe(0);
        });
    });
});
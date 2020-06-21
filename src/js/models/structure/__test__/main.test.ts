import BufferWrapper from "../../../libs/BufferWrapper";
import * as secp256k1 from "../../../services/crypto/ec/secp256k1";

const [privateKey, publicKey] = secp256k1.getKeys();
const buffTxn = `14 10  01 02 03  00 ${publicKey.toString('hex')}  17 33  04 11 22 33 44`.replace(/\s/g, '');

abstract class Base<T> {
    protected abstract value: T;
    protected parent: Fragment<{}> = null;

    public setValue(value: T) {
        this.value = value;
        return this;
    }
    public getValue() {
        return this.value;
    }

    public abstract fromBuffer(buffer: BufferWrapper): this;
    public abstract toBuffer(): BufferWrapper;
}

abstract class Fragment<S extends { [key: number]: Base<any> }, T = any> {
    protected value = null;
    public structure = {} as S;

    get<Key extends keyof S, Field extends S[Key]>(key: Key) {
        return this.structure[key] as InstanceType<Field>;
    }
    set(key: string, field: Base<any>) {
        this.structure[key] = field;
        return this;
    }
}

class Uleb128 extends Base<number> {
    protected value = -1;

    public fromBuffer(buffer: BufferWrapper) {
        this.value = buffer.readUleb128();
        return this;
    }
    public toBuffer() {
        return BufferWrapper.numberToUleb128Buffer(this.value);
    }
}
class Coord extends Fragment<Coord["shema"]> {
    protected shema = {
        'x': Uleb128,
        'y': Uleb128
    }
}

const typeMap = {
    'uleb128': Uleb128,
    'coord': Coord
};
type TypeMap = typeof typeMap;

class Structure {
    static create<Key extends keyof typeof typeMap, Type extends TypeMap[Key]>(key: Key) {
        const instance = new typeMap[key]();
        //@ts-ignore
        return instance as InstanceType<Type>;
    }
}

let a = Structure.create('coord');
let b = a.get('x');
let c = b.

    describe('main', () => {
        it('Uleb128', () => {
            const values = [0, 1, 127, 128, 9999];

            for (let value of values) {
                const buffer = BufferWrapper.numberToUleb128Buffer(value);
                const element1 = Structure.create('uleb128').setValue(value);
                const element2 = Structure.create('uleb128').fromBuffer(buffer);

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
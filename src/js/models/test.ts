import BufferWrapper from "@/libs/BufferWrapper";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import $$, {
    TxnStandalone,
    User, Key,

    TYPE_USER_ADMIN,
    TYPE_KEY_Secp256k1,
    EMPTY_BLOCK_HASH
} from "@/models/structure";
import { Block } from "@/models/Block";

function blog(buffer: BufferWrapper) {
    return buffer.toString('hex').replace(/([\da-f]{2})/g, '$1 ');
}


const [privateKey, publicKey] = secp256k1.getKeys();
const buffHex = `14 10  01 02 03  00 ${publicKey.toString('hex')}  17 33  04 11 22 33 44`.replace(/\s/g, '');
const buff = BufferWrapper.from(buffHex, 'hex');
const obj1 = $$.create('TxnStandalone').fromBuffer(buff);
const obj2 = $$.create('TxnStandalone').asType(0x10);
const obj3 = $$.create('TxnStandalone');
const block = Block.create();

Object.assign(window, {
    test: {
        obj1, obj2, block
    }
});

const user = $$.create('User').asType(TYPE_USER_ADMIN);

user.setValue('type', TYPE_USER_ADMIN);
user.setValue('userId', 0x02);
user.setValue('level', 0x03);
user.set('key',
    $$.create('Key')
        .setValue('type', TYPE_KEY_Secp256k1)
        .setValue('data', BufferWrapper.create(publicKey))
);

obj2.setValue('version', 0x14);
obj2.setValue('type', 0x10);
obj2.set('data', user);
obj2.setValue('signingBlockIndex', 0x17);
obj2.setValue('author', 0x33);
obj2.setValue('signature', BufferWrapper.from([0x11, 0x22, 0x33, 0x44]));

block.setValue('version', 0x14)
block.setValue('time', Date.now())
block.setValue('index', 0x00)
block.setValue('previousBlockHash', EMPTY_BLOCK_HASH);

console.log(obj1, obj2, obj3, obj1.isValid(), obj2.isValid(), obj3.isValid(), block);

console.log('INPUT', blog(buff));

const buff2 = obj1.toBuffer();

console.log('OBJ 1', blog(buff2), Buffer.compare(buff, buff2) === 0);
console.log('OBJ 2', blog(obj2.toBuffer()));

const var0x01 = block.getValue('body');

console.log(1, var0x01.toString('hex'));
block.insertTransaction(buff);
console.log(1, block.getValue('body').toString('hex'));
const blockBuff = block.toBuffer();
const block2 = Block.create(blockBuff);
console.log(2, block2.getValue('body').toString('hex'));
console.log(2, block2.getValue('body').toString('hex'));

console.log(
    8,
    blockBuff.toString('hex'),
    block2,
    $$.create('TxnStandalone').fromBuffer(
        block2.get('body').getValue()
    )
);

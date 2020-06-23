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


const [privateKey, publicKey] = secp256k1.getKeys();
const buffHex = `14 10  01 02 03  00 ${publicKey.toString('hex')}  17 33  04 11 22 33 44`.replace(/\s/g, '');
const buff = BufferWrapper.from(buffHex + buffHex, 'hex');
const obj1 = $$.create('TxnStandalone').fromBuffer(buff);
const obj2 = $$.create('TxnStandalone');
const obj3 = $$.create('TxnStandalone');
const block = Block.create();

Object.assign(window, {
    test: {
        obj1, obj2, block
    }
});

const user = $$.create('User')
    .setValue('type', TYPE_USER_ADMIN)
    .setValue('userId', 0x02)
    .setValue('level', 0x03)
    .set('key',
        $$.create('Key')
            .setValue('type', TYPE_KEY_Secp256k1)
            .setValue('data', BufferWrapper.create(publicKey))
    );
obj2
    .setValue('version', 0x14)
    .setValue('type', 0x10)
    .set('data', user)
    .setValue('signingBlockIndex', 0x17)
    .setValue('author', 0x33)
    .setValue('signature', BufferWrapper.from([0x11, 0x22, 0x33, 0x44]));

block
    .setValue('version', 0x14)
    .setValue('time', Date.now())
    .setValue('index', 0x00)
    .setValue('previousBlockHash', EMPTY_BLOCK_HASH);

console.log(obj1, obj2, obj3, obj1.isValid(), obj2.isValid(), obj3.isValid(), block);

console.log(buff.toString('hex'));

const buff2 = obj1.toBuffer();
console.log(buff2.toString('hex'), Buffer.compare(buff, buff2) === 0);
console.log(obj2.toBuffer().toString('hex'));
console.log(1, block.getValue('body').toString('hex'));
block.insertTransaction(buff);
console.log(1, block.getValue('body').toString('hex'));
const blockBuff = block.toBuffer();
const block2 = Block.create(blockBuff);
console.log(2, block2.getValue('body').toString('hex'));
console.log(2, block2.getValue('body').toString('hex'));

console.log(8, blockBuff.toString('hex'), block2, $$.create('TxnStandalone').fromBuffer(block2.get('body').getValue()));

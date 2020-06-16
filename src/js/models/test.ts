import BufferWrapper from "@/libs/BufferWrapper";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import {
    TxnStandalone,
    User, Key,

    TYPE_USER_ADMIN,
    TYPE_KEY_Secp256k1
} from "@/models/structure";

/******************************/

const [ privateKey, publicKey ] = secp256k1.getKeys();
const buff = BufferWrapper.from(`14 10  01 02 03  00 ${publicKey.toString('hex')}  17 33  04 11 22 33 44`.replace(/\s/g, ''), 'hex');
const obj1 = TxnStandalone.create(buff, '-');
const obj2 = TxnStandalone.create();

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
.set('data',user)
.set('signingBlockIndex', 0x17)
.set('author', 0x33)
.set('signature', BufferWrapper.from([0x11, 0x22, 0x33, 0x44]));



console.log(obj1, obj2, obj1.isValid(), obj2.isValid());

console.log(buff.toString('hex'));

const buff2 = obj1.toBuffer();
console.log(buff2.toString('hex'), Buffer.compare(buff, buff2) === 0);
console.log(obj2.toBuffer().toString('hex'));

Object.assign(window, {
    test: {
        obj1, obj2
    }
});

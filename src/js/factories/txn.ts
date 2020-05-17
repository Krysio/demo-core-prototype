import { Transaction, TYPE_TXN_CONFIG, TYPE_TXN_ROOT_KEY, TYPE_TXN_DB_HASHES } from "@/models/transaction";
import * as configFactory from "@/factories/config";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { EMPTY_HASH } from "@/services/crypto/sha256";
import { Key, TYPE_KEY_Secp256k1 } from "@/models/key";
import { Hash } from "@/models/hash";

/******************************/

export function createConfigForFastTest() {
    const config = configFactory.createForFastTest();
    const txn = Transaction.create({
        type: TYPE_TXN_CONFIG,
        data: config.toBuffer()
    });

    return {
        txn,
        config
    };
}
export function createRoot() {
    const [ privateKey, publicKey ] = secp256k1.getKeys();

    const txn = Transaction.create({
        type: TYPE_TXN_ROOT_KEY,
        data: Key.create({
            type: TYPE_KEY_Secp256k1,
            data: publicKey
        }).toBuffer()
    })

    return {
        txn,
        privateKey, publicKey
    };
}
export function createHashesForEmptyDb() {
    return Transaction.create({
        type: TYPE_TXN_DB_HASHES
    })
    .setData([
        //@ts-ignore
        [1, Hash.create({type:1, data: EMPTY_HASH})]
    ]);
}
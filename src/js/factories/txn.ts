import {
    Txn,
    TYPE_TXN_INSERT_KEY_ROOT,
    TYPE_TXN_SET_CONFIG,
    TYPE_TXN_DB_HASH_LIST
} from "@/models/transaction";
import * as configFactory from "@/factories/config";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { EMPTY_HASH } from "@/services/crypto/sha256";
import { Key, TYPE_KEY_Secp256k1 } from "@/models/key";
import { Hash } from "@/models/hash";
import { UserRoot } from "@/models/user";

/******************************/

export function createConfigForFastTest() {
    const config = configFactory.createForFastTest();
    const txn = Txn
    .create(TYPE_TXN_SET_CONFIG)
    .setData(config.toBuffer());

    return {
        txn,
        config
    };
}
export function createRoot() {
    const [ privateKey, publicKey ] = secp256k1.getKeys();

    const txn = Txn
    .create(TYPE_TXN_INSERT_KEY_ROOT)
    .setData(
        (new UserRoot()).setKey(
            Key.create({
                type: TYPE_KEY_Secp256k1,
                data: publicKey
            })
        )
    );

    return {
        txn,
        privateKey, publicKey
    };
}
export function createHashesForEmptyDb() {
    return Txn
    .create(TYPE_TXN_DB_HASH_LIST)
    .setData([
        //@ts-ignore
        [1, Hash.create({type:1, data: EMPTY_HASH})]
    ]);
}

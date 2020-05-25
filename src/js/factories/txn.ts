import {
    Txn,
    TYPE_TXN_INSERT_KEY_ROOT,
    TYPE_TXN_SET_CONFIG,
    TYPE_TXN_DB_HASH_LIST,
    TYPE_TXN_INSERT_KEY_ADMIN,
    TYPE_TXN_INSERT_KEY_USER,
    TYPE_TXN_INSERT_KEY_PUBLIC,
    TYPE_TXN_REMOVE_KEY_USER
} from "@/models/transaction";
import * as configFactory from "@/factories/config";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { EMPTY_HASH } from "@/services/crypto/sha256";
import { Key, TYPE_KEY_Secp256k1 } from "@/models/key";
import { Hash } from "@/models/hash";
import { UserRoot, UserAdmin, UserUser, UserPublic } from "@/models/user";

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
export function createHashesForEmptyDb() {
    return Txn
    .create(TYPE_TXN_DB_HASH_LIST)
    .setData([
        //@ts-ignore
        [1, Hash.create({type:1, data: EMPTY_HASH})]
    ]);
}
export function createRoot() {
    const [ privateKey, publicKey ] = secp256k1.getKeys();

    const txn = Txn
    .create(TYPE_TXN_INSERT_KEY_ROOT)
    .setData(
        (new UserRoot())
        .setKey(
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

export function createAdmin(inputs: {
    parentId: number,
    parentPrivateKey: Buffer,
    targetBlockIndex: number,
    level: number,
    userId: number
}) {
    const [ privateKey, publicKey ] = secp256k1.getKeys();

    const txn = Txn
    .create(TYPE_TXN_INSERT_KEY_ADMIN)
    .setData(
        (new UserAdmin())
        .setKey(
            Key.create({
                type: TYPE_KEY_Secp256k1,
                data: publicKey
            })
        )
        .setLevel(inputs.level)
        .setUserId(inputs.userId)
    )
    .setSigningBlockIndex(inputs.targetBlockIndex)
    .setAuthorId(inputs.parentId);

    const hash: Buffer = txn.getHash();
    txn.setSignature(secp256k1.sign(
        inputs.parentPrivateKey,
        hash
    ) as Buffer);

    return {
        id: inputs.userId,
        txn,
        hash,
        privateKey, publicKey
    };
}

export function createUser(inputs: {
    parentId: number,
    parentPrivateKey: Buffer,
    targetBlockIndex: number,
    timeStart: number,
    timeEnd: number,
    userId: number
}) {
    const [ privateKey, publicKey ] = secp256k1.getKeys();

    const txn = Txn
    .create(TYPE_TXN_INSERT_KEY_USER)
    .setData(
        (new UserUser())
        .setKey(
            Key.create({
                type: TYPE_KEY_Secp256k1,
                data: publicKey
            })
        )
        .setUserId(inputs.userId)
        .setTimeStart(inputs.timeStart)
        .setTimeEnd(inputs.timeEnd)
    )
    .setSigningBlockIndex(inputs.targetBlockIndex)
    .setAuthorId(inputs.parentId);

    const hash: Buffer = txn.getHash();
    txn.setSignature(secp256k1.sign(
        inputs.parentPrivateKey,
        hash
    ) as Buffer);

    return {
        id: inputs.userId,
        txn,
        hash,
        privateKey, publicKey
    };
}

export function createPublicUser(inputs: {
    parentId: number,
    parentPrivateKey: Buffer,
    targetBlockIndex: number,
    userId: number
}) {
    const [ privateKey, publicKey ] = secp256k1.getKeys();

    const txn = Txn
    .create(TYPE_TXN_INSERT_KEY_PUBLIC)
    .setData(
        (new UserPublic())
        .setKey(
            Key.create({
                type: TYPE_KEY_Secp256k1,
                data: publicKey
            })
        )
        .setUserId(inputs.userId)
    )
    .setSigningBlockIndex(inputs.targetBlockIndex)
    .setAuthorId(inputs.parentId);

    const hash: Buffer = txn.getHash();
    txn.setSignature(secp256k1.sign(
        inputs.parentPrivateKey,
        hash
    ) as Buffer);

    return {
        id: inputs.userId,
        txn,
        hash,
        privateKey, publicKey
    };
}

export function removeUser(inputs: {
    parentId: number,
    parentPrivateKey: Buffer,
    targetBlockIndex: number,
    userId: number
}) {
    const txn = Txn
    .create(TYPE_TXN_REMOVE_KEY_USER)
    .setData(inputs.userId)
    .setSigningBlockIndex(inputs.targetBlockIndex)
    .setAuthorId(inputs.parentId);

    const hash: Buffer = txn.getHash();
    txn.setSignature(secp256k1.sign(
        inputs.parentPrivateKey,
        hash
    ) as Buffer);

    return {
        id: inputs.userId,
        txn,
        hash
    };
}

export function createSampleDocument(inputs: {
    authorId: number
}) {
    const txn = Txn
    .create()
    .setData(inputs.userId)
    .setSigningBlockIndex(inputs.targetBlockIndex)
    .setAuthorId(inputs.parentId);

    const hash: Buffer = txn.getHash();
    txn.setSignature(secp256k1.sign(
        inputs.parentPrivateKey,
        hash
    ) as Buffer);

    return {
        id: inputs.userId,
        txn,
        hash
    };
}

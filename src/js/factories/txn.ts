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
import * as $ from "@/models/structure";
import BufferWrapper from "@/libs/BufferWrapper";
import { TxnStandalone, TYPE_USER_ADMIN } from "@/models/structure";

/******************************/

export function createConfigForFastTest() {
    const config = configFactory.createForFastTest();

    const transaction = $.TxnInternal.create()
        .set('type', 2)
        .set('data', BufferWrapper.create(config.toBuffer()));

    return {
        transaction,
        config
    };
}
export function createHashesForEmptyDb() {
    const transaction = $.TxnInternal.create()
        .set('type', 3)
        .set('data', $.BaseStructure.create()
            .set('keys', $.Hash.create()
                .set('type', 0)
                .set('data', BufferWrapper.create(EMPTY_HASH))
            )
        );

    return {
        transaction
    };
}
export function createRoot() {
    const [privateKey, publicKey] = secp256k1.getKeys();
    const transaction = $.TxnInternal.create()
        .set('type', 1)
        .set('data',
            $.User.create()
                .set('type', 0)
                .set('key', $.Key.create()
                    .set('type', 0)
                    .set('data', BufferWrapper.create(publicKey))
                )
        );

    return {
        transaction,
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
    const [privateKey, publicKey] = secp256k1.getKeys();

    const transaction = $.TxnStandalone.create() as $.TxnStandalone;

    transaction.set('type', TYPE_TXN_INSERT_KEY_ADMIN);
    transaction.set('data',
        $.User.create()
            .set('type', TYPE_USER_ADMIN)
            .set('key', $.Key.create()
                .set('type', 0)
                .set('data', BufferWrapper.create(publicKey))
            ));
    transaction.set('signingBlockIndex', inputs.targetBlockIndex);
    transaction.set('author', inputs.parentId);

    const hash: Buffer = transaction.getHash();
    transaction.set('signature', $.Signature.create()
        .setValue(secp256k1.sign(
            inputs.parentPrivateKey,
            hash
        ) as Buffer)
    );

    return {
        id: inputs.userId,
        transaction,
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
    const [privateKey, publicKey] = secp256k1.getKeys();

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
    const [privateKey, publicKey] = secp256k1.getKeys();

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


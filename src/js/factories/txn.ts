import * as configFactory from "@/factories/config";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { EMPTY_HASH } from "@/services/crypto/sha256";
import $$, * as $ from "@/models/structure";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export function createConfigForFastTest() {
    const config = configFactory.createForFastTest();

    const transaction = $$.create('TxnInternal')
        .setValue('type', $.TYPE_TXN_SET_CONFIG)
        .setValue('data', BufferWrapper.create(config.toBuffer()));

    return {
        transaction,
        config
    };
}
export function createHashesForEmptyDb() {
    const transaction = $$.create('TxnInternal')
        .setValue('type', $.TYPE_TXN_HASH_LIST)
        .set('data', $$.create('HashList')
            .set('keys', $$.create('Hash')
                .setValue('type', $.TYPE_HASH_Sha256)
                .setValue('data', BufferWrapper.create(EMPTY_HASH))
            )
        );

    return {
        transaction
    };
}
export function createRoot() {
    const [privateKey, publicKey] = secp256k1.getKeys();
    const transaction = $$.create('TxnInternal')
        .setValue('type', $.TYPE_TXN_INSERT_ROOT_USER)
        .set('data', $$.create('User')
                .setValue('type', $.TYPE_USER_ROOT)
                .set('key', $$.create('Key')
                    .setValue('type', $.TYPE_KEY_Secp256k1)
                    .setValue('data', BufferWrapper.create(publicKey))
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

    const transaction = $$.create('TxnStandalone');

    transaction.setValue('type', $.TYPE_TXN_INSERT_USER_ADMIN);
    transaction.set('data',
        $$.create('User')
            .setValue('type', $.TYPE_USER_ADMIN)
            .set('key', $$.create('Key')
                .setValue('type', $.TYPE_KEY_Secp256k1)
                .setValue('data', BufferWrapper.create(publicKey))
            )
            .setValue('userId', inputs.userId)
    );
    transaction.setValue('signingBlockIndex', inputs.targetBlockIndex);
    transaction.setValue('author', inputs.parentId);

    const hash: Buffer = transaction.getHash();
    transaction.set('signature', $$.create('Signature')
        .setValue(secp256k1.sign(
            inputs.parentPrivateKey,
            hash
        ) as BufferWrapper)
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
    const transaction = $$.create('TxnStandalone');

    transaction.setValue('type', $.TYPE_TXN_INSERT_USER_USER);
    transaction.set('data',
        $$.create('User')
            .setValue('type', $.TYPE_USER_USER)
            .set('key', $$.create('Key')
                .setValue('type', $.TYPE_KEY_Secp256k1)
                .setValue('data', BufferWrapper.create(publicKey))
            )
            .setValue('userId', inputs.userId)
            .setValue('timeStart', inputs.timeStart)
            .setValue('timeEnd', inputs.timeEnd)
    );
    transaction.setValue('signingBlockIndex', inputs.targetBlockIndex);
    transaction.setValue('author', inputs.parentId);

    const hash: Buffer = transaction.getHash();
    transaction.set('signature', $$.create('Signature')
        .setValue(secp256k1.sign(
            inputs.parentPrivateKey,
            hash
        ) as BufferWrapper)
    );

    return {
        id: inputs.userId,
        transaction,
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
    const transaction = $$.create('TxnStandalone');

    transaction.setValue('type', $.TYPE_TXN_INSERT_USER_PUBLIC);
    transaction.set('data',
        $$.create('User')
            .setValue('type', $.TYPE_USER_PUBLIC)
            .set('key', $$.create('Key')
                .setValue('type', $.TYPE_KEY_Secp256k1)
                .setValue('data', BufferWrapper.create(publicKey))
            )
            .setValue('userId', inputs.userId)
    );
    transaction.setValue('signingBlockIndex', inputs.targetBlockIndex);
    transaction.setValue('author', inputs.parentId);

    const hash: Buffer = transaction.getHash();
    transaction.set('signature', $$.create('Signature')
        .setValue(secp256k1.sign(
            inputs.parentPrivateKey,
            hash
        ) as BufferWrapper)
    );

    return {
        id: inputs.userId,
        transaction,
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
    const transaction = $$.create('TxnStandalone');

    transaction.setValue('type', $.TYPE_TXN_REMOVE_USER);
    transaction.setValue('data', inputs.userId)
    transaction.setValue('signingBlockIndex', inputs.targetBlockIndex);
    transaction.setValue('author', inputs.parentId);

    const hash: Buffer = transaction.getHash();
    transaction.set('signature', $$.create('Signature')
        .setValue(secp256k1.sign(
            inputs.parentPrivateKey,
            hash
        ) as BufferWrapper)
    );

    return {
        id: inputs.userId,
        transaction,
        hash
    };
}


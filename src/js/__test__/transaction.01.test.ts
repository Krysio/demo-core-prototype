import bson from "bson";
import * as txn from "../models/transaction";
import { Key } from "../models/key";
import { Block } from "../models/block";
import * as secp256k1 from "../services/crypto/ec/secp256k1";
import * as helper from "./helper";
import { createValidConfig } from "./config.generator";

/******************************/

describe('Transactions', () => {
    it('create', () => {
        const transaction = txn.Transaction.create({
            type: 0
        });

        //@ts-ignore
        expect(transaction.verify({}, {})).toBe(true);
    });
    it('pola', () => {
        const type = 0;
        const data = helper.randomData();
        const txnA = txn.Transaction.create();

        txnA.setType(type);
        txnA.setData(data);

        expect(txnA.getType()).toBe(type);
        expect(txnA.getData()).toEqual(data);
    });
    it('from & to buffer', () => {
        const txnA = txn.Transaction.create({
            type: 0,
            data: helper.randomData()
        });
        const txnBuffer = txnA.toBuffer();
        const txnB = txn.Transaction.fromBuffer(txnBuffer);

        expect(txnA.getType()).toBe(0);
        expect(txnB.getType()).toBe(0);
        expect(txnA.getData()).toEqual(txnB.getData());
    });
    it('type rootKey - secp256k1', () => {
        // Ta transakcja wchodzi do bloku o indeksie 0

        const [privateKey, publicKey] = secp256k1.getKeys();
        const blockA = Block.create({ index: 0 });
        const blockB = Block.create({ index: 1 });
        const txType = txn.TYPE_TXN_ROOT_KEY;
        const txnA = txn.Transaction.create({
            type: txType,
            data: Key.create({
                type: 1,
                data: publicKey
            }).toBuffer()
        });
        const txnB = txn.Transaction.create({ type: txType });

        expect(txnA.getType()).toBe(txType);

        expect(txnA.verify({block: blockA})).toBe(true);
        expect(txnA.verify({block: blockB})).toBe(false);

        expect(txnB.verify({block: blockA})).toBe(false);
        expect(txnB.verify({block: blockB})).toBe(false);
    });
    it('type config', async () => {
        // blok musi być typu 1
        const blockA = Block.create({ index: 0, time: 0 });
        const blockB = Block.create({ index: 1, time: 5 });
        const blockC = Block.create({ index: 2, time: 10 });

        const txType = txn.TYPE_TXN_CONFIG;

        const txnA = txn.Transaction.create({
            type: txType,
            data: bson.serialize(createValidConfig())
        });
        const txnB = txn.Transaction.create({ type: txType });

        expect(txnA.getType()).toBe(txType);

        expect(txnA.verify({block: blockA})).toBe(true);
        expect(txnA.verify({block: blockB})).toBe(false);
        expect(txnA.verify({block: blockC})).toBe(false);

        expect(txnB.verify({block: blockA})).toBe(false);
        expect(txnB.verify({block: blockB})).toBe(false);
        expect(txnB.verify({block: blockC})).toBe(false);
    });
    it('type dbHashes', async () => {
        // blok musi być typu 1
        const blockA = Block.create({ index: 0 });
        const blockB = Block.create({ index: 1, time: 5 });
        const txType = txn.TYPE_TXN_DB_HASHES;

        const txnA = txn.Transaction.create({
            type: txType,
            data: bson.serialize([
                1, 1, helper.randomKey(),
                2, 1, helper.randomKey()
            ])
        });
        const txnB = txn.Transaction.create({ type: txType });

        expect(txnA.verify({block: blockA})).toBe(true);
        expect(txnA.verify({block: blockB})).toBe(false);

        expect(txnB.verify({block: blockA})).toBe(false);
        expect(txnB.verify({block: blockB})).toBe(false);
    });
});
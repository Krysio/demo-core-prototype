import bson from "bson";
import fs from "fs";
import debug from 'debug';

import createNodeCore from "@/nodeCore";
import {
    Block,
    Transaction as Txn,
    TYPE_TXN_DB_HASHES
} from "@/nodeCore";
import { EMPTY_HASH } from "@/nodeCore/service/crypto/sha256";
import { createValidRunningInputs, createTxnForBlock } from "./running.generator";

/******************************/

const DIR_TEST = __filename.replace(/ts$/, 'dir');

try {
    fs.mkdirSync(DIR_TEST);
} catch (error) {}

describe('configure, insert genesis, main loop', () => {
    const instance = createNodeCore(DIR_TEST);
    const inputs = createValidRunningInputs();

    it('tworzenie bloku genezis, transakcje klucz root`a oraz konfiguracja', async () => {
        await instance.onReady();

        // ten klient powinine móc startować nie posiadając bloku genesis
        // ale taki blok powinine istnieć na początku łańcucha

        // co jakiś czas będą tworzone bloki od których będzie można
        // zaczynać synchronizację, zawierać będą konfigurację łańcucha
        // oraz hash'e baz danych z niezbędnymi danymi z przeszłości

        // nie weryfikujemy czy hash poprzednigo bloku jest czy nie
        // blok taki powstaje co określony czas [config], posiada ten sam timestamp
        // co blok poprzedni - 0 czasu odstępu między tymi blokami

        // transakcja z configiem nie musi posiadać podpisu
        // transakcja z definiowanie klucza root'a może zostać umieszczona tylko
        // w bloku bez hash'u do poprzedniego

        const cbCoreBlockVerifyAccept = jest.fn();
        const cbCoreBlockRead = jest.fn();
        const cbCoreTxnRead = jest.fn();
        const cbCoreKeyInsert = jest.fn();
        const cbCoreConfigChanged = jest.fn();
        const cbCoreTopBlockCompare = jest.fn();
        const cbCoreTopBlockChanged = jest.fn();

        instance.events.on('core/block/verify/accept', cbCoreBlockVerifyAccept);
        instance.events.on('core/block/read', cbCoreBlockRead);
        instance.events.on('core/txn/read', cbCoreTxnRead);
        instance.events.on('core/key/insert', cbCoreKeyInsert);
        instance.events.on('core/config/changed', cbCoreConfigChanged);
        instance.events.on('core/topBlock/compare', cbCoreTopBlockCompare);
        instance.events.on('core/topBlock/compare/changed', cbCoreTopBlockChanged);

        instance.events.emit('input/block', inputs.blockGenesis.toBuffer());

        await new Promise((r) => setTimeout(r, 500));

        expect(cbCoreBlockRead).toBeCalledTimes(1);
        expect(cbCoreTxnRead).toBeCalledTimes(3);
        expect(cbCoreKeyInsert).toBeCalledTimes(1);
        expect(cbCoreConfigChanged).toBeCalledTimes(1);
        expect(cbCoreTopBlockCompare).toBeCalledTimes(1);
        expect(cbCoreTopBlockChanged).toBeCalledTimes(1);
    });

    it('stan po wstawieniu genesis', async () => {
        let blockConfig: Block | null = instance.getBlockLastConfig();

        expect(blockConfig).not.toBe(null);
        blockConfig = blockConfig as Block;
        expect(instance.isBlockConfig(blockConfig)).toBe(true);

        const txnDbList: Txn[] = blockConfig.getTransactionListByType(TYPE_TXN_DB_HASHES);

        expect(txnDbList.length).toBe(1);

        let txnDbDataBuffer: Buffer | null = txnDbList[0].getData();

        expect(txnDbDataBuffer).not.toBe(null);
        txnDbDataBuffer = txnDbDataBuffer as Buffer;

        const txnDbData: [number, number, Buffer][] = bson.deserialize(txnDbDataBuffer, {promoteBuffers: true});

        expect(txnDbData[0][0]).toBe(1);
        expect(txnDbData[0][1]).toBe(1);
        expect(Buffer.compare(txnDbData[0][2], EMPTY_HASH)).toBe(0);
    });

    it('transkacje', async () => {
        const topBlock = instance.getBlockTop() as Block;

        const txnNull1 = createTxnForBlock(topBlock);
        const txnNull2 = createTxnForBlock(topBlock);
        const txnNull1Cb = jest.fn();
        const txnNull2Cb = jest.fn();

        // transakcja w czas
        instance.events.emit('input/txn', txnNull1.toBuffer());
        instance.events.once('core/txn/verify/accept', txnNull1Cb);

        await new Promise((r) => setTimeout(r, 2000));

        // transakcja spóźniona
        instance.events.emit('input/txn', txnNull2.toBuffer());
        instance.events.once('core/txn/verify/reject', txnNull2Cb);

        await new Promise((r) => setTimeout(r, 10));

        expect(txnNull1Cb).toBeCalledTimes(1);
        expect(txnNull2Cb).toBeCalledTimes(1);
    }, 7000);

    it('end', async () => {
        await instance.destroy();
    });
});
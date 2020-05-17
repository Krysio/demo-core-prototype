import { Block } from "../models/block";
import * as helper from "./helper";

/******************************/

describe('main', () => {
    it('tworzenie bloku', () => {
        const block = Block.create();

        expect(block).toBeInstanceOf(Block);
    });
    it('pola bloku', () => {
        const block = Block.create();
        const time = Date.now();
        const index = 10;
        const previousHash = helper.randomKey();

        let blockHash = block.getHash();

        block.setTime(time);
        expect(block.getTime()).toBe(time);
        expect(
            Buffer.compare(block.getHash(), blockHash)
        ).not.toBe(0);
        blockHash = block.getHash();

        block.setIndex(index);
        expect(block.getIndex()).toBe(index);
        expect(
            Buffer.compare(block.getHash(), blockHash)
        ).not.toBe(0);
        blockHash = block.getHash();

        block.setPreviousBlockHash(previousHash);
        expect(block.getPreviousBlockHash()).toEqual(previousHash);
        expect(
            Buffer.compare(block.getHash(), blockHash)
        ).not.toBe(0);
    });
    it('constructor', () => {
        const time = Date.now();
        const index = 10;
        const previousHash = helper.randomKey();

        const blockA = Block.create({
            time, index, previousHash
        });
        const blockB = Block.create();

        blockB.setTime(time);
        blockB.setIndex(index);
        blockB.setPreviousBlockHash(previousHash);

        expect(blockA.getHash()).toEqual(blockB.getHash());
    });
    it('from & to buffer', async () => {
        const time = Date.now();
        const index = 10;
        const previousHash = helper.randomKey();

        const blockA = Block.create({
            time, index, previousHash
        });
        const blockBuffer = blockA.toBuffer();
        const blockB = Block.fromBuffer(blockBuffer);

        expect(
            Buffer.compare(
                blockA.getHash(),
                blockB.getHash()
            )
        ).toBe(0);
    });
});
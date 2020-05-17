import { Key } from "../models/key";
import * as secp256k1 from "../services/crypto/ec/secp256k1";
import * as helper from "./helper";

/******************************/

describe('Keys', () => {
    it('create', () => {
        const key = Key.create({
            type: 0
        });

        //@ts-ignore
        expect(key.verify({})).toBe(true);
    });
    it('pola', () => {
        const type = 0;
        const data = helper.randomData();
        const key = Key.create();

        key.setType(type);
        key.setData(data);

        expect(key.getType()).toBe(type);
        expect(key.getData()).toEqual(data);
    });
    it('from & to buffer', () => {
        const keyA = Key.create({
            type: 0,
            data: helper.randomKey()
        });
        const keyBuffer = keyA.toBuffer();

        const keyB = Key.fromBuffer(keyBuffer);

        expect(keyA.getType()).toBe(0);
        expect(keyB.getType()).toBe(0);
        expect(keyA.getData()).toEqual(keyB.getData());
    });
    it('Secp256k1', () => {
        const [ privateKey, publicKey ] = secp256k1.getKeys();

        const keyA = Key.create({
            type: 1,
            data: publicKey
        });
        const keyB = Key.create({
            type: 1,
            data: helper.randomBuffer(16)
        });
        const keyC = Key.create({
            type: 1,
            data: Buffer.from(
                `   04
                    FFFF FFFF FFFF FFFF
                    FFFF FFFF FFFF FFFE
                    BAAE DCE6 AF48 A03B
                    BFD2 5E8C D036 4140
                `.replace(/\s+/, ''),
                'hex'
            )
        });

        expect(keyA.verify()).toBe(true);
        expect(keyB.verify()).toBe(false);
        expect(keyC.verify()).toBe(false);
    });
});
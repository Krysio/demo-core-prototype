import BufferWrapper from "../../../libs/BufferWrapper";
import * as secp256k1 from "../../../services/crypto/ec/secp256k1";
import { Uleb128, Key } from "../";

describe('main', () => {
    it('Uleb128', () => {
        const values = [0, 1, 127, 128, 9999];

        for (let value of values) {
            const buffer = BufferWrapper.numberToUleb128Buffer(value);
            const element1 = (new Uleb128()).fromBuffer(buffer);
            const element2 = (new Uleb128()).set(value);

            expect(element1.get()).toBe(value);
            expect(element2.get()).toBe(value);
            expect(Buffer.compare(
                element1.toBuffer(),
                buffer
            )).toBe(0);
            expect(Buffer.compare(
                element2.toBuffer(),
                buffer
            )).toBe(0);
        }
    });
    it('Key', () => {
        const [ privateKey, publicKey ] = secp256k1.getKeys();
        const buffer = BufferWrapper.concat([
            BufferWrapper.numberToUleb128Buffer(0),
            publicKey
        ]);
        const element1 = (new Key()).fromBuffer(buffer);
        const element2 = (new Key()).set('type', 0).set('value', publicKey);

        expect(Buffer.compare(
            element1.get('value').get(),
            publicKey
        )).toBe(0);
        expect(Buffer.compare(
            element2.get('value').get(),
            publicKey
        )).toBe(0);
        expect(Buffer.compare(
            element1.toBuffer(),
            buffer
        )).toBe(0);
        expect(Buffer.compare(
            element2.toBuffer(),
            buffer
        )).toBe(0);
    });
});


import BufferWrapper from "@/libs/BufferWrapper";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { Base, structure, typedStructure } from "./base";
import { Blob } from "./Blob";

/******************************/

export const TYPE_KEY_Secp256k1 = 0;

/******************************/

export class Secp256k1 extends Blob {
    protected blobSize = 33;

    isValid() {
        return secp256k1.isValidPublicKey(this.value as Buffer);
    }
    verify(
        hash: BufferWrapper,
        signature: BufferWrapper
    ) {
        return secp256k1.verify(
            this.getValue() as BufferWrapper,
            hash, signature
        );
    }
}

export class Key extends typedStructure({
    'type': {
        [TYPE_KEY_Secp256k1]: class KeySecp256k1 extends structure({
            'data': Secp256k1
        }) {
            verify(
                hash: BufferWrapper,
                signature: BufferWrapper
            ) {
                return secp256k1.verify(
                    this.get('data').getValue() as BufferWrapper,
                    hash, signature
                );
            }
        }
    }
}) {
    verify(
        hash: BufferWrapper,
        signature: BufferWrapper
    ): boolean {
        throw new Error();
    }
};

const negativeFilter = (key: Key) => !key.isValid();
export class ArrayOfKeys extends Base<Key[]> {
    protected value = null as Key[];

    public fromBuffer(buffer: BufferWrapper) {
        const length = buffer.readUleb128();

        this.value = [];
        for (let i = 0; i < length; i++) {
            this.value.push(
                (new Key()).init().fromBuffer(buffer)
            );
        }
        return this;
    }

    public toBuffer() {
        if (this.isValid() === false) {
            throw new Error();
        }
        const toConcat = [
            BufferWrapper.numberToUleb128Buffer(this.value.length)
        ];
        for (let key of this.value) {
            toConcat.push(key.toBuffer());
        }
        return BufferWrapper.concat(toConcat);
    }
    
    public isValid() {
        return this.value !== null && this.value.filter(negativeFilter).length === 0;
    }
}
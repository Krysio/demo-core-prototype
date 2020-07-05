import BufferWrapper from "@/libs/BufferWrapper";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { structure, typedStructure } from "./base";
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

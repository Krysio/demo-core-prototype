import BufferWrapper from "@/libs/BufferWrapper";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { structure, typedStructure } from "@/models/structure";
import { Blob } from "./Blob";

/******************************/

export const TYPE_KEY_Secp256k1 = 1;

/******************************/

export class Secp256k1 extends Blob {
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

export const Key = typedStructure({
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
});

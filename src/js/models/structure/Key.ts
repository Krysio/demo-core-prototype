import BufferWrapper from "@/libs/BufferWrapper";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";
import { Base, BaseStructure, defineTypes } from "@/models/structure";

/******************************/

export const TYPE_KEY_Secp256k1 = 0;

/******************************/

export class Key extends BaseStructure {
    protected schema = {
        'type': defineTypes({
            [TYPE_KEY_Secp256k1]: class KeySecp256k1 extends Key {
                protected schema = {
                    'data': Secp256k1
                };

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
        })
    };
}

export class Secp256k1 extends Base {
    protected value: BufferWrapper;

    toBuffer() {
        return this.value;
    }

    fromBuffer() {
        this.$cursorStart = this.buffer.cursor;
        this.value = this.buffer.read(33);
        this.$cursorEnd = this.buffer.cursor;
        return this;
    }

    isValid() {
        return secp256k1.isValidPublicKey(this.value as Buffer);
    }
}

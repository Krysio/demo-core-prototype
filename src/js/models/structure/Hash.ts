import BufferWrapper from "@/libs/BufferWrapper";
import * as sha256 from "@/services/crypto/sha256";
import { structure, typedStructure } from "./base";
import { Blob } from "./Blob";

/******************************/

export const TYPE_HASH_Sha256 = 0;
export const EMPTY_BLOCK_HASH = BufferWrapper.alloc(32).fill(0) as BufferWrapper;

/******************************/

export class Sha256 extends Blob {
    protected value: BufferWrapper = EMPTY_BLOCK_HASH;

    isValid() {
        return this.value.length === 32;
    }
}

export const Hash = typedStructure({
    'type': {
        [TYPE_HASH_Sha256]: class HashSha256 extends structure({
            'data': Sha256
        }) {
            setHashFromString(value: string) {
                const hash = new sha256.HashSum();

                hash.push(Buffer.from(value, 'utf8'));
                this.setValue('data', BufferWrapper.create(hash.get()));

                return this;
            }
        }
    }
});

export { Sha256 as BlockHash }

import BufferWrapper from "@/libs/BufferWrapper";
import { structure, typedStructure } from "./Base";
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
            [TYPE_HASH_Sha256]: structure({
                'data': Sha256
            })
        }
});

export { Sha256 as BlockHash }

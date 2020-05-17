import { Block } from "@/models/block";

/******************************/

class BlockStore {
    map = new Map<string, Buffer>();

    async getBlockByHash(hash: Buffer) {
        const strHash = hash.toString('hex');
        return this.map.get(strHash) || null;
    }
    async storeBlock(inputBlock: Block | Buffer) {
        let block: Block;
        let blockData: Buffer;

        if (inputBlock instanceof Buffer) {
            block = Block.fromBuffer(inputBlock);
            blockData = inputBlock;
        } else {
            block = inputBlock;
            blockData = block.toBuffer();
        }

        const hash = block.getHash().toString('hex');

        this.map.set(hash, blockData);
    }
}

export default function() {
    return new BlockStore();
}

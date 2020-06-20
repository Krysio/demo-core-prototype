import { BaseStructure, Uleb128, BlockHash, Blob } from "./structure";
import BufferWrapper from "@/libs/BufferWrapper";
import { HashSum } from "@/services/crypto/sha256";

export class Block extends BaseStructure {
  protected schema = {
    'version': Uleb128,
    'index': Uleb128,
    'time': Uleb128,
    'previousBlockHash': BlockHash,
    'body': Blob
  };

  calcHash() {
    const hash = new HashSum();

    hash.push(this.get('version').toBuffer());
    hash.push(this.get('index').toBuffer());
    hash.push(this.get('time').toBuffer());
    hash.push(this.get('previousBlockHash').toBuffer());
    hash.push(this.get('body').toBuffer());

    return hash.get();
  }

  insertTransaction(
    txn: BufferWrapper
  ) {
    this.get('body').setValue(
      BufferWrapper.concat([
        this.get('body').getValue(),
        txn
      ])
    );
    this.get('body').getValue();
  }
}

import { BaseStructure, Uleb128, BlockHash, Blob, EMPTY_BLOCK_HASH } from "./structure";
import BufferWrapper from "@/libs/BufferWrapper";
import { HashSum } from "@/services/crypto/sha256";

export class Block extends BaseStructure {
  protected schema = {
    'version': Uleb128,
    'index': Uleb128,
    'time': Uleb128,
    'previousBlockHash': BlockHash,
    'transactionCount': Uleb128,
    'body': Blob
  };

  init() {
    this.set('version', 0);
    this.set('index', 0);
    this.set('transactionCount', 0);
    this.set('previousBlockHash', EMPTY_BLOCK_HASH);
  }

  getHash() {
    const hash = new HashSum();

    hash.push(this.get('version').toBuffer());
    hash.push(this.get('index').toBuffer());
    hash.push(this.get('time').toBuffer());
    hash.push(this.get('previousBlockHash').toBuffer());
    hash.push(this.get('body').toBuffer());

    return BufferWrapper.create(hash.get());
  }

  getIndex() { return this.get('index').getValue() as number }
  setIndex(value: number) { this.get('index').setValue(value); return this; }
  getTime() { return this.get('time').getValue() as number }
  setTime(value: number) { this.get('time').setValue(value); return this; }
  getPreviousBlockHash() { return this.get('previousBlockHash').getValue() as BufferWrapper }
  setPreviousBlockHash(value: BufferWrapper) { this.get('previousBlockHash').setValue(value); return this; }
  getCountOfTransactions() { return this.get('transactionCount').getValue() as number }
  getBody() { return this.get('body').getValue() as BufferWrapper }

  insertTransaction(
    txn: BufferWrapper
  ) {
    this.get('body').setValue(
      BufferWrapper.concat([
        this.get('body').getValue(),
        txn
      ])
    );

    this.set(
      'transactionCount',
      this.get('transactionCount').getValue() + 1
    );
  }

  static create(buffer?: BufferWrapper) {
    return super.create(buffer) as Block;
  }
  static fromBuffer(buffer: Buffer) {
    return new Block(BufferWrapper.create(buffer));
  }

  verify() {
    // const txnDataList = this.getBody();

    // for (let data of txnDataList) {
    //   const txt = Txn.fromBuffer(data);

    //   // if (txt.verify({ block: this }) === false) {
    //   //     return false;
    //   // }
    // }

    return true;
  }
}

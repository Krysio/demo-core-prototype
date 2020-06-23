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
    this.setValue('version', 0);
    this.setValue('index', 0);
    this.setValue('transactionCount', 0);
    this.setValue('previousBlockHash', EMPTY_BLOCK_HASH);
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

  getIndex() { return this.getValue('index') as number }
  setIndex(value: number) { this.setValue('index', value); return this; }
  getTime() { return this.getValue('time') as number }
  setTime(value: number) { this.setValue('time', value); return this; }
  getPreviousBlockHash() { return this.getValue('previousBlockHash') as BufferWrapper }
  setPreviousBlockHash(value: BufferWrapper) { this.setValue('previousBlockHash', value); return this; }
  getCountOfTransactions() { return this.getValue('transactionCount') as number }
  getBody() { return this.getValue('body') as BufferWrapper }

  insertTransaction(
    txn: BufferWrapper
  ) {
    this.get('body').setValue(
      BufferWrapper.concat([
        this.getValue('body'),
        txn
      ])
    );

    this.set(
      'transactionCount',
      this.getValue('transactionCount') + 1
    );
  }

  static create(buffer?: BufferWrapper) {
    //@ts-ignore
    return new Block(buffer);
  }
  static fromBuffer(buffer: Buffer) {
    return Block.create().fromBuffer(BufferWrapper.create(buffer));
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

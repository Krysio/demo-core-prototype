import { Block } from "@/models/Block";
import * as txnFactory from "@/factories/txn";
import Time from '@/services/Time';

/******************************/

export function createGenesisiForFastTest() {
    const { config, transaction: txnConfig } = txnFactory.createConfigForFastTest();
    const { publicKey, privateKey, transaction: txnRootKey } = txnFactory.createRoot();
    const { transaction: txnDbHashList } = txnFactory.createHashesForEmptyDb();

    const blockGenesis = Block.create() as Block;

    blockGenesis
        .set('version', 0x00)
        .set('index', 0x00)
        .set('time', Time.now());

    blockGenesis.insertTransaction(txnRootKey.toBuffer());
    blockGenesis.insertTransaction(txnConfig.toBuffer());
    blockGenesis.insertTransaction(txnDbHashList.toBuffer());

    return {
        blockGenesis,
        config,
        rootKey: { privateKey, publicKey },
        txn: {
            insertRootKey: txnRootKey,
            config: txnConfig,
            dbHashList: txnDbHashList
        }
    };
}

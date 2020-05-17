import { Block } from "@/models/block";
import * as txnFactory from "@/factories/txn";
import Time from '@/services/Time';

/******************************/

export function createGenesisiForFastTest() {
    const { config, txn: txnConfig } = txnFactory.createConfigForFastTest();
    const { publicKey, privateKey, txn: txnRootKey } = txnFactory.createRoot();
    const txnDbHashList = txnFactory.createHashesForEmptyDb();

    const blockGenesis = Block.create({
        time: Time.now(),
        index: 0
    });

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

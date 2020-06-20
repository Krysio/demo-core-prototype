import { Block } from "@/models/block";
import * as txnFactory from "@/factories/txn";
import Time from '@/services/Time';

/******************************/

export function createGenesisiForFastTest() {
    const { config, txn: txnConfig, transaction: test2 } = txnFactory.createConfigForFastTest();
    const { publicKey, privateKey, txn: txnRootKey, transaction: test1 } = txnFactory.createRoot();
    const { txn: txnDbHashList, transaction: test3 } = txnFactory.createHashesForEmptyDb();

    const blockGenesis = Block.create({
        time: Time.now(),
        index: 0
    });


    console.log(
        txnRootKey.toBuffer().toString('hex'),
        test1.toBuffer().toString('hex'),
        txnConfig.toBuffer().toString('hex'),
        test2.toBuffer().toString('hex'),
        txnDbHashList.toBuffer().toString('hex'),
        test3.toBuffer().toString('hex'),
    );

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

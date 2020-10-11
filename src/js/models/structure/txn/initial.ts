import { structure } from "../base";
import { Config } from "../../Config";
import { Block } from "../../Block";
import { User } from "../User";
import { Blob } from "../Blob";
import { HashList } from "../HashList";
import { Context } from "@/context";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export const TYPE_TXN_INSERT_ROOT_USER = 1;
export const TYPE_TXN_SET_CONFIG = 2;
export const TYPE_TXN_HASH_LIST = 3;

/******************************/

class TxnInsertRootUser extends structure({
    'data': User
}) {
    isValid() {
        const user = this.get('data') as User;
        return user.isRoot() && super.isValid();
    }

    verify(inputs: {
        selfBlock: Block
    }) {
        if (inputs.selfBlock.getValue('index') !== 0) {
            return false;
        }

        return true;
    }
    apply(context: Context) {/*TODO REMOVE*/}
}

class TxnSetConfig extends structure({
    'data': Blob
}) {
    isValid() {
        return this.getConfig().isValid() && super.isValid();
    }

    verify(inputs: {
        selfBlock: Block
    }) {
        // lub jest to % enty blok - ustawienie configu
        if (inputs.selfBlock.getValue('index') !== 0) {
            return false;
        }

        const config = this.getConfig();

        return config.isValid();
    }

    getConfig() {
        return Config.fromBuffer(this.get('data').getValue());
    }
    apply(context: Context) {/*TODO REMOVE*/}
}

class TxnDbHashList extends structure({
    'data': HashList
}) {
    verify(inputs: any) {return true;}
    apply(context: Context) {/*TODO REMOVE*/}
}

export const internalInitial = {
    [TYPE_TXN_INSERT_ROOT_USER]: TxnInsertRootUser,
    [TYPE_TXN_SET_CONFIG]: TxnSetConfig,
    [TYPE_TXN_HASH_LIST]: TxnDbHashList
};
/******************************/

import { ruleTxnApply } from "@/context/rules";

/******************************/

function applyInsertRootUser(
    this: TxnInsertRootUser,
    context: Context
) {
    const data: BufferWrapper = this.get('data').toBuffer();

    if (data !== null) {
        context.storeUserWithId(0, data);
    }
}

function applySetConfig(
    this: TxnSetConfig,
    context: Context
) {
    const data: BufferWrapper = this.get('data').getValue();
    const config = Config.fromBuffer(data);

    context.setConfig(config);
}

ruleTxnApply.set(TYPE_TXN_INSERT_ROOT_USER, applyInsertRootUser);
ruleTxnApply.set(TYPE_TXN_SET_CONFIG, applySetConfig);

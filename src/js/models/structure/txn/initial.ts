import { structure } from "../base";
import { Config } from "../../Config";
import { User } from "../User";
import { Blob } from "../Blob";
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
}

class TxnSetConfig extends structure({
    'data': Blob
}) {
    isValid() {
        return this.getConfig().isValid() && super.isValid();
    }
    getConfig() {
        return Config.fromBuffer(this.get('data').getValue());
    }
}

export const internalInitial = {
    [TYPE_TXN_INSERT_ROOT_USER]: TxnInsertRootUser,
    [TYPE_TXN_SET_CONFIG]: TxnSetConfig
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

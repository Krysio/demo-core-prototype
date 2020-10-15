import BufferWrapper from "@/libs/BufferWrapper";
import { HashSum } from "@/services/crypto/sha256";
import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { User, TYPE_USER_ADMIN, TYPE_USER_ROOT } from "../User";
import { Author } from "../Author";
import { Signature } from "../Signature";
import { Block } from "../../Block";
import { standaloneByAdmin } from "./common";
import { Context } from "@/context";

/******************************/

class TxnInternalInsertUser extends structure({
    'author': Author,
    'data': User,
    'signature': Signature
}) {
    public getHash(
        selfBlock: Block,
        signingBlock: Block,
        signingValue: 'index' | 'hash'
    ) {
        const hash = new HashSum();

        hash.push(selfBlock.get('version').toBuffer());
        hash.push(this.get('type', Uleb128).toBuffer());
        hash.push(this.get('data').toBuffer());

        if (signingValue === 'hash') {
            hash.push(this.get('author').toBuffer());
            hash.push(signingBlock.getHash());
        }
        if (signingValue === 'index') {
            hash.push(this.get('author').toBuffer());
            hash.push(signingBlock.get('index').toBuffer());
        }

        return BufferWrapper.create(hash.get());
    }
}

/******************************/

export const TYPE_TXN_INSERT_USER_ADMIN = 16;
export const TYPE_TXN_INSERT_USER_USER = 17;
export const TYPE_TXN_INSERT_USER_PUBLIC = 18;

/******************************/

export const internalCreateUser = {
    [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertUserAdmin extends TxnInternalInsertUser {
        public isValid() {
            const user = this.get('data') as User;
            return user.isAdmin() && super.isValid();
        }
    },
    [TYPE_TXN_INSERT_USER_USER]: class TxnInsertUserUser extends TxnInternalInsertUser {
        public isValid() {
            const user = this.get('data') as User;
            return user.isUser() && super.isValid();
        }
    },
    [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertUserPublic extends TxnInternalInsertUser {
        public isValid() {
            const user = this.get('data') as User;
            return user.isPublic() && super.isValid();
        }
    },
};

export const standaloneCreateUser = {
    [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertUserAdmin extends standaloneByAdmin({
        'data': User
    }) {},
    [TYPE_TXN_INSERT_USER_USER]: class TxnInsertUserUser extends standaloneByAdmin({
        'data': User
    }) {},
    [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertUserPublic extends standaloneByAdmin({
        'data': User
    }) {
        public isValid() {
            const user = this.get('data');
            return user.isPublic() && super.isValid();
        }
    }
};

/******************************/

import {
    ruleTxnSignatureType,
    ruleTxnAuthorUserType,
    ruleTxnVerify,
    ruleTxnOnlyEvenBlockIndex,
    ruleTxnApply
} from "@/context/rules";
import { TYPE_TXN_SIGNATURE_ADMIN } from "./constants";

/******************************/

ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_INSERT_USER_ADMIN, true);
ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_INSERT_USER_USER, true);
ruleTxnOnlyEvenBlockIndex.set(TYPE_TXN_INSERT_USER_PUBLIC, true);

ruleTxnSignatureType.set(TYPE_TXN_INSERT_USER_ADMIN, TYPE_TXN_SIGNATURE_ADMIN);
ruleTxnSignatureType.set(TYPE_TXN_INSERT_USER_USER, TYPE_TXN_SIGNATURE_ADMIN);
ruleTxnSignatureType.set(TYPE_TXN_INSERT_USER_PUBLIC, TYPE_TXN_SIGNATURE_ADMIN);

ruleTxnAuthorUserType.set(TYPE_TXN_INSERT_USER_ADMIN, [TYPE_USER_ROOT, TYPE_USER_ADMIN]);
ruleTxnAuthorUserType.set(TYPE_TXN_INSERT_USER_USER, [TYPE_USER_ROOT, TYPE_USER_ADMIN]);
ruleTxnAuthorUserType.set(TYPE_TXN_INSERT_USER_PUBLIC, [TYPE_USER_ROOT, TYPE_USER_ADMIN]);

/******************************/

// weryfikacja

import { userNotExistInSystem, insertingAdminHasLowerLevel } from "@/helper/verifier/user";

ruleTxnVerify.set(TYPE_TXN_INSERT_USER_ADMIN, [
    userNotExistInSystem,
    insertingAdminHasLowerLevel
]);
ruleTxnVerify.set(TYPE_TXN_INSERT_USER_USER, [userNotExistInSystem]);
ruleTxnVerify.set(TYPE_TXN_INSERT_USER_PUBLIC, [userNotExistInSystem]);

/******************************/

// apply

function applyInsetUser(
    this: TxnInternalInsertUser,
    context: Context
) {
    const user = this.get('data', User);
    context.module.userInsert.in(user);
}

ruleTxnApply.set(TYPE_TXN_INSERT_USER_ADMIN, applyInsetUser);
ruleTxnApply.set(TYPE_TXN_INSERT_USER_USER, applyInsetUser);
ruleTxnApply.set(TYPE_TXN_INSERT_USER_PUBLIC, applyInsetUser);

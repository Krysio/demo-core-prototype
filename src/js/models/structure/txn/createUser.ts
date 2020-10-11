import BufferWrapper from "@/libs/BufferWrapper";
import { HashSum } from "@/services/crypto/sha256";
import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { User, TYPE_USER_ADMIN, TYPE_USER_USER, TYPE_USER_PUBLIC, TYPE_USER_ROOT } from "../User";
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
    public async verifyPrepareInputs(
        context: Context,
        selfBlock: Block
    ) {
        const author = await context.getUserById(
            this.get('author').getValue()
        );
        const userById = await context.getUserById(
            this.get('data').get('userId', Uleb128).getValue()
        );
        const previousBlock = await context.getBlockByHash(
            selfBlock.getPreviousBlockHash()
        );
        const signingBlock = await context.getBlockByHash(
            previousBlock.getPreviousBlockHash()
        );
        return { author, userById, selfBlock, signingBlock };
    }
    public verify(inputs: {
        author: User;
        userById: User;
        selfBlock: Block;
        signingBlock: Block;
    }) {
        const user = this.get('data');
        const author = inputs.author.asType(TYPE_USER_ADMIN);

        if (inputs.userById !== null) {
            return false;
        }
        if (user.isType(TYPE_USER_ADMIN)) {
            if (author.getValue('level') >= user.getValue('level')) {
                return false;
            }
        }

        // podpis

        const key = author.get('key');
        const hash = this.getHash(
            inputs.selfBlock,
            inputs.signingBlock,
            author.isAdminLike() ? 'index' : 'hash'
        );
        const signature = this.get('signature').getValue();

        if (key.verify(hash, signature) === false) {
            return false;
        }

        return true;
    }
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
    apply(context: Context) {
        const user = this.get('data', User);
        const userId = user.getValue('userId', Uleb128);

        context.storeUserWithId(userId, user.toBuffer());
    }
}

const TxnStandaloneByAdmin = standaloneByAdmin({
    'data': User
});
class TxnStandaloneInsertUser extends TxnStandaloneByAdmin {
    protected verifyInputs = {
        author: null as User,
        userFromSystem: null as User
    };
    public verify(inputs: TxnStandaloneInsertUser['verifyInputs']) {
        const { userFromSystem } = this.verifyInputs;

        // user nie moze istniec w systemie
        if (userFromSystem !== null) return false;
        return super.verify(inputs);
    }
    public async verifyPrepareInputs(context: Context) {
        await super.verifyPrepareInputs(context);

        this.verifyInputs.userFromSystem = await context.getUserById(
            this.get('data', User)
            .getValue('userId', Uleb128)
        );

        return this.verifyInputs;
    }
    public getInsertingUser() {
        return this.get('data');
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
    [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertUserAdmin extends TxnStandaloneInsertUser {
        public verify(
            inputs: TxnStandaloneInsertUser['verifyInputs']
        ) {
            if (!super.verify(inputs)) return false;

            const author = this.verifyInputs.author.asType(TYPE_USER_ADMIN);
            const user = this.get('data', User);

            // wstawiany typ: admin
            if (!user.isType(TYPE_USER_ADMIN)) return false;
            // dodawany admin tylko niższej rangi
            if (author.getValue('level') >= user.getValue('level')) return false;

            return true;
        }
        public isValid() {
            const user = this.getInsertingUser();
            return user.isAdmin() && super.isValid();
        }
    },
    [TYPE_TXN_INSERT_USER_USER]: class TxnInsertUserUser extends TxnStandaloneInsertUser {
        public verify(
            inputs: TxnStandaloneInsertUser['verifyInputs']
        ) {
            if (!super.verify(inputs)) return false;

            const user = this.get('data', User);

            // wstawiany typ: user
            if (!user.isType(TYPE_USER_USER)) return false;

            /** TODO
             * verify:
             * wartości z configa
             *  - odpowiedni przedział czasowy ważności klucza
             *  - odpowiedni odstęp czasowy od wstawienia klucza do jego uruchomienia
            */

            return true;
        }
        public isValid() {
            const user = this.getInsertingUser();
            return user.isUser() && super.isValid();
        }
    },
    [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertUserPublic extends TxnStandaloneInsertUser {
        public verify(
            inputs: TxnStandaloneInsertUser['verifyInputs']
        ) {
            if (!super.verify(inputs)) return false;

            const user = this.get('data', User);

            // wstawiany typ: public
            if (!user.isType(TYPE_USER_PUBLIC)) return false;

            return true;
        }
        public isValid() {
            const user = this.getInsertingUser();
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

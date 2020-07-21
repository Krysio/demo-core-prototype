import BufferWrapper from "@/libs/BufferWrapper";
import { HashSum } from "@/services/crypto/sha256";
import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { User, TYPE_USER_ADMIN } from "../User";
import { Author } from "../Author";
import { Signature } from "../Signature";
import { Block } from "../../Block";
import { standaloneByAdmin } from "./common";
import { Context } from "@/context";

/******************************/

class TxnInternalInsertUser extends structure({
    'data': User,
    'author': Author,
    'signature': Signature
}) {
    async verifyPrepareInputs(
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
    verify(inputs: {
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
    getHash(
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

class TxnStandaloneInsertUser extends standaloneByAdmin({
    'data': User
}) {
    public verify(inputs: {
        author: User;
        userById: User;
    }) {
        if (inputs.userById !== null) {
            return false;
        }
        return super.verify(inputs);
    }
    async verifyPrepareInputs(context: Context) {
        const author = await context.getUserById(
            this.getValue('author')
        );
        const userById = await context.getUserById(
            this.get('data', User)
            .getValue('userId', Uleb128)
        );
        return { author, userById };
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
        isValid() {
            const user = this.get('data') as User;
            return user.isAdmin() && super.isValid();
        }
    },
    [TYPE_TXN_INSERT_USER_USER]: class TxnInsertUserUser extends TxnInternalInsertUser {
        isValid() {
            const user = this.get('data') as User;
            return user.isUser() && super.isValid();
        }
        /** TODO
         * verify:
         * wartości z configa
         *  - odpowiedni przedział czasowy ważności klucza
         *  - odpowiedni odstęp czasowy od wstawienia klucza do jego uruchomienia
        */
    },
    [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertUserPublic extends TxnInternalInsertUser {
        isValid() {
            const user = this.get('data') as User;
            return user.isPublic() && super.isValid();
        }
    },
};

export const standaloneCreateUser = {
    [TYPE_TXN_INSERT_USER_ADMIN]: class TxnInsertUserAdmin extends TxnStandaloneInsertUser {
        verify(
            inputs: {
                author: User;
                userById: User;
            }
        ) {
            // dziedziczenie
            if (!super.verify(inputs)) {
                return false;
            }

            const author = inputs.author.asType(TYPE_USER_ADMIN);
            const user = this.get('data', User);

            // wstawiany typ: admin
            if (!user.isType(TYPE_USER_ADMIN)) {
                return false;
            }
            // dodawany admin tylko niższej rangi
            if (author.getValue('level') >= user.getValue('level')) {
                return false;
            }
            // podpis
            if (!author.get('key').verify(
                //@ts-ignore
                this.getHash(),
                this.getValue('signature')
            )) {
                return false;
            }

            return true;
        }
        isValid() {
            const user = this.getInsertingUser();
            return user.isAdmin() && super.isValid();
        }
    },
    [TYPE_TXN_INSERT_USER_USER]: class TxnInsertUserUser extends TxnStandaloneInsertUser {
        isValid() {
            const user = this.getInsertingUser();
            return user.isUser() && super.isValid();
        }
    },
    [TYPE_TXN_INSERT_USER_PUBLIC]: class TxnInsertUserPublic extends TxnStandaloneInsertUser {
        isValid() {
            const user = this.getInsertingUser();
            return user.isPublic() && super.isValid();
        }
    }
};
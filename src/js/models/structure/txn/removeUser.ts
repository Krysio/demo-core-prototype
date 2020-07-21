import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { standaloneByAdmin } from "./common";
import { User, TYPE_USER_ADMIN } from "../User";
import { Author } from "../Author";
import { Signature } from "../Signature";
import { Context } from "@/context";

/******************************/

export const TYPE_TXN_REMOVE_USER = 19;

/******************************/

export const internalRemoveUser = {
    [TYPE_TXN_REMOVE_USER]: class TxnRemoveUser extends structure({
        'data': structure({
            'userId': Uleb128,
            'reason': Uleb128
        }),
        'author': Author,
        'signature': Signature
    }) {
        apply(context: Context) {
            const userId = this.get('data').getValue('userId');
            context.removeUserById(userId);
        }
    }
};

export const standaloneRemoveUser = {
    [TYPE_TXN_REMOVE_USER]: class TxnRemoveUser extends standaloneByAdmin({
        'data': structure({
            'userId': Uleb128,
            'reason': Uleb128
        })
    }) {
        async ['verifyPrepareInputs' as 'ts has a problem :('](context: Context) {
            const author = await context.getUserById(
                this.getValue('author')
            );
            const userById = await context.getUserById(
                this.get('data', User)
                .getValue('userId', Uleb128)
            );
            return { author, userById };
        }
        verify(
            inputs: {
                author: User;
                userById: User;
            }
        ) {
            const author = inputs.author.asType(TYPE_USER_ADMIN);

            if (!author.isAdminLike()) {
                return false;
            }

            const user = inputs.userById;

            if (user === null) {
                return false;
            }
            if (user.isRoot()) {
                return false;
            }
            if (user.isType(TYPE_USER_ADMIN)) {
                if (user.getValue('level') <= author.getValue('level')) {
                    return false;
                }
            }
            if (!author.get('key').verify(
                //@ts-ignore
                this.getHash(),
                this.getValue('signature')
            )) {
                return false;
            }

            return true;
        }
    }
};
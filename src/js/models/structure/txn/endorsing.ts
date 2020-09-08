import { structure } from "../base";
import { Uleb128 } from "../Uleb128";
import { internalByUser, standaloneByUser } from "./common";
import { Context } from "@/context";
import { User, TYPE_USER_USER, TYPE_USER_PUBLIC } from "../User";
import { Config } from "../../Config";

/******************************/

export const TYPE_TXN_INSERT_ENDORSING = 86;
export const TYPE_TXN_REMOVE_ENDORSING = 87;
export const TYPE_TXN_REPLACE_ENDORSING = 88;

/******************************/

export const internalEndoring = {
    [TYPE_TXN_INSERT_ENDORSING]: class TxnInsertEndorsing extends internalByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        verify() {
            // TODO user istnieje i jest to user lub public, limit slotów
            return true;
        }
        apply() {
            // save
        }
    },
    [TYPE_TXN_REMOVE_ENDORSING]: class TxnRemoveEndorsing extends internalByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        verify() {
            // TODO id jest na liście poparcia
            return true;
        }
        apply() {
            // save
        }
    },
    [TYPE_TXN_REPLACE_ENDORSING]: class TxnReplaceEndorsing extends internalByUser({
        'data': structure({
            'fromUserId': Uleb128,
            'toUserId': Uleb128
        })
    }) {
        verify() {
            // TODO user istnieje i jest to user lub public
            // TODO id jest na liście poparcia
            return true;
        }
        apply() {
            // save
        }
    }
};

/******************************/

async function prepareInputs(context: Context) {
    const user = await context.getUserById(this.get('data').getValue('userId'));
    const edorsingList = await context.getUserEndorsingListById(this.getValue('author'));
    const config = context.getConfig();

    return { user, edorsingList, config };
}

export const externalEndorsing = {
    [TYPE_TXN_INSERT_ENDORSING]: class TxnInsertEndorsing extends standaloneByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        // ts has a problem :(
        public async ['verifyPrepareInputs' as ':/'](
            context: Context
        ) {
            const parentInputs = await super.verifyPrepareInputs(context);
            const inputs = await prepareInputs(context);

            return { ...parentInputs, ...inputs };
        }
        public verify(inputs: {
            author: User,
            user: User,
            config: Config,
            edorsingList: any[]
        }) {
            if (!super.verify(inputs)) return false;
            
            const { user, config, edorsingList } = inputs;

            // user istnieje i jest to user lub public
            if (user === null) return false;
            if ([TYPE_USER_USER, TYPE_USER_PUBLIC].indexOf(user.getValue('type')) === -1) return false;

            // limit slotów
            if (edorsingList.length > config.getEdorsingLimit()) return false;

            return true;
        }
    },
    [TYPE_TXN_REMOVE_ENDORSING]: class TxnRemoveEndorsing extends standaloneByUser({
        'data': structure({
            'userId': Uleb128
        })
    }) {
        // ts has a problem :(
        public async ['verifyPrepareInputs' as ':/'](
            context: Context
        ) {
            const parentInputs = await super.verifyPrepareInputs(context);
            const inputs = await prepareInputs(context);

            return { ...parentInputs, ...inputs };
        }
        public verify(inputs: {
            author: User,
            user: User
        }) {
            if (!super.verify(inputs)) return false;
            // id jest na liście poparcia
            return true;
        }
    },
    [TYPE_TXN_REPLACE_ENDORSING]: class TxnReplaceEndorsing extends standaloneByUser({
        'data': structure({
            'fromUserId': Uleb128,
            'userId': Uleb128
        })
    }) {
        // ts has a problem :(
        public async ['verifyPrepareInputs' as ':/'](
            context: Context
        ) {
            const parentInputs = await super.verifyPrepareInputs(context);
            const inputs = await prepareInputs(context);

            return {
                ...parentInputs,
                ...inputs,
                currentId: this.get('data').getValue('fromUserId')
            };
        }
        public verify(inputs: {
            author: User,
            user: User,
            currentId: number
        }) {
            if (!super.verify(inputs)) return false;
            // TODO user istnieje i jest to user lub public
            // TODO id jest na liście poparcia
            return true;
        }
    }
};

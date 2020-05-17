import { Context } from "@/context";
import { TxnAny, TxnTypeAdmin, TxnTypeUser } from "@/models/transaction";
import { Block } from "@/models/block";
import Time from "@/services/Time";
import { UserRoot, UserAdmin, User } from "@/models/user";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('input/txn', async (txn: TxnAny) => {
        if (context.hasTopBlock() === false) {
            context.events.emit('node/txn/verify/reject', txn);
            return;
        }
        if (context.hasConfig() === false) {
            context.events.emit('node/txn/verify/reject', txn);
            return;
        }

        const config = context.getConfig();
        const firstTopBlock = context.getTopBlock();
        const secondTopBlock = context.getSecondTopBlock();
        const timeLimit = Math.min(
            60e3,
            Math.ceil(config.getDiscreteBlockPeriod() / 2)
        );

        // wskazanie na blok

        let validSignTarget = false;

        if (txn instanceof TxnTypeAdmin
            && (txn.getSigningBlockIndex() === firstTopBlock.getIndex()
                || (
                    txn.getSigningBlockIndex() === secondTopBlock.getIndex()
                    && Time.now() < firstTopBlock.getTime() + timeLimit
                )
            )
        ) {
            validSignTarget = true;
        } else if (txn instanceof TxnTypeUser) {
            const signedBlock = await context.getBlockByHash(txn.getSigningBlockHash());

            if (signedBlock === null) {
                context.events.emit('node/txn/verify/reject', txn);
                return;
            }

            if (firstTopBlock === signedBlock
                || (
                    context.hasSecondTopBlock() === true
                    && secondTopBlock === signedBlock
                    && Time.now() < firstTopBlock.getTime() + timeLimit
                )
            ) {
                validSignTarget = true;
            }
        }

        if (validSignTarget === false) {
            context.events.emit('node/txn/verify/reject', txn);
            return;
        }

        // autor

        const inputs = {} as {
            author?: User;
        };
        if (txn instanceof TxnTypeAdmin) {
            inputs.author = User.fromBuffer(
                await context.store.keys.get(txn.getAuthorId())
            );
        } else if (txn instanceof TxnTypeUser) {
            inputs.author = User.fromBuffer(
                await context.store.keys.get(txn.getAuthorId())
            );
        }

        // poprawność transakcji

        if (txn.verify(inputs)) {
            context.events.emit('node/txn/verify/accept', txn);
            return;
        }

        context.events.emit('node/txn/verify/reject', txn);
    });
}
import { Context } from "@/context";
import { TxnAny, TxnTypeAdmin, TxnTypeUser, TxnTypeInternal } from "@/models/transaction";
import { Block } from "@/models/block";
import Time from "@/services/Time";
import { UserRoot, UserAdmin, User } from "@/models/user";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('input/txn', async (txn: TxnAny) => {
        // Node nie działa
        if (context.hasTopBlock() === false
            || context.hasConfig() === false
        ) {
            context.events.emit('node/txn/verify/reject', txn, 0);
            return;
        }

        // Transakcje wewnętrzne nie przychodzą z sieci
        if (txn instanceof TxnTypeInternal) {
            context.events.emit('node/txn/verify/reject', txn, 1);
            return;
        }

        // Sprawdzamy czy txn może zostać przyjęta odnośnie czasu,
        // wskazania na blok
        // transakcja zostanie przyjęta jeśli podpisuje aktualny blok na szcycie
        // lub jego poprzednika i nie mineło czasu więcej niż min(1min, połowaOkresuMiędzyBlokami)

        const config = context.getConfig();
        const firstTopBlock = context.getTopBlock();
        const secondTopBlock = context.getSecondTopBlock();
        const timeLimit = Math.min(
            60e3,
            Math.ceil(config.getDiscreteBlockPeriod() / 2)
        );
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
                context.events.emit('node/txn/verify/reject', txn, 2);
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
            context.events.emit('node/txn/verify/reject', txn, 3);
            return;
        }

        // poprawność transakcji

        const inputs = await txn.verifyPrepareInputs(context);

        if (txn.verify(inputs)) {
            context.events.emit('node/txn/verify/accept', txn);
            return;
        }

        context.events.emit('node/txn/verify/reject', txn, 4);
    });
}
import { Context } from "@/context";
import { TxnStandalone, BlockIndex, BlockHash } from "@/models/structure";
import Time from "@/services/Time";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    context.events.on('input/txn', async (txn: TxnStandalone) => {
        // Node nie działa
        if (context.hasTopBlock() === false
            || context.hasConfig() === false
        ) {
            context.events.emit('node/txn/verify/reject', txn, 0);
            return;
        }

        //
        if (!txn.isValid()) {
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

        if (txn.isAdminTransaction()) {
            const index = txn.get('signingBlockIndex', BlockIndex).getValue();

            if (index === firstTopBlock.getIndex()
                || (
                    index === secondTopBlock.getIndex()
                    && Time.now() < firstTopBlock.getTime() + timeLimit
                )
            ) {
                validSignTarget = true;
            }
        } else if (txn.isUserTransaction()) {
            const signingHash = txn.get('signingBlockHash', BlockHash).getValue();
            const signedBlock = await context.getBlockByHash(signingHash);

            if (signedBlock === null) {
                context.events.emit('node/txn/verify/reject', txn, 2);
                return;
            }

            if (
                BufferWrapper.compare(
                    firstTopBlock.getHash(),
                    signingHash
                ) === 0
                || (
                    BufferWrapper.compare(
                        secondTopBlock.getHash(),
                        signingHash
                    ) === 0
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

        console.log(inputs);
        context.events.emit('node/txn/verify/reject', txn, 4);
    });
}
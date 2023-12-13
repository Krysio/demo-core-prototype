import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import { TypeTxnStandaloneScope } from "@/models/structure";
import { ruleTxnVerify } from "../rules";

/******************************/

export default function moduleTxnVerifier(ctx: unknown) {
    const context = ctx as Context;

    return createModule(async (args: TypeTxnStandaloneScope) => {
        const { txn, type } = args;
        const ruleVerify = ruleTxnVerify.get(type);

        if (ruleVerify) {
            for (let verify of ruleVerify) {
                if (!(await verify(txn, context, args))) {
                    console.log('🟡', `${verify.name}`, txn);
                    return null;
                }
            }
        }

        return args;
    });
}

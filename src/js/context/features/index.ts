import { Context } from "@/context";
import block from "./block";
import transaction from "./transaction";
import topBlock from "./topBlock";
import config from "./config";
import state from "./state";
import clock from "./clock";
import inputBlock from "./input/block";
import inputTxn from "./input/txn";
import nodeBlockAccepted from "./node/blockAccepted";
import nodeTxnAccepted from "./node/txnAccepted";
import nodeTopBlockCompare from "./node/topBlockCompare";
import nodeTopBlockChanged from "./node/topBlockChanged";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    inputBlock(rawContext);
    inputTxn(rawContext);
    nodeBlockAccepted(rawContext);
    nodeTxnAccepted(rawContext);
    nodeTopBlockCompare(rawContext);
    nodeTopBlockChanged(rawContext);

    return {
        ...state(rawContext),
        ...config(rawContext),
        ...transaction(rawContext),
        ...block(rawContext),
        ...topBlock(rawContext),
        ...clock(rawContext)
    };
}

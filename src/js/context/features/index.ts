import { Context } from "@/context";
import block from "./block";
import config from "./config";
import state from "./state";
import user from "./user";
import inputBlock from "./input/block";
import inputTxn from "./input/txn";

/******************************/

export default function (rawContext: unknown) {
    const context = rawContext as Context;

    inputBlock(rawContext);
    inputTxn(rawContext);

    return {
        ...state(rawContext),
        ...config(rawContext),
        ...block(rawContext),
        ...user(rawContext)
    };
}

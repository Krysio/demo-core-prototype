import { EventEmitter, TypedEventEmitter } from "events";
import * as UUID from "uuid";
import Node from "@/models/node";
import { Block } from "@/models/block";
import { Config } from "@/models/Config";
import { TxnStandalone } from "@/models/structure/Transaction";

import createStore from "./store";

import createFeatures from "./features";
import BufferWrapper from "@/libs/BufferWrapper";
import moduleTxnParser from "./modules/txnParser";
import moduleTxnValidator from "./modules/txnValidator";
import moduleTxnVerifier from "./modules/txnVerifier";
import moduleTxnCollector from "./modules/txnCollector";
import moduleUserInsert from "./modules/userInsert";
import moduleBlockCreator from "./modules/blockCreator";

/******************************/

export default function createContext(
    nodeObject: Node
) {
    const uuid = UUID.v4();
    const events = new EventEmitter() as TypedEventEmitter<{
        'init': [],
        'destroy/before': [],
        'destroy/after': [],
        'node/ready': [],
        'node/block/verify/accept': [Block],
        'node/block/verify/reject': [Block],
        'node/txn/verify/accept': [TxnStandalone],
        'node/txn/verify/reject': [TxnStandalone, number],
        'node/topBlock/compare': [Block],
        'node/topBlock/compare/accept': [Block],
        'node/topBlock/compare/reject': [Block],
        'node/topBlock/changed': [Block],
        'node/topBlock/push': [Block],
        'node/config/changed': [Config],

        'db/keys/ready': [],

        'input/block': [Block],
        'input/txn': [TxnStandalone],

        'node/parser/txn/in': [BufferWrapper],
        'node/parser/txn/out': [TxnStandalone],
        'node/validator/txn/in': [TxnStandalone],
        'node/validator/txn/out/admin': [TxnStandalone],
        'node/validator/txn/out/user': [TxnStandalone],
    }>;

    if (process.env.NODE_ENV !== "production") {
        const rawEmit = events.emit.bind(events);
        events.emit = (type: typeof events["$eventList"], ...args: any[]): ReturnType<typeof rawEmit> => {
            console.log(
                `Node<%c${ uuid }%c>:emit<%c${ type }%c>`,
                'color:blue;', '',
                'color:green;', '',
                args
            );
            return rawEmit(type, ...args);
        };
    }
    setTimeout(() => events.emit('init'));

    const rawContext = { uuid, events };
    
    const txnParser = moduleTxnParser(rawContext);
    const txnValidator = moduleTxnValidator(rawContext);
    const txnVerifier = moduleTxnVerifier(rawContext);
    const txnCollector = moduleTxnCollector(rawContext);

    const blockCreator = moduleBlockCreator(rawContext);

    const userInsert = moduleUserInsert(rawContext);

    txnParser.out(txnValidator.in); // parser -> validator
    txnValidator.out(txnVerifier.in); // validator -> log
    txnVerifier.out(txnCollector.in); // verifier -> collector
    txnVerifier.out((v) => console.log('verifier', v)); // verifier -> log
    blockCreator.out((v) => console.log('block', v)); // verifier -> log

    const context = {
        ...rawContext,
        store: createStore(rawContext),
        ...createFeatures(rawContext),
        module: {
            txnParser, txnValidator, txnVerifier, txnCollector,
            blockCreator,
            userInsert,
        }
    };

    Object.assign(rawContext, context);

    return rawContext as typeof context;
}
export type Context = ReturnType<typeof createContext>;
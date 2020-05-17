import { EventEmitter, TypedEventEmitter } from "events";
import * as UUID from "uuid";
import Node from "@/models/node";
import { Block } from "@/models/block";
import { Config } from "@/models/Config";

import createStore from "./store";

import createFeatures from "./features";

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
        'node/topBlock/compare': [Block],
        'node/topBlock/compare/accept': [Block],
        'node/topBlock/compare/reject': [Block],
        'node/topBlock/changed': [Block],
        'node/topBlock/push': [Block],
        'node/config/changed': [Config],

        'db/keys/ready': [],

        'input/block': [Block]
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
    const context = {
        ...rawContext,
        store: createStore(rawContext),
        ...createFeatures(rawContext)
    };

    Object.assign(rawContext, context);

    return rawContext as typeof context;
}
export type Context = ReturnType<typeof createContext>;
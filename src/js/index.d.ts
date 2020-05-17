declare module 'react-json-syntax' {
    import { ReactElement } from "react";

    type Tag = string | Function;
    type Attr = { [key: string]: any };
    type Children = (string | number | JsonNode | null)[];
    export type JsonNode = [Tag] | [Tag, Attr] | [Tag, Children] | [Tag, Attr, Children];

    const $: (input: JsonNode) => ReactElement;
    export default $;
}
declare module "events" {
    export type Listener = (...args: any[]) => void;

    export class TypedEventEmitter<EventList extends { [key: string]: any[] } = any> {
        $eventList: EventList;

        static listenerCount(
            emitter: TypedEventEmitter,
            type: string | number | symbol
        ): number;
        static defaultMaxListeners: number;

        eventNames(): (string | number | symbol)[];
        setMaxListeners(n: number): this;
        getMaxListeners(): number;

        emit<EventName extends keyof EventList, Args extends EventList[EventName]>(
            type: Args[0] extends void
                ? EventName
                : "Event requires parameters"
        ): boolean;
        emit<EventName extends keyof EventList, Args extends EventList[EventName]>(
            type: EventName,
            ...args: Args[0] extends void
                ? ["Event does not accept any parameters"]
                : EventList[EventName]
        ): boolean;

        addListener<
            EventName extends keyof EventList,
            Args extends EventList[EventName]
        >(
            type: EventName,
            listener: Args[0] extends void
                ? () => void
                : (...args: EventList[EventName]) => void
        ): this;

        on: TypedEventEmitter<EventList>["addListener"];
        once: TypedEventEmitter<EventList>["addListener"];
        prependListener: TypedEventEmitter<EventList>["addListener"];
        prependOnceListener: TypedEventEmitter<EventList>["addListener"];
        removeListener: TypedEventEmitter<EventList>["addListener"];
        off: TypedEventEmitter<EventList>["addListener"];

        removeAllListeners(): this;
        removeAllListeners<EventName extends keyof EventList>(
            type: EventName
        ): this;

        listenerCount<EventName extends keyof EventList>(type: EventName): number;
        listeners<
            EventName extends keyof EventList,
            Args extends EventList[EventName]
        >(
            type: EventName
        ): (
            Args[0] extends void
            ? () => void
            : (...args: EventList[EventName]) => void
        )[];
        rawListeners: TypedEventEmitter<EventList>["listeners"];
    }
}

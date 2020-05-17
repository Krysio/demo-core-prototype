import { Context } from "@/context";
import { Config } from "@/models/Config";

/******************************/

export default function (refContext: unknown) {
    const context = refContext as Context;

    return {
        config: null as Config | null,
        getConfig() {
            return context.config as Config;
        },
        hasConfig() {
            return context.config !== null;
        },
        setConfig(config: Config) {
            context.config = config;
            context.events.emit('node/config/changed', config);
        },
        createDefaultConfig() {
            context.config = Config.create();
        }
    };
}

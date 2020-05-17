import { Context } from "@/context";
import Time from "@/services/Time";

export default function(rawContext: unknown) {
    const context = rawContext as Context;

    return {
        canRun() {
            return context.hasConfig() && context.hasTopBlock();
        },
        getCurrentBlockIndex() {
            if (context.hasConfig()) {
                const config = context.getConfig();
                const now = Time.now();
                return Math.floor((now - config.getGenesisTime()) / config.getDiscreteBlockPeriod());
            }
            return 0;
        }
    };
}
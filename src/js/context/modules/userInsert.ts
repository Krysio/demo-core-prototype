import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import BufferWrapper from "@/libs/BufferWrapper";
import Structure, { User } from "@/models/structure";

export default function moduleUserInsert(ctx: unknown) {
    const context = ctx as Context;

    return createModule((
        user: User
    ) => {
        return null;
    });
}

import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import Structure, {
    TYPE_USER_USER
} from "@/models/structure";

export default function moduleUserSuspend(ctx: unknown) {
    const context = ctx as Context;

    return createModule(async (
        data: {
            userId: number,
            timeEnd: number
        }
    ) => {
        const buffUser = await context.store.user.get(data.userId);

        const internalUser = Structure.create('User').fromBuffer(buffUser.seek(0)).asType(TYPE_USER_USER);
        internalUser.setValue('timeStart', data.timeEnd);

        context.store.user.put(data.userId, internalUser.toBuffer());

        return null;
    });
}

import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import Structure, {
    Uleb128, ArrayOfUleb128,
    User, InternalUser,
    TYPE_USER_USER,
    Key
} from "@/models/structure";

export default function moduleUserCreate(ctx: unknown) {
    const context = ctx as Context;

    return createModule((
        data: {
            userId: number,
            level: number,
            timeStart: number,
            timeEnd: number,
            key: Key,
        }
    ) => {
        const internalUser = (new InternalUser()).init().asType(TYPE_USER_USER);

        internalUser.setValue('type', TYPE_USER_USER);
        internalUser.setValue('userId', data.userId);
        internalUser.setValue('level', data.level);
        internalUser.setValue('timeStart', data.timeStart);
        internalUser.setValue('timeEnd', data.timeEnd);
        internalUser.set('key', data.key);

        context.store.user.put(data.userId, internalUser.toBuffer());

        return null;
    });
}

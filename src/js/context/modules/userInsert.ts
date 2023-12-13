import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import Structure, {
    Uleb128, ArrayOfUleb128,
    User, InternalUser,
    TYPE_USER_USER
} from "@/models/structure";

export default function moduleUserInsert(ctx: unknown) {
    const context = ctx as Context;

    return createModule((
        user: User
    ) => {
        const userId = user.getValue('userId', Uleb128);
        const userType = user.getValue('type', Uleb128);
        const internalUser = new InternalUser();

        internalUser.init();
        internalUser.fromStructure(user);

        // default new field values
        switch (userType) {
            case TYPE_USER_USER: {
                const typedUser = internalUser.asType(TYPE_USER_USER);
                
                typedUser
                    .setValue('level', 0)
            } break;
        }

        context.store.user.put(userId, internalUser.toBuffer());

        return null;
    });
}

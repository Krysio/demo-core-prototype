import { Context } from "@/context";
import $$, { TYPE_USER_ADMIN, TYPE_USER_PUBLIC, TYPE_USER_USER, Uleb128 } from "@/models/structure";
import BufferWrapper from "@/libs/BufferWrapper";

export default function(rawContext: unknown) {
    const context = rawContext as Context;

    return {
        async getUserById(
            userId: number
        ) {
            const buffUser = await context.store.user.get(userId);

            if (buffUser === null) {
                return null;
            }

            const user = $$.create('User').fromBuffer(buffUser.seek(0));
            const userType = user.getValue('type', Uleb128);

            switch (userType) {
                case TYPE_USER_ADMIN: 
                case TYPE_USER_USER: 
                case TYPE_USER_PUBLIC: {
                    const typedUser = user.asType(TYPE_USER_USER);

                    if (Date.now() < typedUser.getValue('timeStart')) {
                        return null;
                    }
                    if (Date.now() >= typedUser.getValue('timeEnd')) {
                        await context.store.user.del(userId);
                        return null;
                    }
                } break;
            }

            return user;
        },
        storeUserWithId(
            userId: number,
            buffUser: BufferWrapper
        ) {
            return context.store.user.put(userId, buffUser);
        },
        removeUserById(
            userId: number
        ) {
            return context.store.user.del(userId);
        }
    };
}
import { Context } from "@/context";
import $$, { TYPE_USER_USER, Uleb128 } from "@/models/structure";
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
                case TYPE_USER_USER: {
                    const typedUser = user.asType(TYPE_USER_USER);

                    if (Date.now() < typedUser.getValue('timeStart')) {
                        return null;
                    }
                    if (Date.now() >= typedUser.getValue('timeEnd')) {
                        return null;
                    }
                } break;
            }

            return user;
        },
        async getUserEndorsingListById(
            userId: number
        ) {
            return [];
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
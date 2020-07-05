import { Context } from "@/context";
import $$ from "@/models/structure";
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

            return $$.create('User').fromBuffer(buffUser.seek(0));
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
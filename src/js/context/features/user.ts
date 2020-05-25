import { Context } from "@/context";
import { User } from "@/models/user";

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

            return User.fromBuffer(buffUser);
        },
        storeUserWithId(
            userId: number,
            buffUser: Buffer
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
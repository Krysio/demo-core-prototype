import BufferWrapper from "@/libs/BufferWrapper";

import Base from "./Base"
export { Base as UserAny };

import UserRoot from "./Root";
export * from "./Root";
import UserAdmin from "./Admin";
export * from "./Admin";
import UserUser from "./User";
export * from "./User";
import UserPublic from "./Public";
export * from "./Public";

const UserTypes = {
    ...UserRoot,
    ...UserAdmin,
    ...UserUser,
    ...UserPublic
};
type UserType = keyof typeof UserTypes;

export class User {
    constructor() {throw new Error();}
    static create<Key extends UserType, Type extends typeof UserTypes[Key]>(
        type: Key
    ) {
        return new UserTypes[type]() as InstanceType<Type>;
    }
    static fromBuffer(
        inputBuff: Buffer
    ) {
        const buff = BufferWrapper.create(inputBuff).seek(0);
        const type = buff.readUleb128() as UserType;
        const instance = this.create(type);

        instance.setDataFromBufferWrapper(buff);
        return instance;
    }
}

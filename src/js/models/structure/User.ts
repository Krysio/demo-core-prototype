import { Base, structure, typedStructure } from "./base";
import BufferWrapper from "@/libs/BufferWrapper";
import { ArrayOfUleb128, Uleb128 } from "./Uleb128";
import { Key } from "./Key";

/******************************/

export const TYPE_USER_ROOT = 0;
export const TYPE_USER_ADMIN = 1;
export const TYPE_USER_USER = 2;
export const TYPE_USER_PUBLIC = 3;

/******************************/

// TODO zamiast time start użyć suspendEnd

export class User extends typedStructure({
    'type': {
        [TYPE_USER_ROOT]: class UserRoot extends structure({
            'key': Key
        }) {
            //@ts-ignore
            getValue(key: string, field?: any) {
                if (key === 'level') {
                    return 0;
                }
                //@ts-ignore
                return super.getValue(key, field);
            }
            //@ts-ignore
            get(key: string, field?: any) {
                if (key === 'level') {
                    return new Uleb128().init().setValue(0);
                }
                //@ts-ignore
                return super.get(key, field);
            }
        },
        [TYPE_USER_ADMIN]: structure({
            'userId': Uleb128,
            'level': Uleb128,
            'key': Key,
            'timeStart': Uleb128,
            'timeEnd': Uleb128
        }),
        [TYPE_USER_USER]: structure({
            'userId': Uleb128,
            'level': Uleb128,
            'key': Key,
            'timeStart': Uleb128,
            'timeEnd': Uleb128
        }),
        [TYPE_USER_PUBLIC]: structure({
            'userId': Uleb128,
            'key': Key,
            'timeStart': Uleb128,
            'timeEnd': Uleb128
        }),
    }
}) {
    isRoot() {
        const type = this.get("type").getValue() as number;
        return type === TYPE_USER_ROOT;
    }
    isAdmin() {
        const type = this.get("type").getValue() as number;
        return type === TYPE_USER_ADMIN;
    }
    isAdminLike() {
        const type = this.get("type").getValue() as number;
        return type === TYPE_USER_ROOT || type === TYPE_USER_ADMIN;
    }
    isUser() {
        const type = this.get("type").getValue() as number;
        return type === TYPE_USER_USER;
    }
    isPublic() {
        const type = this.get("type").getValue() as number;
        return type === TYPE_USER_PUBLIC;
    }
    isUserLike() {
        const type = this.get("type").getValue() as number;
        return type === TYPE_USER_USER || type === TYPE_USER_PUBLIC;
    }
}

export class InternalUser extends typedStructure({
    'type': {
        [TYPE_USER_ROOT]: structure({
            'key': Key
        }),
        [TYPE_USER_ADMIN]: structure({
            'userId': Uleb128,
            'level': Uleb128,
            'key': Key,
            'timeStart': Uleb128,
            'timeEnd': Uleb128
        }),
        [TYPE_USER_USER]: structure({
            'userId': Uleb128,
            'level': Uleb128,
            'key': Key,
            'timeStart': Uleb128,
            'timeEnd': Uleb128
        }),
        [TYPE_USER_PUBLIC]: structure({
            'userId': Uleb128,
            'key': Key,
            'timeStart': Uleb128,
            'timeEnd': Uleb128
        })
    }
}) {}

const negativeFilter = (protoUser: ProtoShadowUser) => !protoUser.isValid();
export class ProtoShadowUser extends structure({
    'userId': Uleb128,
    'key': Key
}){}
export class ArrayOfShadowUser extends Base<ProtoShadowUser[]> {
    protected value = null as ProtoShadowUser[];

    public fromBuffer(buffer: BufferWrapper) {
        const length = buffer.readUleb128();

        this.value = [];
        for (let i = 0; i < length; i++) {
            this.value.push(
                (new ProtoShadowUser()).init().fromBuffer(buffer)
            );
        }
        return this;
    }

    public toBuffer() {
        if (this.isValid() === false) {
            throw new Error();
        }
        const toConcat = [
            BufferWrapper.numberToUleb128Buffer(this.value.length)
        ];
        for (let protoUser of this.value) {
            toConcat.push(protoUser.toBuffer());
        }
        return BufferWrapper.concat(toConcat);
    }
    
    public isValid() {
        return this.value !== null && this.value.filter(negativeFilter).length === 0;
    }
}
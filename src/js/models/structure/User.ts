import { structure, typedStructure } from "./Base";
import { Uleb128 } from "./Uleb128";
import { Key } from "./Key";

/******************************/

export const TYPE_USER_ROOT = 0;
export const TYPE_USER_ADMIN = 1;
export const TYPE_USER_USER = 2;
export const TYPE_USER_PUBLIC = 3;

/******************************/

export class User extends typedStructure({
    'type': {
        [TYPE_USER_ROOT]: structure({
            'key': Key
        }),
        [TYPE_USER_ADMIN]: structure({
            'userId': Uleb128,
            'level': Uleb128,
            'key': Key
        }),
        [TYPE_USER_USER]: structure({
            'userId': Uleb128,
            'key': Key
        }),
        [TYPE_USER_PUBLIC]: structure({
            'userId': Uleb128,
            'key': Key
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
}

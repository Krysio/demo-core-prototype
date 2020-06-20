import { BaseStructure, defineTypes, Uleb128, Key } from "@/models/structure";

/******************************/

export const TYPE_USER_ROOT = 0;
export const TYPE_USER_ADMIN = 1;
export const TYPE_USER_USER = 2;
export const TYPE_USER_PUBLIC = 3;

/******************************/

export class User extends BaseStructure {
    protected schema = {
        'type': defineTypes({
            [TYPE_USER_ROOT]: class UserRoot extends User {
                protected schema = {
                    'key': Key
                };
            },
            [TYPE_USER_ADMIN]: class UserAdmin extends User {
                protected schema = {
                    'userId': Uleb128,
                    'level': Uleb128,
                    'key': Key
                };
            },
            [TYPE_USER_USER]: class UserUser extends User {
                protected schema = {
                    'userId': Uleb128,
                    'key': Key
                };
            },
            [TYPE_USER_PUBLIC]: class UserPublic extends User {
                protected schema = {
                    'userId': Uleb128,
                    'key': Key
                };
            }
        })
    };

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

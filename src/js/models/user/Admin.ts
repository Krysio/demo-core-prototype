import Base from "./Base";

/******************************/

export const TYPE_USER_ADMIN = 1;
export class UserAdmin extends Base {
    protected type = TYPE_USER_ADMIN;
}
export default {
    [TYPE_USER_ADMIN]: UserAdmin
};

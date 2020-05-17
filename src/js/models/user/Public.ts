import Base from "./Base";

/******************************/

export const TYPE_USER_PUBLIC = 3;
export class UserPublic extends Base {
    protected type = TYPE_USER_PUBLIC;
}
export default {
    [TYPE_USER_PUBLIC]: UserPublic
};

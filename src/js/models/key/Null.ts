import Base from "./Base";

/******************************/

export const TYPE_KEY_NULL = 0;
Base.defineType(TYPE_KEY_NULL, class NullKey extends Base {
    verify() {
        if (process.env.NODE_ENV === 'production') {
            return false;
        }
        return true;
    }
});

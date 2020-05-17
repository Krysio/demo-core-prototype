import Base from "./Base";
import * as secp256k1 from "@/services/crypto/ec/secp256k1";

/******************************/

export const TYPE_KEY_Secp256k1 = 1;
Base.defineType(TYPE_KEY_Secp256k1, class Secp256k1 extends Base {
    verify() {
        return secp256k1.isValidPublicKey(this.getData() as Buffer);
    }
});

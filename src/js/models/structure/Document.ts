import { Hash } from "./Hash";
import { Uleb128 } from "./Uleb128";
import { structure, typedStructure } from "./base";

/******************************/

/**
 * Flags [unset/set]
 * 1 - integer / float
 * 2 - negative - disallow / allow
 * 4 - linear / logarithmic
 * 8 - flow - allow / disallow
 */
export const FLAG_DOCUMENT_USE_FLOAT = 1;
export const FLAG_DOCUMENT_ALLOW_NEGATIVE = 2;
export const FLAG_DOCUMENT_USE_LOGARITHMIC = 4;
export const FLAG_DOCUMENT_DISABLE_FLOW = 8;

export const FILE_FORMAT_TXT = 0;
export const FILE_FORMAT_MARKDOWN = 1;

/******************************/

export class Document extends structure({
    'documentId': Uleb128,
    'timeStart': Uleb128,
    'timeEnd': Uleb128,
    'countOfOptions': Uleb128,
    'countOfCredits': Uleb128,
    'distribution': Uleb128,
    'documentHash': Hash,
}) {
    isValid() {
        if (this.getValue('countOfOptions') < 1
            || this.getValue('countOfCredits') < 1
        ) {
            return false;
        }
        if (this.getValue('distribution') > 0xf) {
            return false;
        }

        return super.isValid();
    }
}

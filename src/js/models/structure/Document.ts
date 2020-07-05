import { Hash } from "./Hash";
import { Uleb128 } from "./Uleb128";
import { structure, typedStructure } from "./base";

/******************************/

/*
Neg Type
0   00 - unsignet integer
0   01 - unsignet float
0   11 - unsignet logaritmic
1   00 - integer
1   01 - float
1   11 - logaritmic
*/
export const TYPE_CREDIT_DISTRIBUTION_UINT = 0;
export const TYPE_CREDIT_DISTRIBUTION_UFLOAT = 1;
export const TYPE_CREDIT_DISTRIBUTION_ULOG = 3;
export const TYPE_CREDIT_DISTRIBUTION_INT = 4;
export const TYPE_CREDIT_DISTRIBUTION_FLOAT = 5;
export const TYPE_CREDIT_DISTRIBUTION_LOG = 7;

export const FILE_FORMAT_TXT = 0;
export const FILE_FORMAT_MARKDOWN = 1;

type CreditDistribution =
    typeof TYPE_CREDIT_DISTRIBUTION_UINT |
    typeof TYPE_CREDIT_DISTRIBUTION_UFLOAT |
    typeof TYPE_CREDIT_DISTRIBUTION_ULOG |
    typeof TYPE_CREDIT_DISTRIBUTION_INT |
    typeof TYPE_CREDIT_DISTRIBUTION_FLOAT |
    typeof TYPE_CREDIT_DISTRIBUTION_LOG;

type FileType =
    typeof FILE_FORMAT_TXT |
    typeof FILE_FORMAT_MARKDOWN;

/******************************/

export class Document extends structure({
    'authorId': Uleb128,
    'timeEnd': Uleb128,
    'fileHash': Hash,
    'fileType': Uleb128,
    'countOfOptions': Uleb128,
    'countOfCredits': Uleb128,
    'typeDistribution': Uleb128,
}) {
    isValid() {
        let result = false;

        if (this.get('countOfOptions').getValue() < 1
            || this.get('countOfCredits').getValue() < 1
        ) {
            result = false;
        }

        return result && super.isValid();
    }
}

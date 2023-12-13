import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import {
    TxnStandalone,
    Uleb128, BlockHash,
    TYPE_TXN_SIGNATURE_ADMIN,
    TYPE_TXN_SIGNATURE_USER,
    TYPE_TXN_SIGNATURE_GROUP,
    User, Blob, ArrayOfUleb128, ArrayOfBlob, TYPE_USER_USER, TYPE_TXN_REPLACE_USERS
} from "@/models/structure";
import {
    ruleTxnOnlyEvenBlockIndex,
    ruleTxnSignatureType,
    ruleTxnAuthorUserType
} from "../rules";
import { Block } from "@/models/block";
import Time from "@/services/Time";
import BufferWrapper from "@/libs/BufferWrapper";
import { timeEnd } from "console";

/******************************/

export default function moduleTxnValidator(ctx: unknown) {
    const context = ctx as Context;

    return createModule(async (
        txn: TxnStandalone
    ) => {
        if (!txn.isValid()) {
            console.log('🔴', `Transakcja niepooprawna`, txn);
            return null;
        }


        const version = txn.getValue('version');
        const type = txn.getValue('type');
        const validAuthorUserTypes = ruleTxnAuthorUserType.get(type);
        const signatureType = ruleTxnSignatureType.get(type);
        const result = { txn, type } as {
            txn: TxnStandalone,
            type: number,
            blockHash?: string,
            blockIndex?: number,
            author?: User,
            authors?: User[]
        };

        const firstTopBlock = context.getTopBlock();
        const secondTopBlock = context.getSecondTopBlock();
        const config = context.getConfig();
        const timeLimit = Math.min(
            5*60e3,
            Math.ceil(config.getDiscreteBlockPeriod() / 2)
        );
        let block: Block;
        // widełki czasowe na podpisanie bloku
        switch (signatureType) {
            case TYPE_TXN_SIGNATURE_ADMIN: {
                const signingBlockIndex = txn.getValue('signingBlockIndex', Uleb128);

                // czy ten block index można teraz podpisywać
                if (firstTopBlock.getIndex() === signingBlockIndex) {
                    block = firstTopBlock;
                } else {
                    if (secondTopBlock.getIndex() === signingBlockIndex) {
                        block = secondTopBlock;
                        if (Time.now() > firstTopBlock.getTime() + timeLimit) {
                            console.log('🔴', `Czas miną na podpisywanie tego bloku {${signingBlockIndex}}`, txn);
                            return null;
                        }
                    } else {
                        console.log('🔴', `Nie znaleziono bloku {${signingBlockIndex}}`, txn);
                        return null;
                    }
                }

                result.blockIndex = signingBlockIndex;
            } break;
            case TYPE_TXN_SIGNATURE_USER:
            case TYPE_TXN_SIGNATURE_GROUP: {
                const signingBlockHash = txn.get('signingBlockHash', BlockHash).getValue();

                // czy ten block index można teraz podpisywać
                if (
                    BufferWrapper.compare(
                        firstTopBlock.getHash(),
                        signingBlockHash
                    ) === 0
                ) {
                    block = firstTopBlock;
                } else {
                    if (
                        BufferWrapper.compare(
                            secondTopBlock.getHash(),
                            signingBlockHash
                        ) === 0
                    ) {
                        block = secondTopBlock;
                        if (Time.now() > firstTopBlock.getTime() + timeLimit) {
                            console.log('🔴', `Czas miną na podpisywanie tego bloku {${signingBlockHash}}`, txn);
                            return null;
                        }
                    } else {
                        console.log('🔴', `Nie znaleziono bloku {${signingBlockHash}}`, txn);
                        return null;
                    }
                }

                result.blockHash = signingBlockHash.toString('hex');
            } break;
            default: {
                console.log('🔴', `Nieznany typ sygnatury {${type}}`, txn);
                return null;
            };
        }

        // transakcja może trafić tylko do bloku o ideksie parzystym
        if (ruleTxnOnlyEvenBlockIndex.get(type)) {
            if (block.getIndex() % 2) {
                console.log('🔴', `Tylko pażyste bloki`, txn);
                return null;
            }
        }

        // podpis
        switch (signatureType) {
            case TYPE_TXN_SIGNATURE_ADMIN:
            case TYPE_TXN_SIGNATURE_USER: {
                const authorId = txn.getValue('author', Uleb128);
                const signature = txn.get('signature', Blob).getValue();

                if (!signature.length) {
                    console.log('🔴', `Brak podpisu`, txn);
                    return null;
                }

                const author = await context.getUserById(authorId) as User;

                // autor nie istnieje
                if (author === null) {
                    console.log('🔴', `Autor nie istnieje {${authorId}}`, txn);
                    return null;
                }

                const authorType = author.getValue('type', Uleb128);

                // typ autora
                if (validAuthorUserTypes.indexOf(authorType) === -1) {
                    console.log('🔴', `Nieporawny typ autora {${authorType}}{${validAuthorUserTypes}}`, txn);
                    return null;
                }

                if (authorType === TYPE_USER_USER) {
                    const buildBlockTime = block.getTime() + config.getDiscreteBlockPeriod() * 2;
                    const authorTimeEnd = author.getValue('timeEnd', Uleb128);
    
                    // autor będzie nadal aktywny w czasie tworzenia bloku
                    if (buildBlockTime > authorTimeEnd) {
                        console.log('🔴', `Autor zostanie dezaktywowany przed utworzeniem bloku {${authorId}}`, txn);
                        return null;
                    }
                }

                const authorKey = author.get('key');
                const txnHash = txn.getHash();

                // weryfikacja podpisu
                if (!authorKey.verify(txnHash, signature)) {
                    console.log('🔴', `Podpis niepoprawny {${authorId}}`, txn);
                    return null;
                }

                result.author = author;
            } break;
            case TYPE_TXN_SIGNATURE_GROUP: {
                const authorList = txn.getValue('authors', ArrayOfUleb128);
                const signatureList = txn.getValue('signatures', ArrayOfBlob);
                const txnHash = txn.getHash();
                const authors = [] as User[];
                const timeEnd = txn.asType(TYPE_TXN_REPLACE_USERS).get('data').getValue('timeEnd');
                
                if (!signatureList.length) {
                    console.log('🔴', `Brak podpisów`, txn);
                    return null;
                }
                
                if (!authorList.length) {
                    console.log('🔴', `Brak autorów`, txn);
                    return null;
                }
                
                if (authorList.length !== signatureList.length) {
                    console.log('🔴', `Liczba autorów !== liczba podpisów`, txn);
                    return null;
                }

                for (let i = 0; i < authorList.length; i++) {
                    const authorId = authorList[ i ];
                    const signature = signatureList[ i ].getValue();
                    const author = await context.getUserById(authorId) as User;

                    // autor nie istnieje
                    if (author === null) {
                        console.log('🔴', `Autor nie istnieje [${i}/${authorList.length}]{${authorId}}`, txn);
                        return null;
                    }

                    const authorType = author.getValue('type', Uleb128);
                    const authorTimeEnd = author.getValue('timeEnd', Uleb128);
    
                    // autor będzie nadal aktywny do czasu wygaśnięcia nowego użytkownika
                    if (authorTimeEnd < timeEnd) {
                        console.log('🔴', `Autor zostanie dezaktywowany w trakcie życia nowego konta {${authorId}}`, txn);
                        return null;
                    }    

                    const authorKey = author.get('key');
    
                    // typ autora
                    if (validAuthorUserTypes.indexOf(authorType) === -1) {
                        console.log('🔴', `Nieporawny typ autora [${i}/${authorList.length}]{${authorType}}{${validAuthorUserTypes}}`, txn);
                        return null;
                    }
                    // weryfikacja podpisu
                    if (!authorKey.verify(txnHash, signature)) {
                        console.log('🔴', `Podpis niepoprawny [${i}/${authorList.length}]{${authorId}}`, txn);
                        return null;
                    }
                }

                result.authors = authors;
            } break;
            default: return null;
        }

        return result;
    });
}

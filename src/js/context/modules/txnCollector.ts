import { Context } from "@/context";
import { createModule } from "@/libs/Module";
import Structure, { TypeTxnStandaloneScope } from "@/models/structure";
import { ruleTxnResourceReserve } from "../rules";
import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

const emptyList = [];
type Slot = {
    list: BufferWrapper[],
    reservedResources: string[]
};

/******************************/

export default function moduleTxnCollector(ctx: unknown) {
    const context = ctx as Context;

    const storeByIndex = new Map<number, Slot>();
    const storeByHash = new Map<string, Slot>();

    return createModule(async (args: TypeTxnStandaloneScope) => {
        const { txn, type } = args;
        const internalTxn = Structure.create('TxnInternal').fromStructure(txn);
        const txnBuffer = internalTxn.toBuffer();
        const ruleResourceReserve = ruleTxnResourceReserve.get(type);
        
        // pobieranie lub tworzenie slotu
        let slot: Slot;
        if (args.blockIndex !== undefined) {
            slot = storeByIndex.get(args.blockIndex);
        } else {
            slot = storeByHash.get(args.blockHash);
        }
        if (!slot) {
            slot = {
                list: [],
                reservedResources: []
            };
            if (args.blockIndex !== undefined) {
                storeByIndex.set(args.blockIndex, slot);
            } else {
                storeByHash.set(args.blockHash, slot);
            }
        }
    
        // zajmowanie zasobów, np userId, kto pierwszy ten lepszy
        if (ruleResourceReserve) {
            const resourcesToReserve = ruleResourceReserve.map(F => F(txn));

            for (let resource of resourcesToReserve) {
                if (slot.reservedResources.indexOf(resource) !== -1) {
                    return null;
                }
                slot.reservedResources.push(resource);
            }
        }
        
        // magazynowanie transakcji aby włączyć je potem do bloku
        slot.list.push(txnBuffer);

        return args;
    },
    //#region API
    {
        getTxnForBlockByIndex(
            index: number,
            remove = true
        ) {
            const slot = storeByIndex.get(index);

            if (slot) {
                if (remove) {
                    storeByIndex.delete(index);
                }
                return slot.list;
            }
            return emptyList;
        },
        getTxnForBlockByHash(
            hash: string,
            remove = true
        ) {
            const slot = storeByHash.get(hash);

            if (slot) {
                if (remove) {
                    storeByHash.delete(hash);
                }
                return slot.list;
            }
            return emptyList;
        }
    }
    //#endregion
    );
}

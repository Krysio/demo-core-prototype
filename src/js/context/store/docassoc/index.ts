import BufferWrapper from "@/libs/BufferWrapper";

class DocumentAssociacionStore {
    map = new Map<number, number[]>();

    async put(
        key: number,
        data: number[]
    ) {
        this.map.set(key, data);
    }
    async get(key: number) {
        return this.map.get(key) || null;
    }
    async del(key: number) {
        this.map.delete(key);
    }
}

export default function() {
    return new DocumentAssociacionStore();
}

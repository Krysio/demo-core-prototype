import BufferWrapper from "@/libs/BufferWrapper";

class UserStore {
    map = new Map<number, BufferWrapper>();

    async put(
        key: number,
        data: BufferWrapper
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
    return new UserStore();
}

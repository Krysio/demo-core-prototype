class UserStore {
    map = new Map<number, Buffer>();

    async put(
        key: number,
        data: Buffer
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

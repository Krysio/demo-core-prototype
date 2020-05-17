class KeyStore {
    map = new Map<number, Buffer>();

    put(
        key: number,
        data: Buffer
    ) {
        this.map.set(key, data);
    }
    get(key: number) {
        return this.map.get(key) || null;
    }
}

export default function() {
    return new KeyStore();
}

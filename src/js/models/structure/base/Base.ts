import BufferWrapper from "@/libs/BufferWrapper";

/******************************/

export abstract class Base<T> {
    protected value: T;
    protected parent: Base<{}> = null;
    protected $buffer = null as null | BufferWrapper;
    protected $cursor = -1;
    protected $prototype = Object.getPrototypeOf(this);

    public setValue(value: T) {
        this.value = value;
        return this;
    }
    public getValue() {
        return this.value;
    }

    public get(): never { throw new Error() };
    public set(): never { throw new Error };

    public fromBuffer(buffer: BufferWrapper): this { throw new Error() };
    public toBuffer(): BufferWrapper { throw new Error };
    public hex() {return this.toBuffer().toString('hex');}
    public init() {return this;}

    public getParent() {
        return this.parent;
    }
    public setParent(value: Base<unknown>) {
        this.parent = value;
        return this;
    }

    public isValid() {
        return true;
    }

    public fromStructure(
        element: Base<T>
    ) {
        this.setValue(element.getValue());
        return this;
    }
}

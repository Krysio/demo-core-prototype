import BufferWrapper from "@/libs/BufferWrapper";
import { Base, BaseStructure } from "./Base";

export function defineTypes(
    variants: {[key: number]: typeof BaseStructure}
) {
    return class Type extends Base {
        protected value: number = -1;
        protected structureConstructor: typeof BaseStructure = null;
        protected structureInstance: BaseStructure = null;

        readBuffer() {
            if (this.buffer.cursor === -1) {
                return this;
            }

            this.$cursorStart = this.buffer.cursor;
            this.value = this.buffer.readUleb128();
            this.structureConstructor = variants[ this.value ];
            this.$cursorEnd = this.buffer.cursor;

            if (this.structureConstructor !== undefined) {
                this.structureInstance = this.structureConstructor
                    .create(
                        this.buffer,
                        '-',
                        this.getParent(),
                        {
                            override: true
                        }
                    ) as BaseStructure;

                Object.setPrototypeOf(this.getParent(), this.structureConstructor.prototype);
            } else {
                this.structureInstance = null;
                this.structureConstructor = null;
                this.getParent().setInvalid(true)
            }

            return this;
        }

        toBuffer() {
            return BufferWrapper.numberToUleb128Buffer(this.value);
        }

        setValue(
            newValue: number
        ) {
            this.value = newValue;
            this.structureConstructor = variants[ newValue ];

            if (this.structureConstructor !== undefined) {
                const additionalFileds = this.structureConstructor
                    .create(
                        this.buffer,
                        '-',
                        this.getParent(),
                        {
                            override: true
                        }
                    ) as BaseStructure;

                Object.setPrototypeOf(this.getParent(), this.structureConstructor.prototype);
            } else {
                this.getParent().setInvalid(true)
            }

            return this;
        }
    };
}

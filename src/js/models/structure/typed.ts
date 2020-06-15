import BufferWrapper from "@/libs/BufferWrapper";
import { Base, BaseStructure } from "./Base";

export function defineTypes(
    variants: {[key: number]: typeof BaseStructure}
) {
    return class Type extends Base {
        protected value: number = -1;
        protected structure: typeof BaseStructure;

        readBuffer() {
            if (this.buffer.cursor === -1) {
                return this;
            }

            this.$cursorStart = this.buffer.cursor;
            this.value = this.buffer.readUleb128();
            this.structure = variants[ this.value ];
            this.$cursorEnd = this.buffer.cursor;

            if (this.structure !== undefined) {
                this.structure
                    .create(
                        this.buffer,
                        '-',
                        this.getParent(),
                        {
                            override: true
                        }
                    ) as BaseStructure;

                Object.setPrototypeOf(this.getParent(), this.structure.prototype);
            } else {
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
            this.structure = variants[ newValue ];

            if (this.structure !== undefined) {
                const additionalFileds = this.structure
                    .create(
                        this.buffer,
                        '-',
                        this.getParent(),
                        {
                            override: true
                        }
                    ) as BaseStructure;

                Object.setPrototypeOf(this.getParent(), this.structure.prototype);
            } else {
                this.getParent().setInvalid(true)
            }

            return this;
        }
    };
}

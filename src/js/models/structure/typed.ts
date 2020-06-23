import BufferWrapper from "@/libs/BufferWrapper";
import { Base, BaseStructure } from "./Base";
import $$ from "./";

export function defineTypes(
    variants: { [key: number]: typeof BaseStructure }
) {
    return class Type extends Base {
        protected value: number = -1;
        protected structureConstructor: typeof BaseStructure = null;
        protected structureInstance: BaseStructure = null;

        fromBuffer() {
            if (this.buffer.cursor === -1) {
                return this;
            }

            this.$cursorStart = this.buffer.cursor;
            this.value = this.buffer.readUleb128();
            this.structureConstructor = variants[this.value];
            this.$cursorEnd = this.buffer.cursor;

            if (this.structureConstructor !== undefined) {
                this.structureInstance = $$
                    .create(this.structureConstructor)
                    .fromBuffer(this.buffer) as BaseStructure;

                for (let subField of this.structureInstance) {
                    this.getParent().set(subField.getName(), subField, true);
                }

                Object.setPrototypeOf(this.getParent(), this.structureConstructor.prototype);
            } else {
                this.structureInstance = null;
                this.structureConstructor = null;
                this.getParent().setInvalid(true)
            }

            return this;
        }

        toBuffer() {
            try {
                return BufferWrapper.numberToUleb128Buffer(this.value);
            } catch (error) {
                console.log(this);
                throw error;
            }
        }

        setValue(
            newValue: number
        ) {
            this.value = newValue;
            this.structureConstructor = variants[newValue];

            if (this.structureConstructor !== undefined) {
                this.structureInstance = $$.create(this.structureConstructor) as BaseStructure;

                const parent = this.getParent();
                const parentSchema = parent["originalSchema"] as BaseStructure["schema"];
                const newSchema = {} as BaseStructure["schema"];

                for (let key in parentSchema) {
                    const constructor = parentSchema[ key ];

                    newSchema[ key ] = constructor;

                    //@ts-ignore
                    if (constructor === Type) {
                        Object.assign(newSchema, this.structureInstance["schema"]);
                    }
                }

                for (let subField of this.structureInstance) {
                    this.getParent().set(subField.getName(), subField, true);
                }

            } else {
                this.getParent().setInvalid(true)
            }

            return this;
        }
    };
}

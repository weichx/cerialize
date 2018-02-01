import { MetaData } from "./meta_data";
import { NoOp } from "./string_transforms";
export * from "./serialize";
export * from "./deserialize";
export * from "./annotations";
export * from "./string_transforms";
export function SetSerializeKeyTransform(fn) {
    if (typeof fn === "function") {
        MetaData.serializeKeyTransform = fn;
    }
    else {
        MetaData.serializeKeyTransform = NoOp;
    }
}
export function SetDeserializeKeyTransform(fn) {
    if (typeof fn === "function") {
        MetaData.deserializeKeyTransform = fn;
    }
    else {
        MetaData.deserializeKeyTransform = NoOp;
    }
}
//# sourceMappingURL=index.js.map
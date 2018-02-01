/** @internal */
export function getTarget(type, target, createInstances) {
    if (target !== null && target !== void 0)
        return target;
    if (type !== null && createInstances) {
        return new type();
    }
    return {};
}
/** @internal */
export function isPrimitiveType(type) {
    return (type === String ||
        type === Boolean ||
        type === Number ||
        type === Date ||
        type === RegExp);
}
/** @internal */
export function setBitConditionally(value, bits, condition) {
    if (condition) {
        return value | bits;
    }
    else {
        return value & ~bits;
    }
}
//# sourceMappingURL=util.js.map
import { isPrimitiveType } from "./util";
import { MetaData } from "./meta_data";
export function SerializeMap(source, type) {
    const target = {};
    const keys = Object.keys(source);
    for (var i = 0; i < keys.length; i++) {
        const key = keys[i];
        target[MetaData.serializeKeyTransform(key)] = Serialize(source[key], type);
    }
    return target;
}
export function SerializeArray(source, type) {
    const retn = new Array(source.length);
    for (var i = 0; i < source.length; i++) {
        retn[i] = Serialize(source[i], type);
    }
    return retn;
}
export function SerializePrimitive(source, type) {
    if (source === null || source === void 0) {
        return null;
    }
    if (type === String)
        return source.toString();
    if (type === Boolean)
        return Boolean(source);
    if (type === Number) {
        const value = Number(source);
        if (isNaN(value))
            return null;
        return value;
    }
    if (type === Date)
        return source.toString();
    if (type === RegExp)
        return source.toString();
    return source.toString();
}
export function SerializeJSON(source, transformKeys = true) {
    if (source === null || source === void 0)
        return null;
    if (Array.isArray(source)) {
        const array = new Array(source.length);
        for (var i = 0; i < source.length; i++) {
            array[i] = SerializeJSON(source[i], transformKeys);
        }
        return array;
    }
    const type = typeof source;
    if (type === "object") {
        if (source instanceof Date || source instanceof RegExp) {
            return source.toString();
        }
        else {
            const retn = {};
            const keys = Object.keys(source);
            for (var i = 0; i < keys.length; i++) {
                const key = keys[i];
                const retnKey = transformKeys ? MetaData.serializeKeyTransform(key) : key;
                retn[retnKey] = SerializeJSON(source[key], transformKeys);
            }
            return retn;
        }
    }
    else if (type === "function") {
        return null;
    }
    return source;
}
export function Serialize(instance, type) {
    if (instance === void 0 || instance === null) {
        return null;
    }
    const metadataList = MetaData.getMetaDataForType(type);
    // todo -- maybe move this to a Generic deserialize
    if (metadataList === null) {
        if (isPrimitiveType(type)) {
            return SerializePrimitive(instance, type);
        }
        else {
            return {};
        }
    }
    const target = {};
    for (var i = 0; i < metadataList.length; i++) {
        const metadata = metadataList[i];
        if (metadata.serializedKey === null)
            continue;
        const source = instance[metadata.keyName];
        if (source === void 0)
            continue;
        const keyName = metadata.getSerializedKey();
        const flags = metadata.flags;
        if ((flags & 64 /* SerializeMap */) !== 0) {
            target[keyName] = SerializeMap(source, metadata.serializedType);
        }
        else if ((flags & 16 /* SerializeArray */) !== 0) {
            target[keyName] = SerializeArray(source, metadata.serializedType);
        }
        else if ((flags & 4 /* SerializePrimitive */) !== 0) {
            target[keyName] = SerializePrimitive(source, metadata.serializedType);
        }
        else if ((flags & 16384 /* SerializeObject */) !== 0) {
            target[keyName] = Serialize(source, metadata.serializedType);
        }
        else if ((flags & 256 /* SerializeJSON */) !== 0) {
            target[keyName] = SerializeJSON(source, (flags & 1024 /* SerializeJSONTransformKeys */) !== 0);
        }
        else if ((flags & 4096 /* SerializeUsing */) !== 0) {
            target[keyName] = metadata.serializedType(source);
        }
    }
    if (typeof type.onSerialized === "function") {
        const value = type.onSerialized(target, instance);
        if (value !== void 0) {
            return value;
        }
    }
    return target;
}
//# sourceMappingURL=serialize.js.map
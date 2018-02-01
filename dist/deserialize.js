import { getTarget } from "./util";
import { MetaData } from "./meta_data";
export function DeserializeMap(data, type, target, createInstances = true) {
    if (typeof data !== "object") {
        throw new Error("Expected input to be of type `object` but received: " + typeof data);
    }
    if (target === null || target === void 0)
        target = {};
    const keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
        const key = keys[i];
        target[MetaData.deserializeKeyTransform(key)] = Deserialize(data[key], type, target[key], createInstances);
    }
    return target;
}
export function DeserializeArray(data, type, target, createInstances = true) {
    if (!Array.isArray(data)) {
        throw new Error("Expected input to be an array but received: " + typeof data);
    }
    if (!Array.isArray(target))
        target = [];
    target.length = data.length;
    for (var i = 0; i < data.length; i++) {
        target[i] = Deserialize(data[i], type, target[i], createInstances);
    }
    return target;
}
function DeserializePrimitive(data, type, target) {
    if (type === Date) {
        const deserializedDate = new Date(data);
        if (target instanceof Date) {
            target.setTime(deserializedDate.getTime());
        }
        else {
            return deserializedDate;
        }
    }
    else if (type === RegExp) {
        return new RegExp(data);
    }
    else {
        return type(data);
    }
    // if anything else -- return null or maybe throw an error
}
export function DeserializeJSON(data, transformKeys = true, target) {
    if (data === null || data === void 0) { }
    if (Array.isArray(data)) {
        if (!Array.isArray(target))
            target = new Array(data.length);
        target.length = data.length;
        for (var i = 0; i < data.length; i++) {
            target[i] = DeserializeJSON(data[i], transformKeys, target[i]);
        }
        return target;
    }
    const type = typeof data;
    if (type === "object") {
        const retn = (target && typeof target === "object" ? target : {});
        const keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            const retnKey = transformKeys ? MetaData.deserializeKeyTransform(key) : key;
            retn[retnKey] = DeserializeJSON(data[key], transformKeys);
        }
        return retn;
    }
    else if (type === "function") {
        throw new Error("Cannot deserialize a function, input is not a valid json object");
    }
    //primitive case
    return data;
}
export function Deserialize(data, type, target, createInstances = true) {
    const metadataList = MetaData.getMetaDataForType(type);
    if (metadataList === null) {
        return null;
    }
    target = getTarget(type, target, createInstances);
    for (var i = 0; i < metadataList.length; i++) {
        const metadata = metadataList[i];
        if (metadata.deserializedKey === null)
            continue;
        const source = data[metadata.getDeserializedKey()];
        if (source === void 0)
            continue;
        const keyName = metadata.keyName;
        const flags = metadata.flags;
        if ((flags & 2 /* DeserializePrimitive */) !== 0) {
            target[keyName] = DeserializePrimitive(source, metadata.deserializedType, target[keyName]);
        }
        else if ((flags & 8192 /* DeserializeObject */) !== 0) {
            target[keyName] = Deserialize(source, metadata.deserializedType, target[keyName], createInstances);
        }
        else if ((flags & 32 /* DeserializeMap */) !== 0) {
            target[keyName] = DeserializeMap(source, metadata.deserializedType, target[keyName], createInstances);
        }
        else if ((flags & 8 /* DeserializeArray */) !== 0) {
            target[keyName] = DeserializeArray(source, metadata.deserializedType, target[keyName], createInstances);
        }
        else if ((flags & 128 /* DeserializeJSON */) !== 0) {
            target[keyName] = DeserializeJSON(source, (flags & 512 /* DeserializeJSONTransformKeys */) !== 0, createInstances);
        }
        else if ((flags & 2048 /* DeserializeUsing */) !== 0) {
            target[keyName] = metadata.deserializedType(source, target[keyName], createInstances);
        }
    }
    const ctor = target.constructor;
    if (ctor && typeof ctor.onDeserialized === "function") {
        ctor.onDeserialized(data, target, createInstances);
    }
    return target;
}
//# sourceMappingURL=deserialize.js.map
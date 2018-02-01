import {Indexable, isPrimitiveType, JsonObject, JsonType, SerializablePrimitiveType, SerializableType} from "./util";
import {MetaData, MetaDataFlag} from "./meta_data";

export function SerializeMap<T>(source : T, type : SerializableType<T>) : Indexable<JsonType> {
    const target : Indexable<JsonType> = {};
    const keys = Object.keys(source);

    for (var i = 0; i < keys.length; i++) {
        const key = keys[i];
        target[MetaData.serializeKeyTransform(key)] = Serialize((source as any)[key], type);
    }

    return target;
}

export function SerializeArray<T>(source : Array<T>, type : SerializableType<T>) : Array<JsonType> {
    const retn = new Array<JsonType>(source.length);
    for (var i = 0; i < source.length; i++) {
        retn[i] = Serialize(source[i], type);
    }
    return retn;
}

export function SerializePrimitive<T>(source : SerializablePrimitiveType, type : SerializablePrimitiveType) : JsonType {

    if (source === null || source === void 0) {
        return null;
    }

    if (type === String) return source.toString();

    if (type === Boolean) return Boolean(source);

    if (type === Number) {
        const value = Number(source);
        if (isNaN(value)) return null;
        return value;
    }

    if (type === Date) return source.toString();

    if (type === RegExp) return source.toString();

    return source.toString();

}

export function SerializeJSON(source : any, transformKeys = true) : JsonType {
    if (source === null || source === void 0) return null;

    if (Array.isArray(source)) {
        const array = new Array<any>(source.length);
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
            const retn : Indexable<JsonType> = {};
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

export function Serialize<T>(instance : T, type : SerializableType<T>) : JsonObject {

    if (instance === void 0 || instance === null) {
        return null;
    }

    const metadataList = MetaData.getMetaDataForType(type);

    // todo -- maybe move this to a Generic deserialize
    if (metadataList === null) {
        if (isPrimitiveType(type)) {
            return SerializePrimitive(instance as any, type as any) as any;
        }
        else {
            return {};
        }
    }

    const target : Indexable<JsonType> = {};

    for (var i = 0; i < metadataList.length; i++) {
        const metadata = metadataList[i];

        if (metadata.serializedKey === null) continue;

        const source = (instance as any)[metadata.keyName];

        if (source === void 0) continue;

        const keyName = metadata.getSerializedKey();
        const flags = metadata.flags;

        if ((flags & MetaDataFlag.SerializeMap) !== 0) {
            target[keyName] = SerializeMap(source, metadata.serializedType);
        }
        else if ((flags & MetaDataFlag.SerializeArray) !== 0) {
            target[keyName] = SerializeArray(source, metadata.serializedType);
        }
        else if ((flags & MetaDataFlag.SerializePrimitive) !== 0) {
            target[keyName] = SerializePrimitive(source, metadata.serializedType as SerializablePrimitiveType);
        }
        else if ((flags & MetaDataFlag.SerializeObject) !== 0) {
            target[keyName] = Serialize(source, metadata.serializedType);
        }
        else if ((flags & MetaDataFlag.SerializeJSON) !== 0) {
            target[keyName] = SerializeJSON(source, (flags & MetaDataFlag.SerializeJSONTransformKeys) !== 0);
        }
        else if ((flags & MetaDataFlag.SerializeUsing) !== 0) {
            target[keyName] = (metadata.serializedType as any)(source);
        }

    }

    if (typeof type.onSerialized === "function") {
        const value = type.onSerialized(target, instance);
        if (value !== void 0) {
            return value as JsonObject;
        }
    }

    return target;
}

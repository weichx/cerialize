import { MetaData } from "./meta_data";
import { isPrimitiveType, setBitConditionally } from "./util";
export function serializeUsing(serializer, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.serializedKey = (keyName) ? keyName : actualKeyName;
        metadata.serializedType = serializer;
        metadata.flags |= 4096 /* SerializeUsing */;
    };
}
export function serializeAs(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.serializedKey = (keyName) ? keyName : actualKeyName;
        metadata.serializedType = type;
        metadata.flags |= 16384 /* SerializeObject */;
        metadata.flags = setBitConditionally(metadata.flags, 4 /* SerializePrimitive */, isPrimitiveType(type));
    };
}
export function serializeAsArray(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.serializedKey = (keyName) ? keyName : actualKeyName;
        metadata.serializedType = type;
        metadata.flags |= 16 /* SerializeArray */;
        metadata.flags = setBitConditionally(metadata.flags, 4 /* SerializePrimitive */, isPrimitiveType(type));
    };
}
export function serializeAsMap(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.serializedKey = (keyName) ? keyName : actualKeyName;
        metadata.serializedType = type;
        metadata.flags |= 64 /* SerializeMap */;
        metadata.flags = setBitConditionally(metadata.flags, 4 /* SerializePrimitive */, isPrimitiveType(type));
    };
}
export function serializeAsJson(keyNameOrTransformKeys, transformKeys = true) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.serializedKey = (typeof keyNameOrTransformKeys === "string") ? keyNameOrTransformKeys : actualKeyName;
        metadata.flags |= (256 /* SerializeJSON */);
        const shouldTransformKeys = typeof keyNameOrTransformKeys === "boolean" ? keyNameOrTransformKeys : transformKeys;
        metadata.flags = setBitConditionally(metadata.flags, 1024 /* SerializeJSONTransformKeys */, shouldTransformKeys);
    };
}
export function deserializeUsing(serializer, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.deserializedKey = (keyName) ? keyName : actualKeyName;
        metadata.deserializedType = serializer;
        metadata.flags |= 2048 /* DeserializeUsing */;
    };
}
export function deserializeAs(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.deserializedKey = (keyName) ? keyName : actualKeyName;
        metadata.deserializedType = type;
        metadata.flags |= 8192 /* DeserializeObject */;
        metadata.flags = setBitConditionally(metadata.flags, 2 /* DeserializePrimitive */, isPrimitiveType(type));
    };
}
export function deserializeAsArray(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.deserializedKey = (keyName) ? keyName : actualKeyName;
        metadata.deserializedType = type;
        metadata.flags |= 8 /* DeserializeArray */;
        metadata.flags = setBitConditionally(metadata.flags, 2 /* DeserializePrimitive */, isPrimitiveType(type));
    };
}
export function deserializeAsMap(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        metadata.deserializedKey = (keyName) ? keyName : actualKeyName;
        metadata.deserializedType = type;
        metadata.flags |= 32 /* DeserializeMap */;
        metadata.flags = setBitConditionally(metadata.flags, 2 /* DeserializePrimitive */, isPrimitiveType(type));
    };
}
export function autoserializeUsing(serializer, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        const key = (keyName) ? keyName : actualKeyName;
        metadata.serializedKey = key;
        metadata.deserializedKey = key;
        metadata.serializedType = serializer.Serialize;
        metadata.deserializedType = serializer.Deserialize;
        metadata.flags |= 6144 /* AutoUsing */;
    };
}
export function autoserializeAs(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        const key = (keyName) ? keyName : actualKeyName;
        metadata.deserializedKey = key;
        metadata.serializedKey = key;
        metadata.deserializedType = type;
        metadata.serializedType = type;
        metadata.flags |= (16384 /* SerializeObject */ | 8192 /* DeserializeObject */);
        metadata.flags = setBitConditionally(metadata.flags, 6 /* AutoPrimitive */, isPrimitiveType(type));
    };
}
export function autoserializeAsArray(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        const key = (keyName) ? keyName : actualKeyName;
        metadata.deserializedKey = key;
        metadata.serializedKey = key;
        metadata.deserializedType = type;
        metadata.serializedType = type;
        metadata.flags |= (16 /* SerializeArray */ | 8 /* DeserializeArray */);
        metadata.flags = setBitConditionally(metadata.flags, 6 /* AutoPrimitive */, isPrimitiveType(type));
    };
}
export function autoserializeAsMap(type, keyName) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        const key = (keyName) ? keyName : actualKeyName;
        metadata.deserializedKey = key;
        metadata.serializedKey = key;
        metadata.deserializedType = type;
        metadata.serializedType = type;
        metadata.flags |= (64 /* SerializeMap */ | 32 /* DeserializeMap */);
        metadata.flags = setBitConditionally(metadata.flags, 6 /* AutoPrimitive */, isPrimitiveType(type));
    };
}
export function autoserializeAsJson(keyNameOrTransformKeys, transformKeys = true) {
    return function (target, actualKeyName) {
        const metadata = MetaData.getMetaData(target.constructor, actualKeyName);
        const key = (typeof keyNameOrTransformKeys === "string") ? keyNameOrTransformKeys : actualKeyName;
        const shouldTransformKeys = typeof keyNameOrTransformKeys === "boolean" ? keyNameOrTransformKeys : transformKeys;
        metadata.deserializedKey = key;
        metadata.serializedKey = key;
        metadata.flags |= (256 /* SerializeJSON */ | 128 /* DeserializeJSON */);
        metadata.flags = setBitConditionally(metadata.flags, 1536 /* AutoJSONTransformKeys */, shouldTransformKeys);
    };
}
export function inheritSerialization(parentType) {
    return function (childType) {
        MetaData.inheritMetaData(parentType, childType);
    };
}
//# sourceMappingURL=annotations.js.map
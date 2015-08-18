var TypeMap = new Map();
exports.__TypeMap = TypeMap;
function getMetaData(array, keyName) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].keyName === keyName) {
            return array[i];
        }
    }
    array.push(new MetaData(keyName));
    return array[array.length - 1];
}
function getTypeAndKeyName(keyNameOrType, keyName) {
    var type = null;
    var key = null;
    if (typeof keyNameOrType === "string") {
        key = keyNameOrType;
    }
    else if (typeof keyNameOrType === "function") {
        type = keyNameOrType;
        key = keyName;
    }
    return { key: key, type: type };
}
function inheritSerialization(childType) {
    return function (parentType) {
        var parentMetaData = TypeMap.get(parentType) || [];
        var childMetaData = TypeMap.get(childType) || [];
        for (var i = 0; i < parentMetaData.length; i++) {
            var keyName = parentMetaData[i].keyName;
            if (!MetaData.hasKeyName(childMetaData, keyName)) {
                childMetaData.push(MetaData.clone(parentMetaData[i]));
            }
        }
        TypeMap.set(childType, childMetaData);
    };
}
exports.inheritSerialization = inheritSerialization;
function serialize(target, keyName) {
    if (!target || !keyName)
        return;
    var metaDataList = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.serializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}
exports.serialize = serialize;
function deserialize(target, keyName) {
    if (!target || !keyName)
        return;
    var metaDataList = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.deserializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}
exports.deserialize = deserialize;
function autoserialize(target, keyName) {
    if (!target || !keyName)
        return;
    var metaDataList = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.serializedKey = keyName;
    metadata.deserializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}
exports.autoserialize = autoserialize;
function serializeAs(keyNameOrType, keyName) {
    if (!keyNameOrType)
        return;
    var _a = getTypeAndKeyName(keyNameOrType, keyName), key = _a.key, type = _a.type;
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        metadata.serializedKey = (key) ? key : actualKeyName;
        metadata.serializedType = type;
        TypeMap.set(target.constructor, metaDataList);
    };
}
exports.serializeAs = serializeAs;
function deserializeAs(keyNameOrType, keyName) {
    if (!keyNameOrType)
        return;
    var _a = getTypeAndKeyName(keyNameOrType, keyName), key = _a.key, type = _a.type;
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        metadata.deserializedKey = (key) ? key : actualKeyName;
        metadata.deserializedType = type;
        TypeMap.set(target.constructor, metaDataList);
    };
}
exports.deserializeAs = deserializeAs;
function autoserializeAs(keyNameOrType, keyName) {
    if (!keyNameOrType)
        return;
    var _a = getTypeAndKeyName(keyNameOrType, keyName), key = _a.key, type = _a.type;
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        var serialKey = (key) ? key : actualKeyName;
        metadata.deserializedKey = serialKey;
        metadata.deserializedType = type;
        metadata.serializedKey = serialKey;
        metadata.serializedType = type;
        TypeMap.set(target.constructor, metaDataList);
    };
}
exports.autoserializeAs = autoserializeAs;
var MetaData = (function () {
    function MetaData(keyName) {
        this.keyName = keyName;
        this.serializedKey = null;
        this.deserializedKey = null;
        this.deserializedType = null;
        this.serializedType = null;
        this.inheritedType = null;
    }
    MetaData.hasKeyName = function (metadataArray, key) {
        for (var i = 0; i < metadataArray.length; i++) {
            if (metadataArray[i].keyName === key)
                return true;
        }
        return false;
    };
    MetaData.clone = function (data) {
        var metadata = new MetaData(data.keyName);
        metadata.deserializedKey = data.deserializedKey;
        metadata.serializedKey = data.serializedKey;
        metadata.serializedType = data.serializedType;
        metadata.deserializedType = data.deserializedType;
        return metadata;
    };
    return MetaData;
})();
function deserializeArrayInto(source, type, arrayInstance) {
    if (!Array.isArray(arrayInstance)) {
        arrayInstance = new Array(source.length);
    }
    arrayInstance.length = source.length;
    for (var i = 0; i < source.length; i++) {
        arrayInstance[i] = DeserializeInto(source[i], type, arrayInstance[i] || new type());
    }
    return arrayInstance;
}
function deserializeObjectInto(json, type, instance) {
    var metadataArray = TypeMap.get(type);
    if (!instance) {
        instance = new type();
    }
    if (!metadataArray) {
        return instance;
    }
    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];
        if (!metadata.deserializedKey)
            continue;
        var source = json[metadata.deserializedKey];
        if (source === void 0)
            continue;
        var keyName = metadata.keyName;
        if (Array.isArray(source)) {
            instance[keyName] = deserializeArrayInto(source, metadata.deserializedType, instance[keyName]);
        }
        else if (typeof source === "string" && metadata.deserializedType === Date) {
            var deserializedDate = new Date(source);
            if (instance[keyName] instanceof Date) {
                instance[keyName].setTime(deserializedDate.getTime());
            }
            else {
                instance[keyName] = deserializedDate;
            }
        }
        else if (typeof source === "string" && type === RegExp) {
            instance[keyName] = new RegExp(source);
        }
        else if (source && typeof source === "object") {
            instance[keyName] = deserializeObjectInto(source, metadata.deserializedType, instance[keyName]);
        }
        else {
            instance[keyName] = source;
        }
    }
    if (type && typeof type.OnDeserialized === "function") {
        type.OnDeserialized(instance, source);
    }
    return instance;
}
function DeserializeInto(source, type, target) {
    if (Array.isArray(source)) {
        return deserializeArrayInto(source, type, target || []);
    }
    else if (source && typeof source === "object") {
        return deserializeObjectInto(source, type, target || new type());
    }
    else {
        return target || new type();
    }
}
exports.DeserializeInto = DeserializeInto;
function deserializeArray(source, type) {
    var retn = new Array(source.length);
    for (var i = 0; i < source.length; i++) {
        retn[i] = Deserialize(source[i], type);
    }
    return retn;
}
function deserializeObject(json, type) {
    var metadataArray = TypeMap.get(type);
    if (!metadataArray) {
        return new type();
    }
    var instance = new type();
    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];
        if (!metadata.deserializedKey)
            continue;
        var source = json[metadata.deserializedKey];
        if (source === void 0)
            continue;
        if (Array.isArray(source)) {
            instance[metadata.keyName] = deserializeArray(source, metadata.deserializedType);
        }
        else if (typeof source === "string" && metadata.deserializedType === Date) {
            instance[metadata.keyName] = new Date(source);
        }
        else if (typeof json === "string" && type === RegExp) {
            instance[metadata.keyName] = new RegExp(json);
        }
        else if (source && typeof source === "object") {
            instance[metadata.keyName] = deserializeObject(source, metadata.deserializedType);
        }
        else {
            instance[metadata.keyName] = source;
        }
    }
    if (type && typeof type.OnDeserialized === "function") {
        type.OnDeserialized(instance, json);
    }
    return instance;
}
function Deserialize(json, type) {
    if (Array.isArray(json)) {
        return deserializeArray(json, type);
    }
    else if (json && typeof json === "object") {
        return deserializeObject(json, type);
    }
    else if (typeof json === "string" && type === Date) {
        return new Date(json);
    }
    else if (typeof json === "string" && type === RegExp) {
        return new RegExp(json);
    }
    else {
        return json;
    }
}
exports.Deserialize = Deserialize;
function serializeArray(source, type) {
    var serializedArray = new Array(source.length);
    for (var j = 0; j < source.length; j++) {
        serializedArray[j] = Serialize(source[j], type);
    }
    return serializedArray;
}
function serializeTypedObject(instance) {
    var json = {};
    var metadataArray = TypeMap.get(instance.constructor);
    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];
        if (!metadata.serializedKey)
            continue;
        var source = instance[metadata.keyName];
        if (source === void 0)
            continue;
        if (Array.isArray(source)) {
            json[metadata.serializedKey] = serializeArray(source, metadata.serializedType);
        }
        else {
            var value = Serialize(source, metadata.serializedType);
            if (value !== void 0) {
                json[metadata.serializedKey] = value;
            }
        }
    }
    if (typeof instance.constructor.OnSerialized === "function") {
        instance.constructor.OnSerialized(instance, json);
    }
    return json;
}
function Serialize(instance, type) {
    if (!instance)
        return null;
    if (Array.isArray(instance)) {
        return serializeArray(instance, type);
    }
    if (instance.constructor && TypeMap.has(instance.constructor)) {
        return serializeTypedObject(instance);
    }
    if (instance instanceof Date || instance instanceof RegExp) {
        return instance.toString();
    }
    if (instance && typeof instance === 'object' || typeof instance === 'function') {
        var keys = Object.keys(instance);
        var json = {};
        for (var i = 0; i < keys.length; i++) {
            json[keys[i]] = Serialize(instance[keys[i]]);
        }
        return json;
    }
    if (instance === void 0) {
        return null;
    }
    return instance;
}
exports.Serialize = Serialize;

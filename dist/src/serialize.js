var win = null;
try {
    win = window;
}
catch (e) {
    win = global;
}
//some other modules might want access to the serialization meta data, expose it here
var TypeMap = win.__CerializeTypeMap = new win.Map();
//convert strings like my_camel_string to myCamelString
export function CamelCase(str) {
    var STRING_CAMELIZE_REGEXP = (/(\-|_|\.|\s)+(.)?/g);
    return str.replace(STRING_CAMELIZE_REGEXP, function (match, separator, chr) {
        return chr ? chr.toUpperCase() : '';
    }).replace(/^([A-Z])/, function (match, separator, chr) {
        return match.toLowerCase();
    });
}
//convert strings like MyCamelString to my_camel_string
export function SnakeCase(str) {
    var STRING_DECAMELIZE_REGEXP = (/([a-z\d])([A-Z])/g);
    return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
}
//convert strings like myCamelCase to my_camel_case
export function UnderscoreCase(str) {
    var STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
    var STRING_UNDERSCORE_REGEXP_2 = (/\-|\s+/g);
    return str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase();
}
//convert strings like my_camelCase to my-camel-case
export function DashCase(str) {
    var STRING_DASHERIZE_REGEXP = (/([a-z\d])([A-Z])/g);
    str = str.replace(/_/g, '-');
    return str.replace(STRING_DASHERIZE_REGEXP, '$1-$2').toLowerCase();
}
function deserializeString(value) {
    if (Array.isArray(value)) {
        return value.map(function (element) {
            return element && element.toString() || null;
        });
    }
    else {
        return value && value.toString() || null;
    }
}
function deserializeNumber(value) {
    if (Array.isArray(value)) {
        return value.map(function (element) {
            return parseFloat(element);
        });
    }
    else {
        return parseFloat(value);
    }
}
function deserializeBoolean(value) {
    if (Array.isArray(value)) {
        return value.map(function (element) {
            return Boolean(element);
        });
    }
    else {
        return Boolean(value);
    }
}
function serializeString(value) {
    if (Array.isArray(value)) {
        return value.map(function (element) {
            return element && element.toString() || null;
        });
    }
    else {
        return value && value.toString() || null;
    }
}
function serializeNumber(value) {
    if (Array.isArray(value)) {
        return value.map(function (element) {
            return parseInt(element);
        });
    }
    else {
        return parseInt(value);
    }
}
function serializeBoolean(value) {
    if (Array.isArray(value)) {
        return value.map(function (element) {
            return Boolean(element);
        });
    }
    else {
        return Boolean(value);
    }
}
function getDeserializeFnForType(type) {
    if (type === String) {
        return deserializeString;
    }
    else if (type === Number) {
        return deserializeNumber;
    }
    else if (type === Boolean) {
        return deserializeBoolean;
    }
    else {
        return type;
    }
}
function getSerializeFnForType(type) {
    if (type === String) {
        return serializeString;
    }
    else if (type === Number) {
        return serializeNumber;
    }
    else if (type === Boolean) {
        return serializeBoolean;
    }
    else {
        return type;
    }
}
//gets meta data for a key name, creating a new meta data instance
//if the input array doesn't already define one for the given keyName
function getMetaData(array, keyName) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].keyName === keyName) {
            return array[i];
        }
    }
    array.push(new MetaData(keyName));
    return array[array.length - 1];
}
//helper for grabbing the type and keyname from a multi-type input variable
function getTypeAndKeyName(keyNameOrType, keyName) {
    var type = null;
    var key = null;
    if (typeof keyNameOrType === "string") {
        key = keyNameOrType;
    }
    else if (keyNameOrType && typeof keyNameOrType === "function" || typeof keyNameOrType === "object") {
        type = keyNameOrType;
        key = keyName;
    }
    return { key: key, type: type };
}
//todo instance.constructor.prototype.__proto__ === parent class, maybe use this?
//because types are stored in a JS Map keyed by constructor, serialization is not inherited by default
//keeping this seperate by default also allows sub classes to serialize differently than their parent
export function inheritSerialization(parentType) {
    return function (childType) {
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
//an untyped serialization property annotation, gets existing meta data for the target or creates
//a new one and assigns the serialization key for that type in the meta data
export function serialize(target, keyName) {
    if (!target || !keyName)
        return;
    var metaDataList = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.serializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}
//an untyped deserialization property annotation, gets existing meta data for the target or creates
//a new one and assigns the deserialization key for that type in the meta data
export function deserialize(target, keyName) {
    if (!target || !keyName)
        return;
    var metaDataList = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.deserializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}
//this combines @serialize and @deserialize as defined above
export function autoserialize(target, keyName) {
    if (!target || !keyName)
        return;
    var metaDataList = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.serializedKey = keyName;
    metadata.deserializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}
//We dont actually need the type to serialize but I like the consistency with deserializeAs which definitely does
//serializes a type using 1.) a custom key name, 2.) a custom type, or 3.) both custom key and type
export function serializeAs(keyNameOrType, keyName) {
    if (!keyNameOrType)
        return;
    var { key, type } = getTypeAndKeyName(keyNameOrType, keyName);
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        metadata.serializedKey = (key) ? key : actualKeyName;
        metadata.serializedType = type;
        //this allows the type to be a stand alone function instead of a class
        if (type !== Date && type !== RegExp && !TypeMap.get(type) && typeof type === "function") {
            metadata.serializedType = {
                Serialize: getSerializeFnForType(type)
            };
        }
        TypeMap.set(target.constructor, metaDataList);
    };
}
//Supports serializing of dictionary-like map objects, ie: { x: {}, y: {} }
export function serializeIndexable(type, keyName) {
    if (!type)
        return;
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        metadata.serializedKey = (keyName) ? keyName : actualKeyName;
        metadata.serializedType = type;
        metadata.indexable = true;
        //this allows the type to be a stand alone function instead of a class
        if (type !== Date && type !== RegExp && !TypeMap.get(type) && typeof type === "function") {
            metadata.serializedType = {
                Serialize: getSerializeFnForType(type)
            };
        }
        TypeMap.set(target.constructor, metaDataList);
    };
}
//deserializes a type using 1.) a custom key name, 2.) a custom type, or 3.) both custom key and type
export function deserializeAs(keyNameOrType, keyName) {
    if (!keyNameOrType)
        return;
    var { key, type } = getTypeAndKeyName(keyNameOrType, keyName);
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        metadata.deserializedKey = (key) ? key : actualKeyName;
        metadata.deserializedType = type;
        //this allows the type to be a stand alone function instead of a class
        //todo maybe add an explicit date and regexp deserialization function here
        if (!TypeMap.get(type) && type !== Date && type !== RegExp && typeof type === "function") {
            metadata.deserializedType = {
                Deserialize: getDeserializeFnForType(type)
            };
        }
        TypeMap.set(target.constructor, metaDataList);
    };
}
//Supports deserializing of dictionary-like map objects, ie: { x: {}, y: {} }
export function deserializeIndexable(type, keyName) {
    if (!type)
        return;
    var key = keyName;
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        metadata.deserializedKey = (key) ? key : actualKeyName;
        metadata.deserializedType = type;
        metadata.indexable = true;
        if (!TypeMap.get(type) && type !== Date && type !== RegExp && typeof type === "function") {
            metadata.deserializedType = {
                Deserialize: getDeserializeFnForType(type)
            };
        }
        TypeMap.set(target.constructor, metaDataList);
    };
}
//serializes and deserializes a type using 1.) a custom key name, 2.) a custom type, or 3.) both custom key and type
export function autoserializeAs(keyNameOrType, keyName) {
    if (!keyNameOrType)
        return;
    var { key, type } = getTypeAndKeyName(keyNameOrType, keyName);
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        var serialKey = (key) ? key : actualKeyName;
        metadata.deserializedKey = serialKey;
        metadata.deserializedType = type;
        metadata.serializedKey = serialKey;
        metadata.serializedType = getSerializeFnForType(type);
        if (!TypeMap.get(type) && type !== Date && type !== RegExp && typeof type === "function") {
            metadata.deserializedType = {
                Deserialize: getDeserializeFnForType(type)
            };
        }
        TypeMap.set(target.constructor, metaDataList);
    };
}
//Supports serializing/deserializing of dictionary-like map objects, ie: { x: {}, y: {} }
export function autoserializeIndexable(type, keyName) {
    if (!type)
        return;
    var key = keyName;
    return function (target, actualKeyName) {
        if (!target || !actualKeyName)
            return;
        var metaDataList = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        var serialKey = (key) ? key : actualKeyName;
        metadata.deserializedKey = serialKey;
        metadata.deserializedType = type;
        metadata.serializedKey = serialKey;
        metadata.serializedType = getSerializeFnForType(type);
        metadata.indexable = true;
        if (!TypeMap.get(type) && type !== Date && type !== RegExp && typeof type === "function") {
            metadata.deserializedType = {
                Deserialize: getDeserializeFnForType(type)
            };
        }
        TypeMap.set(target.constructor, metaDataList);
    };
}
//helper class to contain serialization meta data for a property, each property
//in a type tagged with a serialization annotation will contain an array of these
//objects each describing one property
class MetaData {
    constructor(keyName) {
        this.keyName = keyName;
        this.serializedKey = null;
        this.deserializedKey = null;
        this.deserializedType = null;
        this.serializedType = null;
        this.indexable = false;
    }
    //checks for a key name in a meta data array
    static hasKeyName(metadataArray, key) {
        for (var i = 0; i < metadataArray.length; i++) {
            if (metadataArray[i].keyName === key)
                return true;
        }
        return false;
    }
    //clone a meta data instance, used for inheriting serialization properties
    static clone(data) {
        var metadata = new MetaData(data.keyName);
        metadata.deserializedKey = data.deserializedKey;
        metadata.serializedKey = data.serializedKey;
        metadata.serializedType = data.serializedType;
        metadata.deserializedType = data.deserializedType;
        metadata.indexable = data.indexable;
        return metadata;
    }
}
//merges two primitive objects recursively, overwriting or defining properties on
//`instance` as they defined in `json`. Works on objects, arrays and primitives
function mergePrimitiveObjects(instance, json) {
    if (!json)
        return instance; //if we dont have a json value, just use what the instance defines already
    if (!instance)
        return json; //if we dont have an instance value, just use the json
    //for each key in the input json we need to do a merge into the instance object
    Object.keys(json).forEach(function (key) {
        var transformedKey = key;
        if (typeof deserializeKeyTransform === "function") {
            transformedKey = deserializeKeyTransform(key);
        }
        var jsonValue = json[key];
        var instanceValue = instance[key];
        if (Array.isArray(jsonValue)) {
            //in the array case we reuse the items that exist already where possible
            //so reset the instance array length (or make it an array if it isnt)
            //then call mergePrimitiveObjects recursively
            instanceValue = Array.isArray(instanceValue) ? instanceValue : [];
            instanceValue.length = jsonValue.length;
            for (var i = 0; i < instanceValue.length; i++) {
                instanceValue[i] = mergePrimitiveObjects(instanceValue[i], jsonValue[i]);
            }
        }
        else if (jsonValue && typeof jsonValue === "object") {
            if (!instanceValue || typeof instanceValue !== "object") {
                instanceValue = {};
            }
            instanceValue = mergePrimitiveObjects(instanceValue, jsonValue);
        }
        else {
            //primitive case, just use straight assignment
            instanceValue = jsonValue;
        }
        instance[transformedKey] = instanceValue;
    });
    return instance;
}
//takes an array defined in json and deserializes it into an array that ist stuffed with instances of `type`.
//any instances already defined in `arrayInstance` will be re-used where possible to maintain referential integrity.
function deserializeArrayInto(source, type, arrayInstance) {
    if (!Array.isArray(arrayInstance)) {
        arrayInstance = new Array(source.length);
    }
    //extend or truncate the target array to match the source array
    arrayInstance.length = source.length;
    for (var i = 0; i < source.length; i++) {
        arrayInstance[i] = DeserializeInto(source[i], type, arrayInstance[i] || new type());
    }
    return arrayInstance;
}
//takes an object defined in json and deserializes it into a `type` instance or populates / overwrites
//properties on `instance` if it is provided.
function deserializeObjectInto(json, type, instance) {
    var metadataArray = TypeMap.get(type);
    //if we dont have an instance we need to create a new `type`
    if (instance === null || instance === void 0) {
        if (type) {
            instance = new type();
        }
    }
    //if we dont have any meta data and we dont have a type to inflate, just merge the objects
    if (instance && !type && !metadataArray) {
        return mergePrimitiveObjects(instance, json);
    }
    //if we dont have meta data just bail out and keep what we have
    if (!metadataArray) {
        invokeDeserializeHook(instance, json, type);
        return instance;
    }
    //for each property in meta data, try to hydrate that property with its corresponding json value
    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];
        //these are not the droids we're looking for (to deserialize), moving along
        if (!metadata.deserializedKey)
            continue;
        var serializedKey = metadata.deserializedKey;
        if (metadata.deserializedKey === metadata.keyName) {
            if (typeof deserializeKeyTransform === "function") {
                serializedKey = deserializeKeyTransform(metadata.keyName);
            }
        }
        var source = json[serializedKey];
        if (source === void 0)
            continue;
        var keyName = metadata.keyName;
        //if there is a custom deserialize function, use that
        if (metadata.deserializedType && typeof metadata.deserializedType.Deserialize === "function") {
            instance[keyName] = metadata.deserializedType.Deserialize(source);
        }
        else if (Array.isArray(source)) {
            if (metadata.deserializedType) {
                instance[keyName] = deserializeArrayInto(source, metadata.deserializedType, instance[keyName]);
            }
            else {
                instance[keyName] = deserializeArray(source, null);
            }
        }
        else if ((typeof source === "string" || source instanceof Date) && metadata.deserializedType === Date.prototype.constructor) {
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
            if (metadata.indexable) {
                instance[keyName] = deserializeIndexableObjectInto(source, metadata.deserializedType, instance[keyName]);
            }
            else {
                instance[keyName] = deserializeObjectInto(source, metadata.deserializedType, instance[keyName]);
            }
        }
        else {
            instance[keyName] = source;
        }
    }
    //invoke our after deserialized callback if provided
    invokeDeserializeHook(instance, json, type);
    return instance;
}
//deserializes a bit of json into a `type`
export function Deserialize(json, type) {
    if (Array.isArray(json)) {
        return deserializeArray(json, type);
    }
    else if (json && typeof json === "object") {
        return deserializeObject(json, type);
    }
    else if ((typeof json === "string" || json instanceof Date) && type === Date.prototype.constructor) {
        return new Date(json);
    }
    else if (typeof json === "string" && type === RegExp) {
        return new RegExp(json);
    }
    else {
        return json;
    }
}
//takes some json, a type, and a target object and deserializes the json into that object
export function DeserializeInto(source, type, target) {
    if (Array.isArray(source)) {
        return deserializeArrayInto(source, type, target || []);
    }
    else if (source && typeof source === "object") {
        return deserializeObjectInto(source, type, target || new type());
    }
    else {
        return target || (type && new type()) || null;
    }
}
//deserializes an array of json into an array of `type`
function deserializeArray(source, type) {
    var retn = new Array(source.length);
    for (var i = 0; i < source.length; i++) {
        retn[i] = Deserialize(source[i], type);
    }
    return retn;
}
function invokeDeserializeHook(instance, json, type) {
    if (type && typeof (type).OnDeserialized === "function") {
        type.OnDeserialized(instance, json);
    }
}
function invokeSerializeHook(instance, json) {
    if (typeof (instance.constructor).OnSerialized === "function") {
        (instance.constructor).OnSerialized(instance, json);
    }
}
//deserialize a bit of json into an instance of `type`
function deserializeObject(json, type) {
    var metadataArray = TypeMap.get(type);
    //if we dont have meta data, just decode the json and use that
    if (!metadataArray) {
        var inst = null;
        if (!type) {
            inst = JSON.parse(JSON.stringify(json));
        }
        else {
            inst = new type(); //todo this probably wrong
            invokeDeserializeHook(inst, json, type);
        }
        return inst;
    }
    var instance = new type();
    //for each tagged property on the source type, try to deserialize it
    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];
        if (!metadata.deserializedKey)
            continue;
        var serializedKey = metadata.deserializedKey;
        if (metadata.deserializedKey === metadata.keyName) {
            if (typeof deserializeKeyTransform === "function") {
                serializedKey = deserializeKeyTransform(metadata.keyName);
            }
        }
        var source = json[serializedKey];
        var keyName = metadata.keyName;
        if (source === void 0)
            continue;
        if (source === null) {
            instance[keyName] = source;
        }
        else if (metadata.deserializedType && typeof metadata.deserializedType.Deserialize === "function") {
            instance[keyName] = metadata.deserializedType.Deserialize(source);
        }
        else if (Array.isArray(source)) {
            instance[keyName] = deserializeArray(source, metadata.deserializedType || null);
        }
        else if ((typeof source === "string" || source instanceof Date) && metadata.deserializedType === Date.prototype.constructor) {
            instance[keyName] = new Date(source);
        }
        else if (typeof source === "string" && metadata.deserializedType === RegExp) {
            instance[keyName] = new RegExp(json);
        }
        else if (source && typeof source === "object") {
            if (metadata.indexable) {
                instance[keyName] = deserializeIndexableObject(source, metadata.deserializedType);
            }
            else {
                instance[keyName] = deserializeObject(source, metadata.deserializedType);
            }
        }
        else {
            instance[keyName] = source;
        }
    }
    invokeDeserializeHook(instance, json, type);
    return instance;
}
function deserializeIndexableObject(source, type) {
    var retn = {};
    //todo apply key transformation here?
    Object.keys(source).forEach(function (key) {
        retn[key] = deserializeObject(source[key], type);
    });
    return retn;
}
function deserializeIndexableObjectInto(source, type, instance) {
    //todo apply key transformation here?
    Object.keys(source).forEach(function (key) {
        instance[key] = deserializeObjectInto(source[key], type, instance[key]);
    });
    return instance;
}
//take an array and spit out json
function serializeArray(source, type) {
    var serializedArray = new Array(source.length);
    for (var j = 0; j < source.length; j++) {
        serializedArray[j] = Serialize(source[j], type);
    }
    return serializedArray;
}
//take an instance of something and try to spit out json for it based on property annotaitons
function serializeTypedObject(instance, type) {
    var json = {};
    var metadataArray;
    if (type) {
        metadataArray = TypeMap.get(type);
    }
    else {
        metadataArray = TypeMap.get(instance.constructor);
    }
    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];
        if (!metadata.serializedKey)
            continue;
        var serializedKey = metadata.serializedKey;
        if (metadata.serializedKey === metadata.keyName) {
            if (typeof serializeKeyTransform === "function") {
                serializedKey = serializeKeyTransform(metadata.keyName);
            }
        }
        var source = instance[metadata.keyName];
        if (source === void 0)
            continue;
        if (Array.isArray(source)) {
            json[serializedKey] = serializeArray(source, metadata.serializedType || null);
        }
        else if (metadata.serializedType && typeof metadata.serializedType.Serialize === "function") {
            //todo -- serializeIndexableObject probably isn't needed because of how serialize works
            json[serializedKey] = metadata.serializedType.Serialize(source);
        }
        else {
            var value = Serialize(source);
            if (value !== void 0) {
                json[serializedKey] = value;
            }
        }
    }
    invokeSerializeHook(instance, json);
    return json;
}
//take an instance of something and spit out some json
export function Serialize(instance, type) {
    if (instance === null || instance === void 0)
        return null;
    if (Array.isArray(instance)) {
        return serializeArray(instance, type);
    }
    if (type && TypeMap.has(type)) {
        return serializeTypedObject(instance, type);
    }
    if (instance.constructor && TypeMap.has(instance.constructor)) {
        return serializeTypedObject(instance);
    }
    if (instance instanceof Date) {
        return instance.toISOString();
    }
    if (instance instanceof RegExp) {
        return instance.toString();
    }
    if (instance && typeof instance === 'object' || typeof instance === 'function') {
        var keys = Object.keys(instance);
        var json = {};
        for (var i = 0; i < keys.length; i++) {
            //todo this probably needs a key transform
            json[keys[i]] = Serialize(instance[keys[i]]);
        }
        invokeSerializeHook(instance, json);
        return json;
    }
    return instance;
}
export function GenericDeserialize(json, type) {
    return Deserialize(json, type);
}
export function GenericDeserializeInto(json, type, instance) {
    return DeserializeInto(json, type, instance);
}
//these are used for transforming keys from one format to another
var serializeKeyTransform = null;
var deserializeKeyTransform = null;
//setter for deserializing key transform
export function DeserializeKeysFrom(transform) {
    deserializeKeyTransform = transform;
}
//setter for serializing key transform
export function SerializeKeysTo(transform) {
    serializeKeyTransform = transform;
}
//this is kinda dumb but typescript doesnt treat enums as a type, but sometimes you still
//want them to be serialized / deserialized, this does the trick but must be called after
//the enum is defined.
export function SerializableEnumeration(e) {
    e.Serialize = function (x) {
        return e[x];
    };
    e.Deserialize = function (x) {
        return e[x];
    };
}
//expose the type map
export { TypeMap as __TypeMap };

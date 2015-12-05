export interface Map<K, V> {
    clear(): void;
    delete(key : K): boolean;
    forEach(callbackfn : (value : V, index : K, map : Map<K, V>) => void, thisArg? : any): void;
    get(key : K): V;
    has(key : K): boolean;
    set(key : K, value? : V): Map<K, V>;
    size: number;
}

export interface MapConstructor {
    new (): Map<any, any>;
    new <K, V>(): Map<K, V>;
    prototype: Map<any, any>;
}

declare var global : any;
declare var Map : MapConstructor;
var win : any = null;
try {
    win = window;
}
catch (e) {
    win = global;
}
var TypeMap = win.__CerializeTypeMap = new Map();

export type Serializer = (value : any) => any;
export type Deserializer = (value : any) => any;

export interface ISerializable {
    Serialize?: (value : any) => any;
    Deserialize?: (json : any, instance? : any) => any;
}

//convert strings like my_camel_string to myCamelString
export function CamelCase(str : string) : string {
    var STRING_CAMELIZE_REGEXP = (/(\-|_|\.|\s)+(.)?/g);
    return str.replace(STRING_CAMELIZE_REGEXP, function (match, separator, chr) : string {
        return chr ? chr.toUpperCase() : '';
    }).replace(/^([A-Z])/, function (match, separator, chr) : string {
        return match.toLowerCase();
    });
}

//convert strings like MyCamelString to my_camel_string
export function SnakeCase(str : string) : string {
    var STRING_DECAMELIZE_REGEXP = (/([a-z\d])([A-Z])/g);
    return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
}

//convert strings like myCamelCase to my_camel_case
export function UnderscoreCase(str : string) : string {
    var STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
    var STRING_UNDERSCORE_REGEXP_2 = (/\-|\s+/g);
    return str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').
    replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase();
}

//convert strings like my_camelCase to my-camel-case
export function DashCase(str : string) : string {
    var STRING_DASHERIZE_REGEXP = (/([a-z\d])([A-Z])/g);
    str = str.replace(/_/g, '-');
    return str.replace(STRING_DASHERIZE_REGEXP, '$1-$2').toLowerCase();
}

function getMetaData(array : Array<MetaData>, keyName : string) : MetaData {
    for (var i = 0; i < array.length; i++) {
        if (array[i].keyName === keyName) {
            return array[i];
        }
    }
    array.push(new MetaData(keyName));
    return array[array.length - 1];
}

function getTypeAndKeyName(keyNameOrType : string|Function|ISerializable, keyName : string) : {type: Function, key : string} {
    var type : Function = null;
    var key : string = null;
    if (typeof keyNameOrType === "string") {
        key = <string>keyNameOrType;

    } else if (keyNameOrType && typeof keyNameOrType === "function" || typeof keyNameOrType === "object") {
        type = <Function>keyNameOrType;
        key = keyName;
    }
    return { key: key, type: type };
}

//todo instance.constructor.prototype.__proto__ === parent class, maybe use this?
export function inheritSerialization(parentType : Function) : any {
    return function (childType : Function) {
        var parentMetaData : Array<MetaData> = TypeMap.get(parentType) || [];
        var childMetaData : Array<MetaData> = TypeMap.get(childType) || [];
        for (var i = 0; i < parentMetaData.length; i++) {
            var keyName = parentMetaData[i].keyName;
            if (!MetaData.hasKeyName(childMetaData, keyName)) {
                childMetaData.push(MetaData.clone(parentMetaData[i]));
            }
        }
        TypeMap.set(childType, childMetaData);
    }
}

export function serialize(target : any, keyName : string) : any {
    if (!target || !keyName) return;
    var metaDataList : Array<MetaData> = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.serializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}

export function deserialize(target : any, keyName : string) : any {
    if (!target || !keyName) return;
    var metaDataList : Array<MetaData> = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.deserializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}

export function autoserialize(target : any, keyName : string) : any {
    if (!target || !keyName) return;
    var metaDataList : Array<MetaData> = TypeMap.get(target.constructor) || [];
    var metadata = getMetaData(metaDataList, keyName);
    metadata.serializedKey = keyName;
    metadata.deserializedKey = keyName;
    TypeMap.set(target.constructor, metaDataList);
}

//We dont actually need the type to serialize but I like the consistency with deserializeAs which definitely does
export function serializeAs(keyNameOrType : string|Serializer|ISerializable, keyName? : string) : any {
    if (!keyNameOrType) return;
    var { key, type } = getTypeAndKeyName(keyNameOrType, keyName);
    return function (target : any, actualKeyName : string) : any {
        if (!target || !actualKeyName) return;
        var metaDataList : Array<MetaData> = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        metadata.serializedKey = (key) ? key : actualKeyName;
        metadata.serializedType = type;
        if (type !== Date && type !== RegExp && !TypeMap.get(type) && typeof type === "function") {
            metadata.serializedType = <ISerializable>{
                Serialize: <Serializer>type
            };
        }
        TypeMap.set(target.constructor, metaDataList);
    };
}

export function deserializeAs(keyNameOrType : string|Function|ISerializable, keyName? : string) : any {
    if (!keyNameOrType) return;
    var { key, type } = getTypeAndKeyName(keyNameOrType, keyName);
    return function (target : any, actualKeyName : string) : any {
        if (!target || !actualKeyName) return;
        var metaDataList : Array<MetaData> = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        metadata.deserializedKey = (key) ? key : actualKeyName;
        metadata.deserializedType = type;
        if (!TypeMap.get(type) && type !== Date && type !== RegExp &&typeof type === "function") {
            metadata.deserializedType = <ISerializable>{
                Deserialize: <Deserializer>type
            };
        }
        TypeMap.set(target.constructor, metaDataList);
    };
}

export function autoserializeAs(keyNameOrType : string|Function|ISerializable, keyName? : string) : any {
    if (!keyNameOrType) return;
    var { key, type } = getTypeAndKeyName(keyNameOrType, keyName);
    return function (target : any, actualKeyName : string) : any {
        if (!target || !actualKeyName) return;
        var metaDataList : Array<MetaData> = TypeMap.get(target.constructor) || [];
        var metadata = getMetaData(metaDataList, actualKeyName);
        var serialKey = (key) ? key : actualKeyName;
        metadata.deserializedKey = serialKey;
        metadata.deserializedType = type;
        metadata.serializedKey = serialKey;
        metadata.serializedType = type;
        TypeMap.set(target.constructor, metaDataList);
    };
}

class MetaData {

    public keyName : string;
    public serializedKey : string;
    public deserializedKey : string;
    public serializedType : Function|ISerializable;
    public deserializedType : Function|ISerializable;
    public inheritedType : Function;

    constructor(keyName : string) {
        this.keyName = keyName;
        this.serializedKey = null;
        this.deserializedKey = null;
        this.deserializedType = null;
        this.serializedType = null;
        this.inheritedType = null;
    }

    public static hasKeyName(metadataArray : Array<MetaData>, key : string) : boolean {
        for (var i = 0; i < metadataArray.length; i++) {
            if (metadataArray[i].keyName === key) return true;
        }
        return false;
    }

    public static clone(data : MetaData) : MetaData {
        var metadata = new MetaData(data.keyName);
        metadata.deserializedKey = data.deserializedKey;
        metadata.serializedKey = data.serializedKey;
        metadata.serializedType = data.serializedType;
        metadata.deserializedType = data.deserializedType;
        return metadata;
    }
}

function mergePrimitiveObjects(instance : any, json : any) : any {
    if (!json) return instance;
    Object.keys(json).forEach(function (key : string) {
        var value = json[key];
        if (Array.isArray(value)) {

        }
        else if (value && typeof value === "object") {

        }
        else {
            var transformedKey = key;
            if (typeof deserializeKeyTransform === "function") {
                transformedKey = deserializeKeyTransform(key);
            }
            instance[transformedKey] = json[key];
        }
        instance[key] = mergePrimitiveObjects(instance[key], value);
    });
    return instance;
}

function deserializeArrayInto(source : Array<any>, type : Function|ISerializable, arrayInstance : any) : Array<any> {
    if (!Array.isArray(arrayInstance)) {
        arrayInstance = new Array<any>(source.length);
    }

    arrayInstance.length = source.length;

    for (var i = 0; i < source.length; i++) {
        arrayInstance[i] = DeserializeInto(source[i], type, arrayInstance[i] || new (<any>type)());
    }

    return arrayInstance;
}

function deserializeObjectInto(json : any, type : Function|ISerializable, instance : any) : any {
    var metadataArray : Array<MetaData> = TypeMap.get(type);
    if (instance === null || instance === void 0) {
        if (type) {
            instance = new (<any>type)();
        }

        //instance = type ? new (<any> type)() : {};
    }

    if (instance && !type && !metadataArray) {
        //todo fix this, it shouldn't overwrite objects
        return JSON.parse(json.stringify(json));//mergePrimitiveObjects(instance, json);
    }

    if (!metadataArray) {
        return instance;
    }

    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];
        if (!metadata.deserializedKey) continue;

        var serializedKey = metadata.deserializedKey;

        if (metadata.deserializedKey === metadata.keyName) {
            if (typeof deserializeKeyTransform === "function") {
                serializedKey = deserializeKeyTransform(metadata.keyName);
            }
        }

        var source = json[serializedKey];

        if (source === void 0) continue;

        var keyName = metadata.keyName;

        if (Array.isArray(source)) {
            if(metadata.deserializedType) {
                instance[keyName] = deserializeArrayInto(source, metadata.deserializedType, instance[keyName]);
            } else {
                instance[keyName] = deserializeArray(source, null);
            }
        }
        else if (metadata.deserializedType && typeof (<any>metadata.deserializedType).Deserialize === "function") {
            instance[keyName] = (<any>metadata.deserializedType).Deserialize(source);
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

    if (type && typeof (<any>type).OnDeserialized === "function") {
        (<any>type).OnDeserialized(instance, json);
    }

    return instance;
}

export function DeserializeInto(source : any, type : Function|ISerializable, target : any) : any {
    if (Array.isArray(source)) {
        return deserializeArrayInto(source, type, target || []);
    }
    else if (source && typeof source === "object") {
        return deserializeObjectInto(source, type, target || new (<any>type)());
    }
    else {
        return target || new (<any>type)();
    }
}

function deserializeArray(source : Array<any>, type : Function|ISerializable) : Array<any> {
    var retn : Array<any> = new Array(source.length);
    for (var i = 0; i < source.length; i++) {
        retn[i] = Deserialize(source[i], type);
    }
    return retn;
}

function deserializeObject(json : any, type : Function|ISerializable) : any {
    var metadataArray : Array<MetaData> = TypeMap.get(type);

    if (!metadataArray) {
        if (!type) {
            return JSON.parse(JSON.stringify(json));
        }
        return new (<any>type)();
    }

    var instance = new (<any>type)();

    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];

        if (!metadata.deserializedKey) continue;

        var serializedKey = metadata.deserializedKey;

        if (metadata.deserializedKey === metadata.keyName) {
            if (typeof deserializeKeyTransform === "function") {
                serializedKey = deserializeKeyTransform(metadata.keyName);
            }
        }

        var source = json[serializedKey];

        if (source === void 0) continue;

        if (Array.isArray(source)) {
            instance[metadata.keyName] = deserializeArray(source, metadata.deserializedType);
        }
        else if (metadata.deserializedType && typeof (<any>metadata.deserializedType).Deserialize === "function") {
            instance[metadata.keyName] = (<any>metadata.deserializedType).Deserialize(source);
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

    if (type && typeof (<any>type).OnDeserialized === "function") {
        (<any>type).OnDeserialized(instance, json);
    }

    return instance;
}

export function Deserialize(json : any, type? : Function|ISerializable) : any {

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

function serializeArray(source : Array<any>) : Array<any> {
    var serializedArray : Array<any> = new Array(source.length);
    for (var j = 0; j < source.length; j++) {
        serializedArray[j] = Serialize(source[j]);
    }
    return serializedArray;
}

function serializeTypedObject(instance : any) : any {

    var json : any = {};

    var metadataArray : Array<MetaData> = TypeMap.get(instance.constructor);

    for (var i = 0; i < metadataArray.length; i++) {
        var metadata = metadataArray[i];

        if (!metadata.serializedKey) continue;

        var serializedKey = metadata.serializedKey;

        if (metadata.serializedKey === metadata.keyName) {
            if (typeof serializeKeyTransform === "function") {
                serializedKey = serializeKeyTransform(metadata.keyName);
            }
        }

        var source = instance[metadata.keyName];

        if (source === void 0) continue;

        if (Array.isArray(source)) {
            json[serializedKey] = serializeArray(source);
        }
        else if (metadata.serializedType && typeof (<any>metadata.serializedType).Serialize === "function") {
            json[serializedKey] = (<any>metadata.serializedType).Serialize(source);

        } else {
            var value = Serialize(source);
            if (value !== void 0) {
                json[serializedKey] = value;
            }
        }
    }

    if (typeof (<any>instance.constructor).OnSerialized === "function") {
        (<any>instance.constructor).OnSerialized(instance, json);
    }

    return json;
}

export function Serialize(instance : any) : any {
    if (instance === null || instance === void 0) return null;

    if (Array.isArray(instance)) {
        return serializeArray(instance);
    }

    if (instance.constructor && TypeMap.has(instance.constructor)) {
        return serializeTypedObject(instance);
    }

    if (instance instanceof Date || instance instanceof RegExp) {
        return instance.toString();
    }

    if (instance && typeof instance === 'object' || typeof instance === 'function') {
        var keys = Object.keys(instance);
        var json : any = {};
        for (var i = 0; i < keys.length; i++) {
            //todo this probably needs a key transform
            json[keys[i]] = Serialize(instance[keys[i]]);
        }
        return json;
    }

    return instance;
}

//todo finish documenting!
//todo further test ISerializable
//todo null check for type in deserialize
//todo if serializedType is provided, treat it as an override for instance.constructor

var serializeKeyTransform : (key : string) => string = null;
var deserializeKeyTransform : (key : string) => string = null;

export function DeserializeKeysFrom(transform : (key : string) => string) {
    deserializeKeyTransform = transform;
}

export function SerializeKeysTo(transform : (key : string) => string) {
    serializeKeyTransform = transform;
}

export function SerializableEnumeration(e : any) : void {
    e.Serialize = function (x : any) : any {
        return e[x];
    };

    e.Deserialize = function (x : any) : any {
        return e[x];
    };
}

export { TypeMap as __TypeMap }
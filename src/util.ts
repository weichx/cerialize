export type JsonType = string | number | boolean | JsonObject | JsonArray;

export interface JsonObject {
    [x : string] : JsonType;
}

interface JsonArray extends Array<JsonType> {}

export type Serializer<T> = (target : T) => JsonType;
export type Deserializer<T> = (data : JsonType, target? : T, createInstances? : boolean) => T;

export interface ISerializer<T> {
    Serialize : Serializer<T>;
    Deserialize : Deserializer<T>;
}

// export type JsonType = Indexable<JsonType> | string | boolean | number | object | Array<JsonType>;
export type IConstructable = { constructor : Function };

export interface Indexable<T = any> {
    [idx : string] : T;
}

export interface SerializableType<T> {
    new (...args : any[]) : T;

    onSerialized? : (data : JsonObject, instance : T) => void | JsonObject;
    onDeserialized? : (data : JsonObject, instance : T, createInstances? : boolean) => T;
}

export type SerializeFn = <T>(data : T) => JsonType;
export type SerializablePrimitiveType =
    DateConstructor |
    NumberConstructor |
    BooleanConstructor |
    RegExpConstructor |
    StringConstructor;

/** @internal */
export function getTarget<T>(type : SerializableType<T>, target : T, createInstances : boolean) : T {

    if (target !== null && target !== void 0) return target;

    if (type !== null && createInstances) {
        return new type();
    }

    return {} as T;
}

export function isPrimitiveType(type : Function) : boolean {
    return (
        type === String ||
        type === Boolean ||
        type === Number ||
        type === Date ||
        type === RegExp
    );
}

export function setBitConditionally(value : number, bits : number, condition : boolean) : number {
    if (condition) {
        return value | bits;
    }
    else {
        return value & ~bits;
    }
}
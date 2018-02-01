export declare type JsonType = null | string | number | boolean | JsonObject | JsonArray;
export declare type Serializer<T> = (target: T) => JsonType;
export declare type Deserializer<T> = (data: JsonType, target?: T, createInstances?: boolean) => T;
export declare type IConstructable = {
    constructor: Function;
};
export declare type SerializeFn = <T>(data: T) => JsonType;
export declare type SerializablePrimitiveType = DateConstructor | NumberConstructor | BooleanConstructor | RegExpConstructor | StringConstructor;
export interface JsonObject {
    [idx: string]: JsonType;
}
export interface JsonArray extends Array<JsonType> {
}
export interface ISerializer<T> {
    Serialize: Serializer<T>;
    Deserialize: Deserializer<T>;
}
export interface Indexable<T = any | null> {
    [idx: string]: T;
}
export interface SerializableType<T> {
    new (...args: any[]): T;
    onSerialized?: (data: JsonObject, instance: T) => JsonObject;
    onDeserialized?: (data: JsonObject, instance: T, createInstances?: boolean) => T;
}

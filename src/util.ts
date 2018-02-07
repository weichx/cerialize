export type JsonType = null | string | number | boolean | JsonObject | JsonArray;
export type Serializer<T> = (target : T) => JsonType;
export type Deserializer<T> = (data : JsonType, target? : T, instantiationMethod? : InstantiationMethod) => T;
export type IConstructable = { constructor : Function };
export type SerializeFn = <T>(data : T) => JsonType;
export type SerializablePrimitiveType =
    DateConstructor |
    NumberConstructor |
    BooleanConstructor |
    RegExpConstructor |
    StringConstructor;

export enum InstantiationMethod {
	None = 0,
	New = 1,
	ObjectCreate = 2
}

export interface JsonObject {
    [idx : string] : JsonType|JsonObject;
}

export interface JsonArray extends Array<JsonType> {}

export interface ISerializer<T> {
    Serialize : Serializer<T>;
    Deserialize : Deserializer<T>;
}

export interface Indexable<T = any|null> {
    [idx : string] : T;
}

export interface SerializableType<T> {
    new (...args : any[]) : T;

    onSerialized? : (data : JsonObject, instance : T) => JsonObject|void;
    onDeserialized? : (data : JsonObject, instance : T, instantiationMethod? : InstantiationMethod) => T|void;
}


/** @internal */
export function getTarget<T>(type : SerializableType<T>, target : T, instantiationMethod : InstantiationMethod) : T {

    if (target !== null && target !== void 0) return target;

    if (type !== null) {
        switch (instantiationMethod) {
            case InstantiationMethod.New:
            	return new type();

			case InstantiationMethod.ObjectCreate:
				return Object.create(type.prototype);
        }
    }

    return {} as T;
}

/** @internal */
export function isPrimitiveType(type : Function) : boolean {
    return (
        type === String ||
        type === Boolean ||
        type === Number ||
        type === Date ||
        type === RegExp
    );
}

/** @internal */
export function setBitConditionally(value : number, bits : number, condition : boolean) : number {
    if (condition) {
        return value | bits;
    }
    else {
        return value & ~bits;
    }
}

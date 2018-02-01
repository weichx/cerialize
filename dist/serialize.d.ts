import { Indexable, JsonObject, JsonType, SerializablePrimitiveType, SerializableType } from "./util";
export declare function SerializeMap<T>(source: T, type: SerializableType<T>): Indexable<JsonType>;
export declare function SerializeArray<T>(source: Array<T>, type: SerializableType<T>): Array<JsonType>;
export declare function SerializePrimitive<T>(source: SerializablePrimitiveType, type: SerializablePrimitiveType): JsonType;
export declare function SerializeJSON(source: any, transformKeys?: boolean): JsonType;
export declare function Serialize<T>(instance: T, type: SerializableType<T>): JsonObject | null;

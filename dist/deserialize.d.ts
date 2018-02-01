import { Indexable, JsonType, SerializableType } from "./util";
export declare function DeserializeMap<T>(data: any, type: SerializableType<T>, target?: Indexable<T>, createInstances?: boolean): Indexable<T>;
export declare function DeserializeArray<T>(data: any, type: SerializableType<T>, target?: Array<T>, createInstances?: boolean): T[];
export declare function DeserializeJSON<T extends JsonType>(data: JsonType, transformKeys?: boolean, target?: JsonType): JsonType;
export declare function Deserialize<T extends Indexable>(data: any, type: SerializableType<T>, target?: T, createInstances?: boolean): T | null;

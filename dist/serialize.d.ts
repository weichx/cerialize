export interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    set(key: K, value?: V): Map<K, V>;
    size: number;
}
export interface MapConstructor {
    new (): Map<any, any>;
    new <K, V>(): Map<K, V>;
    prototype: Map<any, any>;
}
declare var TypeMap: Map<any, any>;
export interface ISerializable {
    Serialize?: (value: any) => any;
    Deserialize?: (json: any, instance?: any) => any;
}
export declare function CamelCase(str: string): string;
export declare function SnakeCase(str: string): string;
export declare function UnderscoreCase(str: string): string;
export declare function DashCase(str: string): string;
export declare function inheritSerialization(parentType: Function): any;
export declare function serialize(target: any, keyName: string): any;
export declare function deserialize(target: any, keyName: string): any;
export declare function autoserialize(target: any, keyName: string): any;
export declare function serializeAs(keyNameOrType: string | Function | ISerializable, keyName?: string): any;
export declare function deserializeAs(keyNameOrType: string | Function | ISerializable, keyName?: string): any;
export declare function autoserializeAs(keyNameOrType: string | Function | ISerializable, keyName?: string): any;
export declare function DeserializeInto(source: any, type: Function, target: any): any;
export declare function Deserialize(json: any, type?: Function): any;
export declare function Serialize(instance: any): any;
export declare function DeserializeKeysFrom(transform: (key: string) => string): void;
export declare function SerializeKeysTo(transform: (key: string) => string): void;
export declare function SerializableEnumeration(e: any): void;
export { TypeMap as __TypeMap };

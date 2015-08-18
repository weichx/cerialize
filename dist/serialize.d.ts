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
export declare function inheritSerialization(childType: Function): any;
export declare function serialize(target: any, keyName: string): any;
export declare function deserialize(target: any, keyName: string): any;
export declare function autoserialize(target: any, keyName: string): any;
export declare function serializeAs(keyNameOrType: string | Function, keyName?: string): any;
export declare function deserializeAs(keyNameOrType: string | Function, keyName?: string): any;
export declare function autoserializeAs(keyNameOrType: string | Function, keyName?: string): any;
export declare function DeserializeInto(source: any, type: Function, target: any): any;
export declare function Deserialize(json: any, type?: Function): any;
export declare function Serialize(instance: any, type?: any): any;
export { TypeMap as __TypeMap };

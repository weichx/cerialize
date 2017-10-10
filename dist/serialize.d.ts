declare var TypeMap: any;
export declare type Serializer = (value: any) => any;
export declare type Deserializer = (value: any) => any;
export interface INewable<T> {
    new (...args: any[]): T;
}
export interface IEnum {
    [enumeration: string]: any;
}
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
export declare function serializeAs(keyNameOrType: string | Serializer | INewable<any> | ISerializable | IEnum, keyName?: string): any;
export declare function serializeIndexable(type: Serializer | INewable<any> | ISerializable, keyName?: string): any;
export declare function deserializeAs(keyNameOrType: string | Function | INewable<any> | ISerializable | IEnum, keyName?: string): any;
export declare function deserializeIndexable(type: Function | INewable<any> | ISerializable, keyName?: string): any;
export declare function autoserializeAs(keyNameOrType: string | Function | INewable<any> | ISerializable | IEnum, keyName?: string): any;
export declare function autoserializeIndexable(type: Function | INewable<any> | ISerializable, keyName?: string): any;
export declare function Deserialize(json: any, type?: Function | INewable<any> | ISerializable): any;
export declare function DeserializeInto(source: any, type: Function | INewable<any> | ISerializable, target: any): any;
export declare function Serialize(instance: any, type?: Function | ISerializable): any;
export declare function GenericDeserialize<T>(json: any, type: INewable<T>): T;
export declare function GenericDeserializeInto<T>(json: any, type: INewable<T>, instance: T): T;
export declare function DeserializeKeysFrom(transform: (key: string) => string): void;
export declare function SerializeKeysTo(transform: (key: string) => string): void;
export declare function SerializableEnumeration(e: IEnum): void;
export { TypeMap as __TypeMap };

export * from "./serialize";
export * from "./deserialize";
export * from "./annotations";
export * from "./string_transforms";
export declare function SetSerializeKeyTransform(fn: (str: string) => string): void;
export declare function SetDeserializeKeyTransform(fn: (str: string) => string): void;

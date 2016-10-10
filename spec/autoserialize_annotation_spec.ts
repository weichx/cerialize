///<reference path="./typings/jasmine.d.ts"/>
import {__TypeMap, autoserialize, Serialize, Deserialize, DeserializeInto, autoserializeAs} from '../src/serialize';

class T {
    @autoserialize public x: number;
}

class Vector2 {
    @autoserialize x: number;
    @autoserialize y: number;
}
class AsTest {
    @autoserializeAs(Vector2) v: Vector2;
}

class AsTest2 {
    @autoserializeAs(Vector2, "VECTOR") v: Vector2;
}

class AsTest3 {
    @autoserializeAs("z") y: number;
}

class Test3 {
    @autoserialize public primitiveArray: Array<number>;
}

describe('autoserialize', function () {
    it('should create meta data for serialize and deserialize', function () {
        expect(__TypeMap.get(T)).toBeDefined();
        expect(__TypeMap.get(T).length).toBe(1);
        expect(__TypeMap.get(T)[0].serializedKey).toBe('x');
        expect(__TypeMap.get(T)[0].serializedType).toBe(null);
        expect(__TypeMap.get(T)[0].deserializedType).toBe(null);
        expect(__TypeMap.get(T)[0].deserializedKey).toBe('x');
    });
});

describe('autoserializeAs', function () {
    it('should create meta data', function () {
        expect(__TypeMap.get(AsTest)).toBeDefined();
        expect(__TypeMap.get(AsTest).length).toBe(1);
        expect(__TypeMap.get(AsTest)[0].serializedKey).toBe('v');
        expect(__TypeMap.get(AsTest)[0].serializedType).toBe(Vector2);
        expect(__TypeMap.get(AsTest)[0].deserializedKey).toBe('v');
        expect(__TypeMap.get(AsTest)[0].deserializedType).toBe(Vector2);
    });

    it('should create meta data with a different key', function () {
        expect(__TypeMap.get(AsTest3)).toBeDefined();
        expect(__TypeMap.get(AsTest3).length).toBe(1);
        expect(__TypeMap.get(AsTest3)[0].serializedKey).toBe('z');
        expect(__TypeMap.get(AsTest3)[0].serializedType).toBe(null);
        expect(__TypeMap.get(AsTest3)[0].deserializedKey).toBe('z');
        expect(__TypeMap.get(AsTest3)[0].deserializedType).toBe(null);
    });

    it('should create meta data with a different key and type', function () {
        expect(__TypeMap.get(AsTest2)).toBeDefined();
        expect(__TypeMap.get(AsTest2).length).toBe(1);
        expect(__TypeMap.get(AsTest2)[0].serializedKey).toBe('VECTOR');
        expect(__TypeMap.get(AsTest2)[0].serializedType).toBe(Vector2);
        expect(__TypeMap.get(AsTest2)[0].deserializedKey).toBe('VECTOR');
        expect(__TypeMap.get(AsTest2)[0].deserializedType).toBe(Vector2);
    });

    it("handles strings", function() {
        
    })
});
/* [Weichx 12/9/15] credit to @garkin for contributing the rest of this file */
// ES6 Set stub
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
// https://github.com/cloud9ide/typescript/blob/master/typings/lib.d.ts
interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    size: number;
}
declare var Set: {
    new <T>(data?: T[]): Set<T>;
};

module Utility {
    export function unpackSet<T>(_set: Set<T>): T[] {
        const result: T[] = [];
        _set.forEach(v => result.push(v));
        return result;
    }
}

describe('autoserializeAs using Serializer', () => {

    describe('to wrapped data', () => {

        const JSON = {
            children: {
                wrap: [11, 22, 33]
            }
        };

        const Serializer = {
            Serialize(_set: Set<any>){
                return {wrap: Utility.unpackSet(_set)};
            },
            Deserialize(json: any, instance?: any)  {
                return new Set<any>(<any>json.wrap);
            }
        };

        class TestClass {
            @autoserializeAs(Serializer) children: Set<number> = new Set();
        }

        it("will be serialized", () => {
            const instance = new TestClass();
            JSON.children.wrap.forEach(v => instance.children.add(v));
            const json = Serialize(instance);
            expect(json).toEqual(JSON);
        });

        it("will be deserialized", () => {
            const result = Deserialize(JSON, TestClass);
            expect(result instanceof TestClass).toBeTruthy();
            expect(result.children instanceof Set).toBeTruthy();
            expect(Utility.unpackSet(result.children)).toEqual(JSON.children.wrap);
        });

        it("will be deserializedInto", () => {
            const result = DeserializeInto(JSON, TestClass, new TestClass());
            expect(result instanceof TestClass).toBeTruthy();
            expect(result.children instanceof Set).toBeTruthy();
            expect(Utility.unpackSet(result.children)).toEqual(JSON.children.wrap);
        });

    });

    describe('should handle primitive arrays', function () {

        it('should handle serializing a primitive array', function () {
            var t = new Test3();
            t.primitiveArray = [1, 2, 3];
            var result = Serialize(t);
            expect(result.primitiveArray.length).toBe(3);
            expect(result.primitiveArray[0]).toBe(1);
            expect(result.primitiveArray[1]).toBe(2);
            expect(result.primitiveArray[2]).toBe(3);
        });

        it('should handle deserializing a primitive array', function () {
            var t = new Test3();
            t.primitiveArray = [1, 2, 3];
            var result = Deserialize({primitiveArray: [1, 2, 3]}, Test3);
            expect(Array.isArray(result.primitiveArray)).toBe(true);
        });

    });

    describe('to plain array data', () => {

        const JSON = {
            children: [11, 22, 33]
        };


        const Serializer = {
            Serialize(_set: Set<any>){
                return Utility.unpackSet(_set);
            },
            Deserialize(json: any, instance?: any)  {
                return new Set(json);
            }
        };

        class TestClass {
            @autoserializeAs(Serializer) children: Set<number> = new Set();
        }

        it("will be serialized", () => {
            const instance = new TestClass();
            JSON.children.forEach(v => instance.children.add(v));
            const json = Serialize(instance);
            expect(json).toEqual(JSON);
        });

        it("will be deserialized", () => {
            const result = Deserialize(JSON, TestClass);
            expect(result instanceof TestClass).toBeTruthy();
            expect(result.children instanceof Set).toBeTruthy();
            expect(Utility.unpackSet(result.children)).toEqual(JSON.children);
        });

        it("will be deserializedInto", () => {
            const result = DeserializeInto(JSON, TestClass, new TestClass());
            expect(result instanceof TestClass).toBeTruthy();
            expect(result.children instanceof Set).toBeTruthy();
            expect(Utility.unpackSet(result.children)).toEqual(JSON.children);
        });

    });

});

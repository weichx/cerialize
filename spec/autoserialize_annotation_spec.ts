///<reference path="./typings/jasmine.d.ts"/>
import { __TypeMap, autoserialize, autoserializeAs } from '../src/serialize';

class T {
    @autoserialize public x : number;
}

class Vector2 {
    @autoserialize x : number;
    @autoserialize y : number;
}
class AsTest {
    @autoserializeAs(Vector2) v : Vector2;
}

class AsTest2 {
    @autoserializeAs(Vector2, "VECTOR") v : Vector2;
}

class AsTest3 {
    @autoserializeAs("z") y : number;
}

describe('autoserialize', function () {
    it('should create meta data for serialize and deserialize', function() {
        expect(__TypeMap.get(T)).toBeDefined();
        expect(__TypeMap.get(T).length).toBe(1);
        expect(__TypeMap.get(T)[0].serializedKey).toBe('x');
        expect(__TypeMap.get(T)[0].serializedType).toBe(null);
        expect(__TypeMap.get(T)[0].deserializedType).toBe(null);
        expect(__TypeMap.get(T)[0].deserializedKey).toBe('x');
    });
});

describe('autoserializeAs', function() {
    it('should create meta data', function() {
        expect(__TypeMap.get(AsTest)).toBeDefined();
        expect(__TypeMap.get(AsTest).length).toBe(1);
        expect(__TypeMap.get(AsTest)[0].serializedKey).toBe('v');
        expect(__TypeMap.get(AsTest)[0].serializedType).toBe(Vector2);
        expect(__TypeMap.get(AsTest)[0].deserializedKey).toBe('v');
        expect(__TypeMap.get(AsTest)[0].deserializedType).toBe(Vector2);
    });

    it('should create meta data with a different key', function() {
        expect(__TypeMap.get(AsTest3)).toBeDefined();
        expect(__TypeMap.get(AsTest3).length).toBe(1);
        expect(__TypeMap.get(AsTest3)[0].serializedKey).toBe('z');
        expect(__TypeMap.get(AsTest3)[0].serializedType).toBe(null);
        expect(__TypeMap.get(AsTest3)[0].deserializedKey).toBe('z');
        expect(__TypeMap.get(AsTest3)[0].deserializedType).toBe(null);
    });

    it('should create meta data with a different key and type', function() {
        expect(__TypeMap.get(AsTest2)).toBeDefined();
        expect(__TypeMap.get(AsTest2).length).toBe(1);
        expect(__TypeMap.get(AsTest2)[0].serializedKey).toBe('VECTOR');
        expect(__TypeMap.get(AsTest2)[0].serializedType).toBe(Vector2);
        expect(__TypeMap.get(AsTest2)[0].deserializedKey).toBe('VECTOR');
        expect(__TypeMap.get(AsTest2)[0].deserializedType).toBe(Vector2);
    });
});


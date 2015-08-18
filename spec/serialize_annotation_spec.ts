///<reference path="./typings/jasmine.d.ts"/>
import { __TypeMap, serialize, serializeAs } from '../src/serialize';

class T {
    @serialize public x : number;
}

class Vector2 {
    @serialize x : number;
    @serialize y : number;
}
class AsTest {
    @serializeAs(Vector2) v : Vector2;
}

class AsTest2 {
    @serializeAs(Vector2, "VECTOR") v : Vector2;
}

class AsTest3 {
    @serializeAs("z") y : number;
}

describe('serialize', function () {
    it('should create meta data', function() {
        expect(__TypeMap.get(T)).toBeDefined();
        expect(__TypeMap.get(T).length).toBe(1);
        expect(__TypeMap.get(T)[0].serializedKey).toBe('x');
        expect(__TypeMap.get(T)[0].serializedType).toBe(null);
    });
});

describe('serializeAs', function() {
    it('should create meta data', function() {
        expect(__TypeMap.get(AsTest)).toBeDefined();
        expect(__TypeMap.get(AsTest).length).toBe(1);
        expect(__TypeMap.get(AsTest)[0].serializedKey).toBe('v');
        expect(__TypeMap.get(AsTest)[0].serializedType).toBe(Vector2);
    });

    it('should create meta data with a different key', function() {
        expect(__TypeMap.get(AsTest3)).toBeDefined();
        expect(__TypeMap.get(AsTest3).length).toBe(1);
        expect(__TypeMap.get(AsTest3)[0].serializedKey).toBe('z');
        expect(__TypeMap.get(AsTest3)[0].serializedType).toBe(null);
    });

    it('should create meta data with a different key and type', function() {
        expect(__TypeMap.get(AsTest2)).toBeDefined();
        expect(__TypeMap.get(AsTest2).length).toBe(1);
        expect(__TypeMap.get(AsTest2)[0].serializedKey).toBe('VECTOR');
        expect(__TypeMap.get(AsTest2)[0].serializedType).toBe(Vector2);
    });
});


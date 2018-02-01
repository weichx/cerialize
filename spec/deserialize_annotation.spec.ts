///<reference path="./typings/jasmine.d.ts"/>
import { deserialize, deserializeAs } from '../src/index';
import {MetaData} from "../src/meta_data";

class T {
    @deserialize public x : number;
}

class Vector2 {
    @deserialize x : number;
    @deserialize y : number;
}

class AsTest {
    @deserializeAs(Vector2) v : Vector2;
}

class AsTest2 {
    @deserializeAs(Vector2, "VECTOR") v : Vector2;
}

class AsTest3 {
    @deserializeAs("z") y : number;
}

describe('deserialize', function () {

    it('should create meta data', function() {
        expect(MetaData.TypeMap.get(T)).toBeDefined();
        expect(MetaData.TypeMap.get(T).length).toBe(1);
        expect(MetaData.TypeMap.get(T)[0].deserializedKey).toBe('x');
        expect(MetaData.TypeMap.get(T)[0].deserializedType).toBe(null);
    });
});

describe('serializeAs', function() {
    it('should create meta data', function() {
        expect(MetaData.TypeMap.get(AsTest)).toBeDefined();
        expect(MetaData.TypeMap.get(AsTest).length).toBe(1);
        expect(MetaData.TypeMap.get(AsTest)[0].deserializedKey).toBe('v');
        expect(MetaData.TypeMap.get(AsTest)[0].deserializedType).toBe(Vector2);
    });

    it('should create meta data with a different key', function() {
        expect(MetaData.TypeMap.get(AsTest3)).toBeDefined();
        expect(MetaData.TypeMap.get(AsTest3).length).toBe(1);
        expect(MetaData.TypeMap.get(AsTest3)[0].deserializedKey).toBe('z');
        expect(MetaData.TypeMap.get(AsTest3)[0].deserializedType).toBe(null);
    });

    it('should create meta data with a different key and type', function() {
        expect(MetaData.TypeMap.get(AsTest2)).toBeDefined();
        expect(MetaData.TypeMap.get(AsTest2).length).toBe(1);
        expect(MetaData.TypeMap.get(AsTest2)[0].deserializedKey).toBe('VECTOR');
        expect(MetaData.TypeMap.get(AsTest2)[0].deserializedType).toBe(Vector2);
    });
});


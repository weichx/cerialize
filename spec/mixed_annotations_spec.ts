///<reference path="./typings/jasmine.d.ts"/>
import {
    __TypeMap,
    Serialize,
    Deserialize,
    serialize,
    serializeAs,
    deserializeAs,
    deserialize
} from '../src/serialize';

class T {
    @serialize
    @deserialize
    public x : number;
}

class T2 {

    @serializeAs('X')
    @deserializeAs('_X_')
    public x : number;
}

class T3 {
    @serializeAs(T)
    @deserializeAs(T2)
    public t : any;
}

describe('Mixed annotations', function() {
    it('should create meta data for serialize and deserialize', function() {
        expect(__TypeMap.get(T)).toBeDefined();
        expect(__TypeMap.get(T).length).toBe(1);
        expect(__TypeMap.get(T)[0].serializedKey).toBe('x');
        expect(__TypeMap.get(T)[0].serializedType).toBe(null);
        expect(__TypeMap.get(T)[0].deserializedType).toBe(null);
        expect(__TypeMap.get(T)[0].deserializedKey).toBe('x');
    });

    it('can serialize and deserialize with different keys', function() {
        var json = {'_X_': 10};
        var instance = new T2();
        instance.x = 20;
        var serialized = Serialize(instance);
        var deserialized = Deserialize(json, T2);
        expect(serialized.X).toBe(20);
        expect(serialized.x).toBeUndefined();
        expect(deserialized.x).toBe(10);
        expect(deserialized._X_).toBeUndefined();
    });

    it('can serialize and deserialize with different types', function() {
        var json = {t: {'_X_': 10}};
        var instance = new T3();
        instance.t = new T();
        instance.t.x = 20;
        var serialized = Serialize(instance);
        var deserialized = Deserialize(json, T3);
        expect(serialized.t.x).toBe(20);
        expect(serialized.x).toBeUndefined();
        expect(deserialized.t instanceof T2).toBe(true);
        expect(deserialized.t.x).toBe(10);
    });

});


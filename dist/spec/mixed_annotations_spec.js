var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { __TypeMap, Serialize, Deserialize, serialize, serializeAs, deserializeAs, deserialize } from '../src/serialize';
class T {
}
__decorate([
    serialize,
    deserialize
], T.prototype, "x", void 0);
class T2 {
}
__decorate([
    serializeAs('X'),
    deserializeAs('_X_')
], T2.prototype, "x", void 0);
class T3 {
}
__decorate([
    serializeAs(T),
    deserializeAs(T2)
], T3.prototype, "t", void 0);
describe('Mixed annotations', function () {
    it('should create meta data for serialize and deserialize', function () {
        expect(__TypeMap.get(T)).toBeDefined();
        expect(__TypeMap.get(T).length).toBe(1);
        expect(__TypeMap.get(T)[0].serializedKey).toBe('x');
        expect(__TypeMap.get(T)[0].serializedType).toBe(null);
        expect(__TypeMap.get(T)[0].deserializedType).toBe(null);
        expect(__TypeMap.get(T)[0].deserializedKey).toBe('x');
    });
    it('can serialize and deserialize with different keys', function () {
        var json = { '_X_': 10 };
        var instance = new T2();
        instance.x = 20;
        var serialized = Serialize(instance);
        var deserialized = Deserialize(json, T2);
        expect(serialized.X).toBe(20);
        expect(serialized.x).toBeUndefined();
        expect(deserialized.x).toBe(10);
        expect(deserialized._X_).toBeUndefined();
    });
    it('can serialize and deserialize with different types', function () {
        var json = { t: { '_X_': 10 } };
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

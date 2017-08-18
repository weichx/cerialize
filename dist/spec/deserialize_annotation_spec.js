var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { __TypeMap, deserialize, deserializeAs } from '../src/serialize';
class T {
}
__decorate([
    deserialize
], T.prototype, "x", void 0);
class Vector2 {
}
__decorate([
    deserialize
], Vector2.prototype, "x", void 0);
__decorate([
    deserialize
], Vector2.prototype, "y", void 0);
class AsTest {
}
__decorate([
    deserializeAs(Vector2)
], AsTest.prototype, "v", void 0);
class AsTest2 {
}
__decorate([
    deserializeAs(Vector2, "VECTOR")
], AsTest2.prototype, "v", void 0);
class AsTest3 {
}
__decorate([
    deserializeAs("z")
], AsTest3.prototype, "y", void 0);
describe('deserialize', function () {
    it('should create meta data', function () {
        expect(__TypeMap.get(T)).toBeDefined();
        expect(__TypeMap.get(T).length).toBe(1);
        expect(__TypeMap.get(T)[0].deserializedKey).toBe('x');
        expect(__TypeMap.get(T)[0].deserializedType).toBe(null);
    });
});
describe('serializeAs', function () {
    it('should create meta data', function () {
        expect(__TypeMap.get(AsTest)).toBeDefined();
        expect(__TypeMap.get(AsTest).length).toBe(1);
        expect(__TypeMap.get(AsTest)[0].deserializedKey).toBe('v');
        expect(__TypeMap.get(AsTest)[0].deserializedType).toBe(Vector2);
    });
    it('should create meta data with a different key', function () {
        expect(__TypeMap.get(AsTest3)).toBeDefined();
        expect(__TypeMap.get(AsTest3).length).toBe(1);
        expect(__TypeMap.get(AsTest3)[0].deserializedKey).toBe('z');
        expect(__TypeMap.get(AsTest3)[0].deserializedType).toBe(null);
    });
    it('should create meta data with a different key and type', function () {
        expect(__TypeMap.get(AsTest2)).toBeDefined();
        expect(__TypeMap.get(AsTest2).length).toBe(1);
        expect(__TypeMap.get(AsTest2)[0].deserializedKey).toBe('VECTOR');
        expect(__TypeMap.get(AsTest2)[0].deserializedType).toBe(Vector2);
    });
});

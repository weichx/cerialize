var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { __TypeMap, autoserialize, Serialize, Deserialize, DeserializeInto, autoserializeAs } from '../src/serialize';
class T {
}
__decorate([
    autoserialize
], T.prototype, "x", void 0);
class Vector2 {
}
__decorate([
    autoserialize
], Vector2.prototype, "x", void 0);
__decorate([
    autoserialize
], Vector2.prototype, "y", void 0);
class AsTest {
}
__decorate([
    autoserializeAs(Vector2)
], AsTest.prototype, "v", void 0);
class AsTest2 {
}
__decorate([
    autoserializeAs(Vector2, "VECTOR")
], AsTest2.prototype, "v", void 0);
class AsTest3 {
}
__decorate([
    autoserializeAs("z")
], AsTest3.prototype, "y", void 0);
class Test3 {
}
__decorate([
    autoserialize
], Test3.prototype, "primitiveArray", void 0);
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
    it("handles strings", function () {
    });
});
var Utility;
(function (Utility) {
    function unpackSet(_set) {
        const result = [];
        _set.forEach(v => result.push(v));
        return result;
    }
    Utility.unpackSet = unpackSet;
})(Utility || (Utility = {}));
describe('autoserializeAs using Serializer', () => {
    describe('to wrapped data', () => {
        const JSON = {
            children: {
                wrap: [11, 22, 33]
            }
        };
        const Serializer = {
            Serialize(_set) {
                return { wrap: Utility.unpackSet(_set) };
            },
            Deserialize(json, instance) {
                return new Set(json.wrap);
            }
        };
        class TestClass {
            constructor() {
                this.children = new Set();
            }
        }
        __decorate([
            autoserializeAs(Serializer)
        ], TestClass.prototype, "children", void 0);
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
            var result = Deserialize({ primitiveArray: [1, 2, 3] }, Test3);
            expect(Array.isArray(result.primitiveArray)).toBe(true);
        });
    });
    describe('to plain array data', () => {
        const JSON = {
            children: [11, 22, 33]
        };
        const Serializer = {
            Serialize(_set) {
                return Utility.unpackSet(_set);
            },
            Deserialize(json, instance) {
                return new Set(json);
            }
        };
        class TestClass {
            constructor() {
                this.children = new Set();
            }
        }
        __decorate([
            autoserializeAs(Serializer)
        ], TestClass.prototype, "children", void 0);
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

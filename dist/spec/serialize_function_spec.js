var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { serialize, serializeAs, Serialize, serializeIndexable } from '../src/serialize';
class Vector3 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.z = 100;
    }
}
__decorate([
    serialize
], Vector3.prototype, "x", void 0);
__decorate([
    serialize
], Vector3.prototype, "y", void 0);
class TArray {
    constructor(x, y, points) {
        this.x = x;
        this.y = y;
        this.z = 100;
        this.points = points;
    }
}
__decorate([
    serialize
], TArray.prototype, "x", void 0);
__decorate([
    serialize
], TArray.prototype, "y", void 0);
__decorate([
    serializeAs(Vector3)
], TArray.prototype, "points", void 0);
class TSubObject {
    constructor() {
        this.v1 = new Vector3(1, 2);
        this.v2 = new Vector3(2, 1);
    }
    static OnSerialized(instance, json) {
        //do nothing
    }
}
__decorate([
    serializeAs(Vector3, 'specialKey')
], TSubObject.prototype, "v1", void 0);
__decorate([
    serializeAs(Vector3)
], TSubObject.prototype, "v2", void 0);
var SerializeFn = function (src) {
    return 'custom!';
};
var CustomerSerialized = {
    Serialize: SerializeFn
};
class CustomSerializedTest {
}
__decorate([
    serializeAs(CustomerSerialized)
], CustomSerializedTest.prototype, "x", void 0);
class CustomSerializedTest2 {
}
__decorate([
    serializeAs(SerializeFn)
], CustomSerializedTest2.prototype, "x", void 0);
describe('Serialize', function () {
    it('should serialize a primitive', function () {
        expect(Serialize(5)).toBe(5);
        expect(Serialize(true)).toBe(true);
        expect(Serialize(undefined)).toBe(null);
        expect(Serialize(null)).toBe(null);
        expect(Serialize("string")).toBe("string");
    });
    it('should stringify a date', function () {
        var d = new Date();
        expect(Serialize(d)).toBe(d.toISOString());
    });
    it('should stringify a regex', function () {
        var reg = /hi/;
        expect(Serialize(reg)).toBe(reg.toString());
    });
    it('should serialize 0', function () {
        expect(Serialize(0)).toBe(0);
    });
    it('should serialize false', function () {
        expect(Serialize(false)).toBe(false);
    });
    it('should seralize an untyped object', function () {
        var obj = { one: 1, yep: true, now: new Date() };
        var serialized = Serialize(obj);
        expect(serialized).not.toBe(obj);
        expect(serialized.one).toBe(1);
        expect(serialized.yep).toBe(true);
        expect(serialized.now).toBe(obj.now.toISOString());
    });
    it('should serialize a nested untyped object', function () {
        var obj = {
            one: 1, yep: true, now: new Date(), child: {
                childOne: 1, childTwo: 2
            }
        };
        var serialized = Serialize(obj);
        expect(serialized.child.childOne).toBe(1);
        expect(serialized.child.childTwo).toBe(2);
    });
    it('should serialize an untyped array', function () {
        var array = [{ one: 1 }, { two: 2 }, { three: 3 }];
        var serialized = Serialize(array);
        expect(Array.isArray(serialized)).toBe(true);
        expect(serialized.length).toBe(3);
        expect(serialized[0]).not.toBe(array[0]);
        expect(serialized[0].one).toBe(1);
        expect(serialized[1]).not.toBe(array[1]);
        expect(serialized[1].two).toBe(2);
        expect(serialized[2]).not.toBe(array[2]);
        expect(serialized[2].three).toBe(3);
    });
    it('should serialize a typed object', function () {
        var test = new Vector3(1, 2);
        var serialized = Serialize(test);
        expect((serialized instanceof Vector3)).toBe(false);
        expect(serialized.x).toBe(test.x);
        expect(serialized.y).toBe(test.y);
        expect(serialized.z).toBe(void 0);
    });
    it('should serialize object with the given type', function () {
        var test = { x: 1, y: 2, z: 3 };
        var serialized = Serialize(test, Vector3);
        expect((serialized instanceof Vector3)).toBe(false);
        expect(serialized.x).toBe(test.x);
        expect(serialized.y).toBe(test.y);
        expect(serialized.z).toBe(void 0);
    });
    it('should serialize a typed object with a typed array', function () {
        var test = new TArray(10, 11, [new Vector3(1, 2), new Vector3(2, 1)]);
        var serialized = Serialize(test);
        expect(serialized.points).toBeDefined();
        expect(Array.isArray(serialized.points)).toBe(true);
        expect(serialized.points.length).toBe(2);
        expect(serialized.points[0].x).toBe(1);
        expect(serialized.points[0].y).toBe(2);
        expect(serialized.points[0].z).toBe(void 0);
        expect(serialized.points[1].x).toBe(2);
        expect(serialized.points[1].y).toBe(1);
        expect(serialized.points[1].z).toBe(void 0);
        expect(serialized.x).toBe(10);
        expect(serialized.y).toBe(11);
        expect(Object.keys(serialized).length).toBe(3);
    });
    it('should serialize a typed object with typed subobjects', function () {
        var test = new TSubObject();
        var serialized = Serialize(test);
        expect(serialized.specialKey).toBeDefined();
        expect(serialized.specialKey.x).toBe(1);
        expect(serialized.specialKey.y).toBe(2);
        expect(serialized.specialKey.z).toBe(void 0);
        expect(serialized.v2).toBeDefined();
        expect(serialized.v2.x).toBe(2);
        expect(serialized.v2.y).toBe(1);
        expect(serialized.v2.z).toBe(void 0);
    });
    it('will call OnSerialized if a type defines it', function () {
        var test = new TSubObject();
        spyOn(TSubObject, 'OnSerialized').and.callThrough();
        var json = Serialize(test);
        expect(TSubObject.OnSerialized).toHaveBeenCalledWith(test, json);
    });
    it('should use a custom serializer', function () {
        var test = new CustomSerializedTest();
        test.x = 'not custom';
        var result = Serialize(test);
        expect(result.x).toBe('custom!');
    });
    it('should use a custom serialize fn', function () {
        var test = new CustomSerializedTest2();
        test.x = 'not custom';
        var result = Serialize(test);
        expect(result.x).toBe('custom!');
    });
    it('should serialize indexable objects', function () {
        class Y {
            constructor(str) {
                this.thing = str;
            }
        }
        __decorate([
            serialize
        ], Y.prototype, "thing", void 0);
        class X {
        }
        __decorate([
            serializeIndexable(Y)
        ], X.prototype, "yMap", void 0);
        var x = new X();
        x.yMap = {
            1: new Y('one'),
            2: new Y('two')
        };
        var json = Serialize(x);
        expect(json.yMap[1].thing).toBe('one');
        expect(json.yMap[2].thing).toBe('two');
    });
    // it("should apply custom names recursively", function() {
    //     class Person {
    //         @serializeAs(Person, 'Girl_Friend')
    //         public girlFriend : Person;
    //     }
    //     var instance = new Person();
    //     instance.girlFriend = new Person();
    //     instance.girlFriend.girlFriend = new Person();
    //     var json = Serialize(instance, Person);
    // })
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { deserialize, deserializeAs, deserializeIndexable, autoserializeAs, DeserializeInto } from '../src/serialize';
class T1 {
}
class T2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
__decorate([
    deserialize
], T2.prototype, "x", void 0);
class T3 {
    constructor(list) {
        this.list = list;
    }
}
__decorate([
    deserializeAs(T2)
], T3.prototype, "list", void 0);
class T4 {
}
__decorate([
    deserializeAs(T3, 'T3')
], T4.prototype, "t3", void 0);
__decorate([
    autoserializeAs(Date)
], T4.prototype, "date", void 0);
class JsonSubArrayTest {
    constructor() {
        this.obj = {
            array: [{ x: 1 }, { x: 2 }]
        };
    }
}
__decorate([
    deserialize
], JsonSubArrayTest.prototype, "obj", void 0);
class JSONSubObjectTest {
    constructor() {
        this.obj = {
            subobject: {
                a: 1,
                b: 2
            }
        };
    }
}
__decorate([
    deserialize
], JSONSubObjectTest.prototype, "obj", void 0);
class ArrayItem {
    constructor(x) {
        this.x = x;
    }
}
__decorate([
    deserialize
], ArrayItem.prototype, "x", void 0);
class TypedNestedArrayTest {
}
__decorate([
    deserializeAs(ArrayItem)
], TypedNestedArrayTest.prototype, "children", void 0);
class NestedArrayTest {
}
__decorate([
    deserialize
], NestedArrayTest.prototype, "children", void 0);
class NestedArrayOfObjectsTest {
}
__decorate([
    deserialize
], NestedArrayOfObjectsTest.prototype, "children", void 0);
var CustomDeserializer = {
    Deserialize: function (src) {
        return 'custom!';
    }
};
class CustomDeserialized {
}
__decorate([
    deserializeAs(CustomDeserializer)
], CustomDeserialized.prototype, "x", void 0);
describe('DeserializeInto', function () {
    it('should return the same instance passed to it', function () {
        var instance = new T1();
        expect(DeserializeInto({}, T1, instance)).toBe(instance);
    });
    it('will create a new instance of Type if instance argument is null', function () {
        expect(DeserializeInto({}, T1, null) instanceof T1).toBe(true);
    });
    it('will deserialize into an array of Type if instance is an array', function () {
        var instanceArray = [];
        var result = DeserializeInto([{}, {}], T1, instanceArray);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0] instanceof T1).toBe(true);
        expect(result[1] instanceof T1).toBe(true);
    });
    it('will only deserialized fields marked for deserialization', function () {
        var json = { x: 10, y: 20 };
        var instance = new T2(1, 2);
        var result = DeserializeInto(json, T2, instance);
        expect(result.x).toBe(10);
        expect(result.y).toBe(2);
    });
    it('will deserialize an array property and preserve instances', function () {
        var test1 = new T2(1, 1);
        var test2 = new T2(2, 2);
        var instance = new T3([test1, test2]);
        var originalList = instance.list;
        var json = {
            list: [{ x: 10, y: 10 }, { x: 20, y: 20 }]
        };
        instance = DeserializeInto(json, T3, instance);
        expect(instance.list).toBe(originalList);
        expect(instance.list.length).toBe(2);
        expect(instance.list[0]).toBe(test1);
        expect(instance.list[1]).toBe(test2);
        expect(test1.x).toBe(10);
        expect(test1.y).toBe(1);
        expect(test2.x).toBe(20);
        expect(test2.y).toBe(2);
    });
    it('will deserialize an array property and truncate instances', function () {
        var test1 = new T2(1, 1);
        var test2 = new T2(2, 2);
        var instance = new T3([test1, test2]);
        var originalList = instance.list;
        var json = {
            list: [{ x: 10, y: 10 }]
        };
        instance = DeserializeInto(json, T3, instance);
        expect(instance.list).toBe(originalList);
        expect(instance.list.length).toBe(1);
        expect(instance.list[0]).toBe(test1);
        expect(test1.x).toBe(10);
        expect(test1.y).toBe(1);
    });
    it('will deserialize an array property and create instances', function () {
        var test1 = new T2(1, 1);
        var test2 = new T2(2, 2);
        var instance = new T3([test1, test2]);
        var originalList = instance.list;
        var json = {
            list: [{ x: 10, y: 10 }, { x: 20, y: 20 }, { x: 30, y: 30 }]
        };
        instance = DeserializeInto(json, T3, instance);
        expect(instance.list).toBe(originalList);
        expect(instance.list.length).toBe(3);
        expect(instance.list[0]).toBe(test1);
        expect(instance.list[1]).toBe(test2);
        expect(instance.list[2] instanceof T2).toBe(true);
        expect(originalList[2].x).toBe(30);
        expect(originalList[2].y).toBe(void 0);
    });
    it('will deserialize an object with nested deserialized properties', function () {
        var instance = new T4();
        instance.t3 = new T3([]);
        var d = new Date();
        instance.date = d;
        var json = {
            date: new Date().toString(),
            T3: {
                list: [{ x: 1 }, { x: 2 }]
            }
        };
        var result = DeserializeInto(json, T4, instance);
        expect(result.t3.list[0].x).toBe(1);
        expect(result.date).toBe(d);
    });
    it('should deserialize arrays in untyped objects tagged with deserialize', function () {
        var source = new JsonSubArrayTest();
        var json = { obj: { array: [{ x: 3 }, { x: 4 }, { x: 5 }] } };
        var result = DeserializeInto(json, JsonSubArrayTest, source);
        expect(result).toEqual(source);
        expect(result).toBeDefined();
        expect(typeof result.obj === "object").toBeTruthy();
        expect(result.obj.array.length).toBe(3);
        expect(result.obj.array[0]).toEqual(source.obj.array[0]);
        expect(result.obj.array[1]).toEqual(source.obj.array[1]);
        expect(result.obj.array[0].x).toEqual(3);
        expect(result.obj.array[1].x).toEqual(4);
        expect(result.obj.array[2].x).toEqual(5);
    });
    it('should deserialize sub-objects in untyped objects tagged with deserialize', function () {
        var source = new JSONSubObjectTest();
        var originalSubObject = source.obj.subobject;
        expect(source.obj.subobject.c).toBeUndefined();
        var json = { obj: { subobject: { a: 10, b: 20, c: 30 } } };
        var result = DeserializeInto(json, JSONSubObjectTest, source);
        expect(result).toEqual(source);
        expect(result.obj.subobject).toEqual(originalSubObject);
        expect(result.obj.subobject.a).toEqual(10);
        expect(result.obj.subobject.b).toEqual(20);
        expect(result.obj.subobject.c).toEqual(30);
    });
    it('should deserialize with a custom deserializer', function () {
        var testJson = {
            "x": new Date().toString()
        };
        var result = DeserializeInto(testJson, CustomDeserialized, null);
        expect(result.x).toBe("custom!");
    });
    it('will deserialize js nested primitive array tagged with deserialize', function () {
        var json = { children: ["1", "2", "3", "4"] };
        var result = DeserializeInto(json, NestedArrayTest, new NestedArrayTest());
        expect(result.children).toEqual(["1", "2", "3", "4"]);
        expect(result instanceof NestedArrayTest).toBe(true);
    });
    it('will deserialize nested non primitive array tagged with deserialize', function () {
        var json = { children: [{ x: "1" }, { x: "2" }, { x: "3" }, { x: "4" }] };
        var result = DeserializeInto(json, TypedNestedArrayTest, new TypedNestedArrayTest());
        expect(result.children[0].x).toEqual("1");
        expect(result.children[1].x).toEqual("2");
        expect(result.children[2].x).toEqual("3");
        expect(result.children[3].x).toEqual("4");
        expect(result.children[0] instanceof ArrayItem).toBe(true);
        expect(result.children[1] instanceof ArrayItem).toBe(true);
        expect(result.children[2] instanceof ArrayItem).toBe(true);
        expect(result.children[3] instanceof ArrayItem).toBe(true);
    });
    it("will deserialized neseted object array tagged with deserialize", function () {
        var original = new NestedArrayOfObjectsTest();
        original.children = [{ x: "10" }, { x: "20" }, { x: "30" }];
        var json = { children: [{ x: "1" }, { x: "2" }, { x: "3" }, { x: "4" }] };
        var result = DeserializeInto(json, NestedArrayOfObjectsTest, new NestedArrayOfObjectsTest());
        expect(result.children.length).toEqual(4);
        expect(result.children[0].x).toEqual("1");
        expect(result.children[1].x).toEqual("2");
        expect(result.children[2].x).toEqual("3");
        expect(result.children[3].x).toEqual("4");
    });
    it("Should deserialize indexable object", function () {
        class Y {
        }
        __decorate([
            deserialize
        ], Y.prototype, "thing", void 0);
        class X {
            constructor() {
                this.yMap = {};
            }
        }
        __decorate([
            deserializeIndexable(Y)
        ], X.prototype, "yMap", void 0);
        var map = {
            yMap: {
                1: { thing: '1' },
                2: { thing: '2' }
            }
        };
        var x = new X();
        var yMap = x.yMap;
        DeserializeInto(map, X, x);
        expect(x.yMap).toBe(yMap);
        expect(x.yMap[1] instanceof (Y)).toBe(true);
        expect(x.yMap[2] instanceof (Y)).toBe(true);
    });
});

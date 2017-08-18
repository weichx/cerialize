var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { deserialize, deserializeAs, Deserialize, GenericDeserialize, GenericDeserializeInto, deserializeIndexable } from '../src/serialize';
class T1 {
}
class T2 {
    static OnDeserialized() {
    }
}
__decorate([
    deserialize
], T2.prototype, "x", void 0);
__decorate([
    deserialize
], T2.prototype, "y", void 0);
class T3 {
    static OnDeserialized() {
    }
}
__decorate([
    deserializeAs(T2)
], T3.prototype, "child", void 0);
__decorate([
    deserialize
], T3.prototype, "x", void 0);
class T4 {
}
__decorate([
    deserializeAs(Date)
], T4.prototype, "dateList", void 0);
class T5 {
}
__decorate([
    deserializeAs(Date)
], T5.prototype, "date", void 0);
class JsonTest {
    constructor() {
        this.obj = {
            key1: 1,
            nestedKey: {
                key2: 2
            }
        };
    }
}
__decorate([
    deserialize
], JsonTest.prototype, "obj", void 0);
class Fruit {
}
__decorate([
    deserialize
], Fruit.prototype, "name", void 0);
class Tree {
}
__decorate([
    deserialize
], Tree.prototype, "value", void 0);
__decorate([
    deserializeAs(Fruit)
], Tree.prototype, "fruits", void 0);
__decorate([
    deserializeAs(Tree)
], Tree.prototype, "trees", void 0);
var DeserializerFn = function (src) {
    return 'custom!';
};
var Deserializer = {
    Deserialize: DeserializerFn
};
class CustomDeserializeTest {
}
__decorate([
    deserializeAs(Deserializer)
], CustomDeserializeTest.prototype, "x", void 0);
class CustomDeserializeTest2 {
}
__decorate([
    deserializeAs(DeserializerFn)
], CustomDeserializeTest2.prototype, "x", void 0);
describe('Deserialize', function () {
    it('should not deserialize if not marked with deserializer', function () {
        var json = { x: 1, y: 2 };
        var instance = Deserialize(json, T1);
        expect((instance instanceof T1)).toBe(true);
        expect(instance.x).toBeUndefined();
        expect(instance.y).toBeUndefined();
    });
    it('should deserialize if marked with deserializer', function () {
        var json = { x: 1, y: 2 };
        var instance = Deserialize(json, T2);
        expect((instance instanceof T2)).toBe(true);
        expect(instance.x).toBe(1);
        expect(instance.y).toBe(2);
    });
    it('should deserialize an array', function () {
        var json = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
        var list = Deserialize(json, T2);
        expect(Array.isArray(list));
        expect(list.length).toBe(2);
        expect(list[0] instanceof T2).toBe(true);
        expect(list[0].x).toBe(1);
        expect(list[0].y).toBe(1);
        expect(list[1] instanceof T2).toBe(true);
        expect(list[1].x).toBe(2);
        expect(list[1].y).toBe(2);
    });
    it('should deserialize a primitive', function () {
        expect(Deserialize(1)).toBe(1);
        expect(Deserialize(null)).toBe(null);
        expect(Deserialize(false)).toBe(false);
        expect(Deserialize(true)).toBe(true);
        expect(Deserialize('1')).toBe('1');
    });
    it('should deserialize a date', function () {
        var d = new Date();
        var dateStr = d.toString();
        var result = Deserialize(dateStr, Date);
        expect(result instanceof Date).toBe(true);
    });
    it('should deserialize a date even when it\'s not a string', function () {
        var d = new Date();
        var result = Deserialize(d, Date);
        expect(result instanceof Date).toBe(true);
        expect(result.toString()).toEqual(d.toString());
    });
    it('should deserialize a regex', function () {
        var r = /hi/;
        var regexStr = r.toString();
        var result = Deserialize(regexStr, RegExp);
        expect(result instanceof RegExp).toBe(true);
    });
    it('should deserialize a nested object as a type', function () {
        var t3 = { child: { x: 1, y: 1 }, x: 2 };
        var result = Deserialize(t3, T3);
        expect(result instanceof T3).toBe(true);
        expect(result.child instanceof T2).toBe(true);
        expect(result.child.x).toBe(1);
        expect(result.child.y).toBe(1);
        expect(result.x).toBe(2);
    });
    it('should deserialize a nested array as a type', function () {
        var d1 = new Date();
        var d2 = new Date();
        var d3 = new Date();
        var t4 = { dateList: [d1.toString(), d2.toString(), d3] };
        var result = Deserialize(t4, T4);
        expect(result instanceof T4).toBeTruthy();
        expect(Array.isArray(result.dateList)).toBe(true);
        expect(result.dateList[0].toString()).toEqual(d1.toString());
        expect(result.dateList[1].toString()).toEqual(d2.toString());
        expect(result.dateList[2].toString()).toEqual(d3.toString());
    });
    it('should deserialize a Date property even if source is a Date object', function () {
        var t5 = { date: new Date() };
        var result = Deserialize(t5, T5);
        expect(result instanceof T5).toBeTruthy();
        expect(result.date.toString()).toEqual(t5.date.toString());
    });
    it('should call OnDeserialize if defined on parent and or child', function () {
        var json = {
            child: { x: 1, y: 1 },
            x: 10
        };
        spyOn(T3, 'OnDeserialized').and.callThrough();
        spyOn(T2, 'OnDeserialized').and.callThrough();
        var result = Deserialize(json, T3);
        expect(T3.OnDeserialized).toHaveBeenCalledWith(result, json);
        expect(T2.OnDeserialized).toHaveBeenCalledWith(result.child, json.child);
    });
    it('should deserialize js objects tagged with deserialize', function () {
        var testJson = new JsonTest();
        var result = Deserialize(testJson, JsonTest);
        expect(result).toBeDefined();
        expect(typeof result.obj === "object").toBeTruthy();
        expect(result.obj.key1).toBe(1);
        expect(result.obj.nestedKey.key2).toBe(2);
    });
    it('should deserialize js primitive arrays tagged with deserialize', function () {
    });
    it('should use a custom deserializer', function () {
        var testJson = {
            "x": new Date().toString()
        };
        var result = Deserialize(testJson, CustomDeserializeTest);
        expect(result.x).toBe("custom!");
    });
    it('should use a custom deserialize function', function () {
        var testJson = {
            "x": new Date().toString()
        };
        var result = Deserialize(testJson, CustomDeserializeTest2);
        expect(result.x).toBe("custom!");
    });
    it('should cast to primitive array when given a primitive type', function () {
        class Test {
        }
        __decorate([
            deserializeAs(String)
        ], Test.prototype, "arrayOfString", void 0);
        __decorate([
            deserializeAs(Number)
        ], Test.prototype, "arrayOfNumber", void 0);
        __decorate([
            deserializeAs(Boolean)
        ], Test.prototype, "arrayOfBoolean", void 0);
        var json = {
            arrayOfString: ['String1', 'String2'],
            arrayOfNumber: [1, 2],
            arrayOfBoolean: [true, false]
        };
        var test = Deserialize(json, Test);
        expect(Array.isArray(test.arrayOfString)).toBe(true);
        expect(test.arrayOfString[0]).toBe("String1");
        expect(test.arrayOfString[1]).toBe("String2");
        expect(Array.isArray(test.arrayOfNumber)).toBe(true);
        expect(test.arrayOfNumber[0]).toBe(1);
        expect(test.arrayOfNumber[1]).toBe(2);
        expect(Array.isArray(test.arrayOfBoolean)).toBe(true);
        expect(test.arrayOfBoolean[0]).toBe(true);
        expect(test.arrayOfBoolean[1]).toBe(false);
    });
    it('should cast to primitive type when given a primitive type', function () {
        class Test {
        }
        __decorate([
            deserializeAs(String)
        ], Test.prototype, "str", void 0);
        __decorate([
            deserializeAs(Number)
        ], Test.prototype, "num", void 0);
        __decorate([
            deserializeAs(Boolean)
        ], Test.prototype, "bool", void 0);
        __decorate([
            deserializeAs(Number)
        ], Test.prototype, "float", void 0);
        var json = {
            str: 1,
            num: "2",
            bool: 3,
            float: "3.1415"
        };
        var test = Deserialize(json, Test);
        expect(test.str).toBe('1');
        expect(test.num).toBe(2);
        expect(test.bool).toBe(true);
        expect(test.float).toBe(3.1415);
    });
    //contributed by @1ambda
    it('should deserialize a json including nested empty arrays', function () {
        var root1 = {
            trees: new Array(),
            value: "root1"
        };
        var deserialized1 = Deserialize(root1, Tree);
        expect(deserialized1.trees.length).toBe(0);
        expect(deserialized1.value).toBe("root1");
        /**
         * `-- root
         *     |-- t1
         *     `-- t2
         *         |-- t3
         *         `-- t4
         */
        var root2 = {
            trees: [{
                    value: "t1",
                    trees: new Array()
                }, {
                    value: "t2",
                    trees: [{
                            value: "t3",
                            trees: new Array()
                        }, {
                            value: "t4",
                            trees: new Array()
                        }]
                }],
            value: "root2"
        };
        var deserialized2 = Deserialize(root2, Tree);
        expect(deserialized2.trees.length).toBe(2);
        expect(deserialized2.trees[0].trees.length).toBe(0); /* t1 includes empty trees */
        expect(deserialized2.trees[1].trees.length).toBe(2); /* t2 includes 2 trees (t3, t4) */
    });
    it("should deserialize custom objects into an array", function () {
        // class Item { }
    });
    it("should deserialize empty json into an empty string");
    it('should deserialize a json including nested, multiple empty arrays', function () {
        var root1 = {
            fruits: new Array(),
            trees: new Array(),
            value: "root1"
        };
        var deserialized1 = Deserialize(root1, Tree);
        expect(deserialized1.trees.length).toBe(0);
        expect(deserialized1.value).toBe("root1");
        expect(deserialized1.fruits.length).toBe(0);
        /**
         * `-- root
         *     |-- t1 including f1
         *     `-- t2
         *         |-- t3 including f3
         *         `-- t4
         */
        var root2 = {
            trees: [{
                    value: "t1",
                    trees: new Array(),
                    fruits: new Array(),
                }, {
                    value: "t2",
                    trees: [{
                            value: "t3",
                            trees: new Array(),
                            fruits: new Array(),
                        }, {
                            value: "t4",
                            trees: new Array()
                        }]
                }],
            value: "root2"
        };
        var deserialized2 = Deserialize(root2, Tree);
        expect(deserialized2.trees.length).toBe(2);
        expect(deserialized2.trees[0].trees.length).toBe(0); /* t1 includes empty trees */
        expect(deserialized2.trees[0].fruits.length).toBe(0); /* t1 includes empty fruits */
        expect(deserialized2.trees[1].trees.length).toBe(2); /* t2 includes 2 trees (t3, t4) */
        expect(deserialized2.trees[1].trees[0].trees.length).toBe(0); /* t3 includes empty trees */
        expect(deserialized2.trees[1].trees[0].fruits.length).toBe(0); /* t3 includes fruits trees */
        expect(deserialized2.trees[1].trees[1].trees.length).toBe(0); /* t4 includes empty trees */
        expect(deserialized2.trees[1].trees[1].fruits).toBeUndefined(); /* t4 has no fruits */
    });
    it("Should deserialize indexable object", function () {
        class Y {
        }
        __decorate([
            deserialize
        ], Y.prototype, "thing", void 0);
        class X {
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
        var x = Deserialize(map, X);
        expect(x.yMap[1] instanceof (Y)).toBe(true);
        expect(x.yMap[2] instanceof (Y)).toBe(true);
    });
});
describe('Deserialize generics', function () {
    it('should handle a generic deserialize', function () {
        var tree = GenericDeserialize({ value: "someValue" }, Tree);
        expect((tree instanceof Tree)).toBe(true);
        expect(tree.value).toBe("someValue");
    });
    it('should handle a generic deserializeInto', function () {
        var tree = new Tree();
        tree.value = 'hello';
        var tree2 = GenericDeserializeInto({ value: "someValue" }, Tree, tree);
        expect((tree2 instanceof Tree)).toBe(true);
        expect(tree2).toBe(tree);
        expect(tree.value).toBe("someValue");
    });
});
export class Deserializable {
    static deserialize(ctor, json) {
        return Deserialize(json, ctor);
    }
    static deserializeArray(ctor, json) {
        return Deserialize(json, ctor);
    }
}
class Car extends Deserializable {
}
__decorate([
    deserialize
], Car.prototype, "engine", void 0);
__decorate([
    deserialize
], Car.prototype, "wheels", void 0);
describe("Deserializable", () => {
    describe("deserialize", () => {
        it("should parse Car", () => {
            let json = { engine: "M5", wheels: 4 };
            let c1 = Car.deserialize(Car, json);
            let c2 = Car.deserialize(Car, json); // without NoParamConstructor
            expect(c1.engine).toEqual(json.engine);
            expect(c1.wheels).toEqual(json.wheels);
        });
    });
});

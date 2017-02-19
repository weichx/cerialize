///<reference path="./typings/jasmine.d.ts"/>
import {
    deserialize, deserializeAs, Deserialize, GenericDeserialize,
    GenericDeserializeInto, deserializeIndexable
} from '../src/serialize';

class T1 {
    public x : number;
    public y : number;
}

class T2 {
    @deserialize public x : number;
    @deserialize public y : number;

    public static OnDeserialized() : void {
    }
}

class T3 {
    @deserializeAs(T2) child : T2;
    @deserialize x : number;

    public static OnDeserialized() : void {
    }
}

class T4 {
    @deserializeAs(Date) dateList : Array<Date>;
}

class T5 {
    @deserializeAs(Date) date: Date;
}

class JsonTest {
    @deserialize public obj : any;

    constructor() {
        this.obj = {
            key1: 1,
            nestedKey : {
                key2: 2
            }
        }
    }
}

class Fruit {
    @deserialize public name: string;
}

class Tree {
    @deserialize public value: string;
    @deserializeAs(Fruit) fruits: Array<Fruit>;
    @deserializeAs(Tree) trees: Array<Tree>;
}

var DeserializerFn = function(src : any) : any {
    return 'custom!';
};

var Deserializer = {
    Deserialize: DeserializerFn
};

class CustomDeserializeTest {
    @deserializeAs(Deserializer) public x : string;
}

class CustomDeserializeTest2 {
    @deserializeAs(DeserializerFn) public x : string;
}

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
        expect(result.toString()).toEqual(d.toString())
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
        var t5 = { date: new Date() }
        var result = Deserialize(t5, T5);
        expect(result instanceof T5).toBeTruthy();
        expect(result.date.toString()).toEqual(t5.date.toString());
    });

    it('should call OnDeserialize if defined on parent and or child', function () {
        var json = {
            child: {x : 1, y: 1},
            x: 10
        };
        spyOn(T3, 'OnDeserialized').and.callThrough();
        spyOn(T2, 'OnDeserialized').and.callThrough();

        var result = Deserialize(json, T3);

        expect(T3.OnDeserialized).toHaveBeenCalledWith(result, json);
        expect(T2.OnDeserialized).toHaveBeenCalledWith(result.child, json.child);
    });

    it('should deserialize js objects tagged with deserialize', function(){
        var testJson = new JsonTest();
        var result = Deserialize(testJson, JsonTest);
        expect(result).toBeDefined();
        expect(typeof result.obj === "object").toBeTruthy();
        expect(result.obj.key1).toBe(1);
        expect(result.obj.nestedKey.key2).toBe(2);
    });

    it('should deserialize js primitive arrays tagged with deserialize', function() {

    });

    it('should use a custom deserializer', function() {
        var testJson = {
            "x": new Date().toString()
        };
        var result = Deserialize(testJson, CustomDeserializeTest);
        expect(result.x).toBe("custom!");
    });

    it('should use a custom deserialize function', function() {
        var testJson = {
            "x": new Date().toString()
        };
        var result = Deserialize(testJson, CustomDeserializeTest2);
        expect(result.x).toBe("custom!");
    });

    it('should cast to primitive array when given a primitive type', function() {
        class Test {
            @deserializeAs(String) public arrayOfString: Array<string>;
            @deserializeAs(Number) public arrayOfNumber: Array<number>;
            @deserializeAs(Boolean) public arrayOfBoolean: Array<boolean>;
        }
        var json = {
            arrayOfString: ['String1', 'String2'],
            arrayOfNumber: [1, 2],
            arrayOfBoolean: [true, false]
        };

        var test : Test = Deserialize(json, Test);
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

    it('should cast to primitive type when given a primitive type', function() {
        class Test {
            @deserializeAs(String) public str: string;
            @deserializeAs(Number) public num: number;
            @deserializeAs(Boolean) public bool: boolean;
            @deserializeAs(Number) public float: number;
        }
        var json = {
            str: 1,
            num: "2",
            bool: 3,
            float: "3.1415"
        };

        var test : Test = Deserialize(json, Test);
        expect(test.str).toBe('1');
        expect(test.num).toBe(2);
        expect(test.bool).toBe(true);
        expect(test.float).toBe(3.1415);
    });

    //contributed by @1ambda
    it('should deserialize a json including nested empty arrays', function() {
        var root1 = {
            trees: new Array<Tree>(),
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
                value: "t1" ,
                trees: new Array<Tree>()
            }, {
                value: "t2",
                trees: [{
                    value: "t3",
                    trees: new Array<Tree>()
                }, {
                    value: "t4",
                    trees: new Array<Tree>()
                }]
            }],
            value: "root2"
        };

        var deserialized2 = Deserialize(root2, Tree);
        expect(deserialized2.trees.length).toBe(2);
        expect(deserialized2.trees[0].trees.length).toBe(0); /* t1 includes empty trees */
        expect(deserialized2.trees[1].trees.length).toBe(2); /* t2 includes 2 trees (t3, t4) */
    });

    it('should deserialize a json including nested, multiple empty arrays', function() {
        var root1 = {
            fruits: new Array<Fruit>(),
            trees: new Array<Tree>(),
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
                value: "t1" ,
                trees: new Array<Tree>(),
                fruits: new Array<Fruit>(),
            }, {
                value: "t2",
                trees: [{
                    value: "t3",
                    trees: new Array<Tree>(),
                    fruits: new Array<Fruit>(),
                }, {
                    value: "t4",
                    trees: new Array<Tree>()
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
            @deserialize thing : string;
        }

        class X {
            @deserializeIndexable(Y) yMap : any;
        }

        var map : any = {
            yMap: {
                1: { thing: '1' },
                2: { thing: '2' }
            }
        };

        var x : X = Deserialize(map, X);
        expect(x.yMap[1] instanceof(Y)).toBe(true);
        expect(x.yMap[2] instanceof(Y)).toBe(true);
    });

});

describe('Deserialize generics', function () {

    it('should handle a generic deserialize', function () {
        var tree = GenericDeserialize({value: "someValue"}, Tree);
        expect((tree instanceof  Tree)).toBe(true);
        expect(tree.value).toBe("someValue");
    });

    it('should handle a generic deserializeInto', function () {
        var tree = new Tree();
        tree.value = 'hello';
        var tree2 = GenericDeserializeInto({value: "someValue"}, Tree, tree);
        expect((tree2 instanceof  Tree)).toBe(true);
        expect(tree2).toBe(tree);
        expect(tree.value).toBe("someValue");
    });

});

//rest of file contributed by @1ambda
export interface NoParamConstructor<T> {
    new (): T
}

export abstract class Deserializable {
    public static deserialize<T>(ctor: NoParamConstructor<T>, json : any): T {
        return Deserialize(json, ctor);
    }

    public static deserializeArray<T>(ctor: NoParamConstructor<T>, json : any): Array<T> {
        return Deserialize(json, ctor);
    }
}

class Car extends Deserializable {
    @deserialize public engine: string;
    @deserialize public wheels: number;
}

describe("Deserializable", () => {
    describe("deserialize", () => {
        it("should parse Car", () => {
            let json : any = {engine: "M5", wheels: 4};
            let c1 = Car.deserialize(Car, json);
            let c2 = Car.deserialize<Car>(Car, json); // without NoParamConstructor

            expect(c1.engine).toEqual(json.engine);
            expect(c1.wheels).toEqual(json.wheels);
        });
    });


});

import {
    autoserializeAs,
    autoserializeAsArray,
    autoserializeAsJson,
    autoserializeAsMap,
    autoserializeUsing,
    Deserialize,
    deserializeAs,
    deserializeAsArray,
    deserializeAsJson,
    deserializeAsMap,
    deserializeUsing, SetDeserializeKeyTransform,
    SetDefaultInstantiationMethod
}                                                   from "../src";
import {InstantiationMethod, Indexable, JsonObject} from "../src/util";

function expectInstance(instance : any, type : any, instantiationMethod : InstantiationMethod) {
    switch (instantiationMethod) {
		case InstantiationMethod.New:
		case InstantiationMethod.ObjectCreate:
			expect(instance instanceof type).toBe(true);
			break;

		case InstantiationMethod.None:
			expect(instance instanceof type).toBeFalsy();
			expect(instance.toString()).toBe("[object Object]");
			break;
	}
}

function expectTarget(target : any, instance : any, shouldMakeTarget : boolean) {
    expect(instance === target).toBe(shouldMakeTarget);
}

function createTarget(shouldMakeTarget : boolean, shouldinstantiationMethod : InstantiationMethod, type : any) {
    if (!shouldMakeTarget) return null;

    switch (shouldinstantiationMethod) {
        case InstantiationMethod.New:
            return new type();

        case InstantiationMethod.ObjectCreate:
            return Object.create(type.prototype);

        case InstantiationMethod.None:
            return {};
    }
}

describe("Deserializing", function () {

    describe("Unannotated", function () {

        it("will not deserialize unannotated fields", function () {

            class Test {
                value : number = 1;
            }

            const instance = Deserialize({ value: 2 }, Test);
            expect(instance.value).toBe(1);
            expect(instance instanceof Test).toBe(true);

        });

    });

    describe("DeserializeAs", function () {

        function runTests(blockName : string, instantiationMethod : InstantiationMethod, deserializeAs : any, makeTarget : boolean) {

            describe(blockName, function () {

                it("deserializes basic primitives", function () {

                    class Test {
                        @deserializeAs(String) value0 : string = "strvalue";
                        @deserializeAs(Boolean) value1 : boolean = true;
                        @deserializeAs(Number) value2 : number = 100;
                    }

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize({
                        value0: "strvalue1",
                        value1: false,
                        value2: 101
                    }, Test, target, instantiationMethod);
                    expect(instance.value0).toBe("strvalue1");
                    expect(instance.value1).toBe(false);
                    expect(instance.value2).toBe(101);
                    expectTarget(instance, target, makeTarget);
                    expectInstance(instance, Test, instantiationMethod);

                });

                it("deserializes a Date", function () {
                    class Test {
                        @deserializeAs(Date) value0 : Date;
                    }

                    const d = new Date().toString();
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize({ value0: d }, Test, target, instantiationMethod);
                    expect(instance.value0 instanceof Date).toBe(true);
                    expect(instance.value0.toString()).toBe(d);
                    expectTarget(target, instance, makeTarget);
                    expectInstance(instance, Test, instantiationMethod);
                });

                it("deserializes a RegExp", function () {
                    class Test {
                        @deserializeAs(RegExp) value0 : RegExp;
                    }

                    const d = (new RegExp("/[123]/g")).toString();
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize({ value0: d }, Test, target, instantiationMethod);
                    expect(instance.value0 instanceof RegExp).toBe(true);
                    expect(instance.value0.toString()).toBe(d);
                    expectTarget(instance, target, makeTarget);
                    expectInstance(instance, Test, instantiationMethod);

                });

                it("deserializes a non primitive value", function () {
                    class Thing {
                        @deserializeAs(Number) value : number = 1;
                    }

                    class Test {
                        @deserializeAs(Thing) thing : Thing;
                    }

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    if (target) target.thing = createTarget(makeTarget, instantiationMethod, Thing);
                    const instance = Deserialize({ thing: { value: 2 } }, Test, target, instantiationMethod);
                    expect(instance.thing.value).toBe(2);
                    expectTarget(target, instance, makeTarget);
                    if (target) {
                        expectTarget(target.thing, instance.thing, makeTarget);
                    }
                    expectInstance(instance.thing, Thing, instantiationMethod);
                    expectInstance(instance, Test, instantiationMethod);
                });

                it("deserializes non matching primitive types", function () {
                    class Test {
                        @deserializeAs(Number) value0 : string;
                        @deserializeAs(String) value1 : boolean;
                        @deserializeAs(Boolean) value2 : number;
                    }

                    const json = {
                        value0: 100,
                        value1: true,
                        value2: "100"
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance.value0).toBe(100);
                    expect(instance.value1).toBe("true");
                    expect(instance.value2).toBe(true);
                    expectTarget(target, instance, makeTarget);
                });

                it("deserializes with different keys", function () {
                    class Test {
                        @deserializeAs(String, "str") value0 : string;
                        @deserializeAs(Boolean, "bool") value1 : boolean;
                        @deserializeAs(Number, "num") value2 : number;
                    }

                    const json = {
                        str: "strval",
                        bool: true,
                        num: 100
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance.value0).toBe("strval");
                    expect(instance.value1).toBe(true);
                    expect(instance.value2).toBe(100);
                    expectTarget(target, instance, makeTarget);
                });

                it("skips undefined keys", function () {
                    class Test {
                        @deserializeAs(String) value0 : string = "val";
                        @deserializeAs(Boolean) value1 : boolean;
                        @deserializeAs(Number) value2 : number;
                    }

                    const json : any = {
                        value0: void 0,
                        value1: true,
                        value2: 100
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    if (instantiationMethod) {
                        expect(instance.value0).toBe("val");
                    }
                    else {
                        expect(instance.value0).toBeUndefined();
                    }
                    expect(instance.value1).toBe(true);
                    expect(instance.value2).toBe(100);
                });

                it("does not skip null keys", function () {
                    class Test {
                        @deserializeAs(String) value0 : string = "val";
                        @deserializeAs(Boolean) value1 : boolean;
                        @deserializeAs(Number) value2 : number;
                    }

                    const json : any = {
                        value0: null,
                        value1: true,
                        value2: 100
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance.value0).toBe(null);
                    expect(instance.value1).toBe(true);
                    expect(instance.value2).toBe(100);
                    expectTarget(target, instance, makeTarget);

                });

                it("deserializes nested types", function () {
                    class Test {
                        @deserializeAs(String) value0 : string = "bad";
                        @deserializeAs(Boolean) value1 : boolean = false;
                        @deserializeAs(Number) value2 : number = 1;
                    }

                    class Test0 {
                        @deserializeAs(Test) test : Test;
                    }

                    const json = {
                        test: { value0: "str", value1: true, value2: 100 }
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test0);
                    if (target) target.test = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test0, target, instantiationMethod);
                    expectInstance(instance.test, Test, instantiationMethod);
                    if (target) expectInstance(target.test, Test, instantiationMethod);
                    expect(instance.test.value0).toBe("str");
                    expect(instance.test.value1).toBe(true);
                    expect(instance.test.value2).toBe(100);
                });

                it("deserializes doubly nested types", function () {
                    class Test0 {
                        @deserializeAs(String) value0 : string = "bad";
                        @deserializeAs(Boolean) value1 : boolean = false;
                        @deserializeAs(Number) value2 : number = 1;
                    }

                    class Test1 {
                        @deserializeAs(Test0) test0 : Test0;
                    }

                    class Test2 {
                        @deserializeAs(Test1) test1 : Test1;
                    }

                    const json = {
                        test1: { test0: { value0: "str", value1: true, value2: 100 } }
                    };

                    const target = createTarget(makeTarget, instantiationMethod, Test2);
                    if (target) {
                        target.test1 = createTarget(makeTarget, instantiationMethod, Test1);
                        if (target.test1) {
                            target.test1.test0 = createTarget(makeTarget, instantiationMethod, Test0);
                        }
                    }
                    const instance = Deserialize(json, Test2, target, instantiationMethod);
                    expectInstance(instance.test1, Test1, instantiationMethod);
                    expectInstance(instance.test1.test0, Test0, instantiationMethod);
                    if (target) {
                        expectTarget(target, instance, makeTarget);
                        expectTarget(target.test1, instance.test1, makeTarget);
                        expectTarget(target.test1.test0, instance.test1.test0, makeTarget);
                    }
                    expect(instance.test1.test0.value0).toBe("str");
                    expect(instance.test1.test0.value1).toBe(true);
                    expect(instance.test1.test0.value2).toBe(100);
                });

            });

        }

        runTests("Normal > Create Instances > With Target", InstantiationMethod.New, deserializeAs, true);
        runTests("Normal > Create Instances > Without Target", InstantiationMethod.New, deserializeAs, false);
        runTests("Normal > No Instances > With Target", InstantiationMethod.None, deserializeAs, true);
        runTests("Normal > No Instances > Without Target", InstantiationMethod.None, deserializeAs, false);
        runTests("Auto > Create Instances > With Target", InstantiationMethod.New, autoserializeAs, true);
        runTests("Auto > Create Instances > Without Target", InstantiationMethod.New, autoserializeAs, false);
        runTests("Auto > No Instances > With Target", InstantiationMethod.None, autoserializeAs, true);
        runTests("Auto > No Instances > Without Target", InstantiationMethod.None, autoserializeAs, false);

    });

    describe("DeserializeAsMap", function () {

        function runTests(blockName : string, instantiationMethod : InstantiationMethod, deserializeAs : any, deserializeAsMap : any, makeTarget : boolean) {

            describe(blockName, function () {

                it("deserializes a map of primitives", function () {

                    class Test {
                        @deserializeAsMap(Number) values : Indexable<number>;
                    }

                    const json = { values: { v0: 0, v1: 1, v2: 2 } };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance.values).toEqual({ v0: 0, v1: 1, v2: 2 });
                    expectInstance(instance, Test, instantiationMethod);
                    expectTarget(target, instance, makeTarget);

                });

                it("deserializes a map of non primitives", function () {
                    class TestType {
                        @deserializeAs(Number) value : number;

                        constructor(arg : number) {
                            this.value = arg;
                        }
                    }

                    class Test {
                        @deserializeAsMap(TestType) values : Indexable<TestType>;
                    }

                    const json = {
                        values: {
                            v0: { value: 1 },
                            v1: { value: 2 },
                            v2: { value: 3 }
                        }
                    };

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance.values.v0).toEqual({ value: 1 });
                    expect(instance.values.v1).toEqual({ value: 2 });
                    expect(instance.values.v2).toEqual({ value: 3 });
                });

                it("deserializes nested maps", function () {
                    class TestType {
                        @deserializeAsMap(Number) value : Indexable<number>;

                        constructor(arg : Indexable<number>) {
                            this.value = arg;
                        }
                    }

                    class Test {
                        @deserializeAsMap(TestType) values : Indexable<TestType>;
                    }

                    const json = {
                        values: {
                            v0: { value: { v00: 1, v01: 2 } },
                            v1: { value: { v10: 2, v11: 2 } },
                            v2: { value: { v20: 3, v21: 2 } }
                        }
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance.values).toEqual({
                        v0: { value: { v00: 1, v01: 2 } },
                        v1: { value: { v10: 2, v11: 2 } },
                        v2: { value: { v20: 3, v21: 2 } }
                    });
                });

                it("skips undefined keys", function () {
                    class Test {
                        @deserializeAsMap(Number) values : Indexable<number>;
                    }

                    const json : any = {
                        values: {
                            v0: void 0,
                            v1: 1,
                            v2: 2
                        }
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        values: {
                            v1: 1,
                            v2: 2
                        }
                    });
                });

                it("deserializes a map with different key name", function () {
                    class TestType {
                        @deserializeAs(Number) value : number;

                        constructor(arg : number) {
                            this.value = arg;
                        }
                    }

                    class Test {
                        @deserializeAsMap(TestType, "different") values : Indexable<TestType>;
                    }

                    const json = {
                        different: { v0: { value: 1 }, v1: { value: 2 } }
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance.values).toEqual({
                        v0: { value: 1 }, v1: { value: 2 }
                    });

                });

                it("throws an exeption if input is not a map type", function () {
                    class Test {
                        @deserializeAsMap(Number) values : Indexable<number>;
                    }

                    expect(function () {
                        const json = { values: 1 };
                        const target = createTarget(makeTarget, instantiationMethod, Test);
                        const instance = Deserialize(json, Test, target, instantiationMethod);
                    }).toThrow("Expected input to be of type `object` but received: number");

                    expect(function () {
                        const json = { values: false };
                        const target = createTarget(makeTarget, instantiationMethod, Test);
                        const instance = Deserialize(json, Test, target, instantiationMethod);
                    }).toThrow("Expected input to be of type `object` but received: boolean");

                    expect(function () {
                        const json = { values: "str" };
                        const target = createTarget(makeTarget, instantiationMethod, Test);
                        const instance = Deserialize(json, Test, target, instantiationMethod);
                    }).toThrow("Expected input to be of type `object` but received: string");

                });

                it("deserializes a null map", function () {

                    class Test {
                        @deserializeAsMap(Number) values : Indexable<number>;
                    }

                    const json : any = { values: null };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance.values).toBeNull();

                });

            });

        }

        runTests("Normal > Create Instances > With Target", InstantiationMethod.New, deserializeAs, deserializeAsMap, true);
        runTests("Normal > Create Instances > Without Target", InstantiationMethod.New, deserializeAs, deserializeAsMap, false);
        runTests("Normal > No Instances > With Target", InstantiationMethod.None, deserializeAs, deserializeAsMap, true);
        runTests("Normal > No Instances > Without Target", InstantiationMethod.None, deserializeAs, deserializeAsMap, false);
        runTests("Auto > Create Instances > With Target", InstantiationMethod.New, autoserializeAs, autoserializeAsMap, true);
        runTests("Auto > Create Instances > Without Target", InstantiationMethod.New, autoserializeAs, autoserializeAsMap, false);
        runTests("Auto > No Instances > With Target", InstantiationMethod.None, autoserializeAs, autoserializeAsMap, true);
        runTests("Auto > No Instances > Without Target", InstantiationMethod.None, autoserializeAs, autoserializeAsMap, false);

    });

    describe("DeserializeAsArray", function () {

        function runTests(blockName : string, instantiationMethod : InstantiationMethod, deserializeAs : any, deserializeAsArray : any, makeTarget : boolean) {

            describe(blockName, function () {

                it("deserializes an array of primitives", function () {
                    class Test {
                        @deserializeAsArray(Number) value : Array<number>;
                    }

                    const json = { value: [1, 2, 3] };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(Array.isArray(instance.value)).toBeTruthy();
                    expect(instance.value).toEqual([1, 2, 3]);
                    expectInstance(instance, Test, instantiationMethod);
                    expectTarget(target, instance, makeTarget);
                });

                it("deserializes an array of typed objects", function () {
                    class TestType {
                        @deserializeAs(String) strVal : string;

                        constructor(val : string) {
                            this.strVal = val;
                        }
                    }

                    class Test {
                        @deserializeAsArray(TestType) value : Array<TestType>;
                    }

                    const json = {
                        value: [
                            { strVal: "0" },
                            { strVal: "1" },
                            { strVal: "2" }
                        ]
                    };

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expectInstance(instance, Test, instantiationMethod);
                    expectTarget(target, instance, makeTarget);
                    expect(instance.value).toEqual([
                        { strVal: "0" },
                        { strVal: "1" },
                        { strVal: "2" }
                    ]);
                    if (instantiationMethod) {
                        expect(instance.value[0] instanceof TestType).toBeTruthy();
                        expect(instance.value[1] instanceof TestType).toBeTruthy();
                        expect(instance.value[2] instanceof TestType).toBeTruthy();
                    }
                    expect(instance.value.length).toBe(3);
                });

                it("deserializes nested arrays", function () {
                    class TestTypeL0 {
                        @deserializeAs(String) strVal : string;

                        constructor(val : string) {
                            this.strVal = val;
                        }

                    }

                    class TestTypeL1 {
                        @deserializeAsArray(TestTypeL0) l0List : Array<TestTypeL0>;

                        constructor(l0List : TestTypeL0[]) {
                            this.l0List = l0List;
                        }

                    }

                    class Test {
                        @deserializeAsArray(TestTypeL1) value : Array<TestTypeL1>;
                    }

                    const json = {
                        value: [
                            { l0List: [{ strVal: "00" }, { strVal: "01" }] },
                            { l0List: [{ strVal: "10" }, { strVal: "11" }] },
                            { l0List: [{ strVal: "20" }, { strVal: "21" }] }
                        ]
                    };

                    const array = [
                        new TestTypeL1([new TestTypeL0("00"), new TestTypeL0("01")]),
                        new TestTypeL1([new TestTypeL0("10"), new TestTypeL0("11")]),
                        new TestTypeL1([new TestTypeL0("20"), new TestTypeL0("21")])
                    ];

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({ value: array });
                    if (instantiationMethod) {
                        expect(instance.value[0] instanceof TestTypeL1).toBeTruthy();
                        expect(instance.value[1] instanceof TestTypeL1).toBeTruthy();
                        expect(instance.value[2] instanceof TestTypeL1).toBeTruthy();
                    }

                });

                it("deserializes an array with a different key", function () {

                    class Test {
                        @deserializeAsArray(Number, "different") value : Array<number>;
                    }

                    const json = { different: [1, 2, 3] };

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expectInstance(instance, Test, instantiationMethod);
                    expectTarget(target, instance, makeTarget);
                    expect(instance).toEqual({
                        value: [1, 2, 3]
                    });
                });

                it("throws an error if input type is not an array", function () {

                    class Test {
                        @deserializeAsArray(Number) values : Array<number>;
                    }

                    expect(function () {
                        const json = { values: 1 };
                        const target = createTarget(makeTarget, instantiationMethod, Test);
                        const instance = Deserialize(json, Test, target, instantiationMethod);
                    }).toThrow("Expected input to be an array but received: number");

                    expect(function () {
                        const json = { values: false };
                        const target = createTarget(makeTarget, instantiationMethod, Test);
                        const instance = Deserialize(json, Test, target, instantiationMethod);
                    }).toThrow("Expected input to be an array but received: boolean");

                    expect(function () {
                        const json = { values: "str" };
                        const target = createTarget(makeTarget, instantiationMethod, Test);
                        const instance = Deserialize(json, Test, target, instantiationMethod);
                    }).toThrow("Expected input to be an array but received: string");

                    expect(function () {
                        const json = { values: {} };
                        const target = createTarget(makeTarget, instantiationMethod, Test);
                        const instance = Deserialize(json, Test, target, instantiationMethod);
                    }).toThrow("Expected input to be an array but received: object");

                });

            });

        }

        runTests("Normal > Create Instances > With Target", InstantiationMethod.New, deserializeAs, deserializeAsArray, true);
        runTests("Normal > Create Instances > Without Target", InstantiationMethod.New, deserializeAs, deserializeAsArray, false);
        runTests("Normal > No Instances > With Target", InstantiationMethod.None, deserializeAs, deserializeAsArray, true);
        runTests("Normal > No Instances > Without Target", InstantiationMethod.None, deserializeAs, deserializeAsArray, false);
        runTests("Auto > Create Instances > With Target", InstantiationMethod.New, autoserializeAs, autoserializeAsArray, true);
        runTests("Auto > Create Instances > Without Target", InstantiationMethod.New, autoserializeAs, autoserializeAsArray, false);
        runTests("Auto > No Instances > With Target", InstantiationMethod.None, autoserializeAs, autoserializeAsArray, true);
        runTests("Auto > No Instances > Without Target", InstantiationMethod.None, autoserializeAs, autoserializeAsArray, false);

    });

    describe("DeserializeJSON", function () {

        function runTests(blockName : string, instantiationMethod : InstantiationMethod, deserializeAs : any, deserializeAsJson : any, makeTarget : boolean) {

            describe(blockName, function () {

                it("deserializes a primitive as json", function () {

                    class Test {
                        @deserializeAsJson() value0 : string;
                        @deserializeAsJson() value1 : boolean;
                        @deserializeAsJson() value2 : number;
                    }

                    const json = {
                        value0: "strval",
                        value1: true,
                        value2: 1
                    };

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        value0: "strval",
                        value1: true,
                        value2: 1
                    });

                });

                it("deserializes an array of primitives as json", function () {

                    class Test {
                        @deserializeAsJson() value0 : string[];
                        @deserializeAsJson() value1 : boolean[];
                        @deserializeAsJson() value2 : number;
                    }

                    const json = {
                        value0: ["strvalue", "00"],
                        value1: [false, true],
                        value2: 100
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        value0: ["strvalue", "00"],
                        value1: [false, true],
                        value2: 100
                    });

                });

                it("skips undefined keys", function () {
                    class Test {
                        @deserializeAsJson() value : Indexable<number>;
                    }

                    const json : any = {
                        value: {
                            v0: 1,
                            v1: void 0,
                            v2: 2
                        }
                    };

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        value: {
                            v0: 1,
                            v2: 2
                        }
                    });

                });

                it("deserializes an array of non primitives as json", function () {

                    class Test {
                        @deserializeAsJson() things : any[];

                    }

                    const json = {
                        things: [
                            { x: 1, y: 3 },
                            { x: 2, y: 2 },
                            { x: 3, y: 1 },
                        ]
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        things: [
                            { x: 1, y: 3 },
                            { x: 2, y: 2 },
                            { x: 3, y: 1 },
                        ]
                    });
                });

                it("deserializes a map of primitives as json", function () {
                    class Test {
                        @deserializeAsJson() things : any;

                    }

                    const json = {
                        things: {
                            x: 1, y: 2, z: 3
                        }
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        things: { x: 1, y: 2, z: 3 }
                    });
                    expect(instance.things).not.toBe(json);
                });

                it("deserializes a map of non primitives as json", function () {
                    class Test {
                        @deserializeAsJson() things : any;

                    }

                    const json = {
                        things: {
                            v0: { x: 1, y: 3 },
                            v1: { x: 2, y: 2 },
                            v2: { x: 3, y: 1 },
                        }
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        things: {
                            v0: { x: 1, y: 3 },
                            v1: { x: 2, y: 2 },
                            v2: { x: 3, y: 1 },
                        }
                    });
                    expect(instance.things).not.toBe(json);
                });

                it("deserializes nested arrays", function () {
                    class Test {
                        @deserializeAsJson() things : any;

                    }

                    const json = {
                        things: [
                            [1, 2, 3],
                            [4, 5, 6]
                        ]
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        things: [
                            [1, 2, 3],
                            [4, 5, 6]
                        ]
                    });
                    expect(instance.things).not.toBe(json);
                });

                it("does not deserialize functions", function () {
                    class Test {
                        @deserializeAsJson() things : any;

                    }

                    const json : any = {
                        things: [],
                        fn: function () {}
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        things: []
                    });
                    expect((instance as any).fn).toBeUndefined();
                    expect(instance.things).not.toBe(json);
                });

                it("deserializes json with a different key", function () {
                    class Test {
                        @deserializeAsJson("something") things : any;

                    }

                    const json = {
                        something: {
                            x: 1, y: 2, z: 3
                        }
                    };
                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    expect(instance).toEqual({
                        things: { x: 1, y: 2, z: 3 }
                    });
                });

                it("applies key transforms by default", function () {
                    SetDeserializeKeyTransform(function (value) {
                        return value.toUpperCase();
                    });

                    class Test {
                        @deserializeAsJson() value0 : string;
                        @deserializeAsJson() value1 : boolean;
                        @deserializeAsJson() value2 : number;
                    }

                    const json = {
                        VALUE0: "strvalue",
                        VALUE1: true,
                        VALUE2: 100
                    };

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    SetDeserializeKeyTransform(null);
                    expect(instance).toEqual({
                        value0: "strvalue",
                        value1: true,
                        value2: 100
                    });
                });

                it("applies key transforms when set to true", function () {
                    SetDeserializeKeyTransform(function (value) {
                        return value.toUpperCase();
                    });

                    class Test {
                        @deserializeAsJson(true) value0 : string;
                        @deserializeAsJson(true) value1 : boolean;
                        @deserializeAsJson(true) value2 : number;
                    }

                    const json = {
                        VALUE0: "strvalue",
                        VALUE1: true,
                        VALUE2: 100
                    };

                    const target = createTarget(makeTarget, instantiationMethod, Test);
                    const instance = Deserialize(json, Test, target, instantiationMethod);
                    SetDeserializeKeyTransform(null);
                    expect(instance).toEqual({
                        value0: "strvalue",
                        value1: true,
                        value2: 100
                    });
                });

                xit("does not apply key transforms when set to false", function () {

                });

            });
        }

        runTests("Normal > Create Instances > With Target", InstantiationMethod.New, deserializeAs, deserializeAsJson, true);
        runTests("Normal > Create Instances > Without Target", InstantiationMethod.New, deserializeAs, deserializeAsJson, false);
        runTests("Normal > No Instances > With Target", InstantiationMethod.None, deserializeAs, deserializeAsJson, true);
        runTests("Normal > No Instances > Without Target", InstantiationMethod.None, deserializeAs, deserializeAsJson, false);
        runTests("Auto > Create Instances > With Target", InstantiationMethod.New, autoserializeAs, autoserializeAsJson, true);
        runTests("Auto > Create Instances > Without Target", InstantiationMethod.New, autoserializeAs, autoserializeAsJson, false);
        runTests("Auto > No Instances > With Target", InstantiationMethod.None, autoserializeAs, autoserializeAsJson, true);
        runTests("Auto > No Instances > Without Target", InstantiationMethod.None, autoserializeAs, autoserializeAsJson, false);

    });

    describe("DeserializeUsing", function () {

        function runTests(blockName : string, instantiationMethod : InstantiationMethod, deserializeAs : any, deserializeUsing : any, makeTarget : boolean) {

            it("uses the provided function", function () {
                function x(value : any) { return 1; }

                class Test {
                    @deserializeUsing(x) value : number = 10;
                    @autoserializeUsing({ Serialize: x, Deserialize: x }) value1 : string;
                }

                const json = {
                    value: "yes",
                    value1: "hello"
                };

                const target = createTarget(makeTarget, instantiationMethod, Test);
                const instance = Deserialize(json, Test, target, instantiationMethod);
                expectTarget(target, instance, makeTarget);
                expectInstance(instance, Test, instantiationMethod);
                expect(instance).toEqual({ value: 1, value1: 1 });

            });

        }

        runTests("Normal > Create Instances > With Target", InstantiationMethod.New, deserializeAs, deserializeUsing, true);
        runTests("Normal > Create Instances > Without Target", InstantiationMethod.New, deserializeAs, deserializeUsing, false);
        runTests("Normal > No Instances > With Target", InstantiationMethod.None, deserializeAs, deserializeUsing, true);
        runTests("Normal > No Instances > Without Target", InstantiationMethod.None, deserializeAs, deserializeUsing, false);

    });

    describe("onDeserialized", function () {

        it("invokes the handler if provided", function () {

            class Test {

                @deserializeAs(Number) value : number = 1;
                something : string;

                static onDeserialized(json : JsonObject, instance : Test) {
                    instance.something = "here";
                }

            }

            const json = { value: 100 };
            const instance = Deserialize(json, Test, null, InstantiationMethod.New);
            expect(instance).toEqual({
                something: "here",
                value: 100
            });

        });

        it("accepts the return value of onDeserialized if provided", function () {

            class Test {

                @deserializeAs(Number) value : number = 1;
                something : string;

                static onDeserialized(json : JsonObject, instance : Test) {
                    const retn = new Test();
                    retn.value = 300;
                    retn.something = "here";
                    return retn;
                }

            }

            const json = { value: 100 };
            const instance = Deserialize(json, Test, null, InstantiationMethod.New);
            expect(instance).toEqual({
                something: "here",
                value: 300
            });
        });

    });

	describe("InstantiationMethod", function () {

		it("New", function () {

			class Test {

				constructed : boolean = false;

				constructor() {
					this.constructed = true;
				}

			}

			const json = {};
			const instance = Deserialize(json, Test, null, InstantiationMethod.New);
			expect(instance).toEqual({
				constructed: true
			});

		});

		it("ObjectCreate", function () {

			class Test {

				constructed : boolean;

				constructor() {
					this.constructed = true;
				}

			}

			const json = {};
			const instance = Deserialize(json, Test, null, InstantiationMethod.ObjectCreate);
			expect(instance.constructed).toBeUndefined();

		});

		it("None", function () {

			class Test {
			}

			const json = {};
			const instance = Deserialize(json, Test, null, InstantiationMethod.None);
			expect(typeof instance).toEqual('object');
			expect(instance instanceof Test).toEqual(false);
		});

		it("SetDefaultInstantiationMethod", function () {
			SetDefaultInstantiationMethod(InstantiationMethod.None);

			class Test {
			}

			const json = {};
			const instance = Deserialize(json, Test, null, InstantiationMethod.None);

			SetDefaultInstantiationMethod(null); // Reset.

			expect(typeof instance).toEqual('object');
			expect(instance instanceof Test).toEqual(false);
		});

	});

});
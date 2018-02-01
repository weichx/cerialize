///<reference path="./typings/jasmine.d.ts"/>
import {serialize, serializeAs, Serialize, serializeAsIndexable} from '../src/index';
import { serializeUsing } from "../src/annotations";

class Vector3 {
    @serialize x : number;
    @serialize y : number;
    z : number;

    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
        this.z = 100;
    }
}

class TArray {
    @serialize x : number;
    @serialize y : number;
    z : number;

    @serializeAs(Vector3) points : Array<Vector3>;

    constructor(x : number, y : number, points : Array<Vector3>) {
        this.x = x;
        this.y = y;
        this.z = 100;
        this.points = points;
    }
}

class TSubObject {
    @serializeAs(Vector3, 'specialKey') v1 : Vector3;
    @serializeAs(Vector3) v2 : Vector3;

    constructor() {
        this.v1 = new Vector3(1, 2);
        this.v2 = new Vector3(2, 1);
    }

    public static onSerialized(instance : TSubObject, json : any) : void {
        //do nothing
    }
}

var SerializeFn = function (src : string) : string {
    return 'custom!';
};

class CustomSerializedTest2 {
    @serializeUsing(SerializeFn) public x : string;
}

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
        var test = {x: 1, y: 2, z: 3};
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

    it('will call onSerialized if a type defines it', function () {
        var test = new TSubObject();
        spyOn(TSubObject, 'onSerialized').and.callThrough();
        var json = Serialize(test);
        expect(TSubObject.onSerialized).toHaveBeenCalledWith(test, json);
    });

    it('should use a custom serialize fn', function () {
        var test = new CustomSerializedTest2();
        test.x = 'not custom';
        var result = Serialize(test);
        expect(result.x).toBe('custom!');
    });

    it('should serialize isMap objects', function() {
        class Y {

            @serialize thing : string;

            constructor(str : string) {
                this.thing = str;
            }

        }
        class X {
            @serializeAsIndexable(Y) yMap : any;
        }

        var x = new X();

        x.yMap = {
            1: new Y('one'),
            2: new Y('two'),
            "hi": [new Y("three"), new Y("four")]
        };

        var json : any = Serialize(x);
        expect(json.yMap[1].thing).toBe('one');
        expect(json.yMap[2].thing).toBe('two');
        expect(json.yMap["hi"].length).toBe(2);
        expect(json.yMap["hi"][0].thing).toBe("three");
        expect(json.yMap["hi"][1].thing).toBe("four");
    });

});
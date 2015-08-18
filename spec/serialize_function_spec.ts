///<reference path="./typings/jasmine.d.ts"/>
import { __TypeMap, serialize, serializeAs, Serialize } from '../src/serialize';

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

    public static OnSerialized(instance : TSubObject, json : any) : void {
        //do nothing
    }
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
        expect(Serialize(d)).toBe(d.toString());
    });

    it('should stringify a regex', function () {
        var reg = /hi/;
        expect(Serialize(reg)).toBe(reg.toString());
    });

    it('should seralize an untyped object', function () {
        var obj = { one: 1, yep: true, now: new Date() };
        var serialized = Serialize(obj);
        expect(serialized).not.toBe(obj);
        expect(serialized.one).toBe(1);
        expect(serialized.yep).toBe(true);
        expect(serialized.now).toBe(obj.now.toString());
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
        var array = [{one: 1}, {two: 2}, {three: 3}];
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

    it('should serialize a typed object', function() {
        var test = new Vector3(1, 2);
        var serialized = Serialize(test, Vector3);
        expect((serialized instanceof Vector3)).toBe(false);
        expect(serialized.x).toBe(test.x);
        expect(serialized.y).toBe(test.y);
        expect(serialized.z).toBe(void 0);
    });

    it('should serialize a typed object with a typed array', function() {
        var test = new TArray(10, 11, [new Vector3(1,2), new Vector3(2, 1)]);
        var serialized = Serialize(test, TArray);
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

    it('should serialize a typed object with typed subobjects', function() {
        var test = new TSubObject();
        var serialized = Serialize(test, TSubObject);
        expect(serialized.specialKey).toBeDefined();
        expect(serialized.specialKey.x).toBe(1);
        expect(serialized.specialKey.y).toBe(2);
        expect(serialized.specialKey.z).toBe(void 0);
        expect(serialized.v2).toBeDefined();
        expect(serialized.v2.x).toBe(2);
        expect(serialized.v2.y).toBe(1);
        expect(serialized.v2.z).toBe(void 0);
    });

    it('will call OnSerialized if a type defines it', function() {
        var test = new TSubObject();
        spyOn(TSubObject, 'OnSerialized').and.callThrough();
        var json = Serialize(test);
        expect(TSubObject.OnSerialized).toHaveBeenCalledWith(test, json);
    });

});
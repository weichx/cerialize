///<reference path="./typings/jasmine.d.ts"/>
import { __TypeMap, inheritSerialization, deserialize, deserializeAs, Deserialize } from '../src/serialize';

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

class NestedArrayTest {
    @deserialize children : string[];
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
        var t4 = { dateList: [d1.toString(), d2.toString()] };
        var result = Deserialize(t4, T4);
        expect(result instanceof T4).toBeTruthy();
        expect(Array.isArray(result.dateList)).toBe(true);
        expect(result.dateList[0].toString()).toEqual(d1.toString());
        expect(result.dateList[1].toString()).toEqual(d2.toString());
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

    it('should deserialize nested js primitive array tagged with deserialize', function() {
        var json = { children:["1","2","3","4"] };
        var result = Deserialize(json, NestedArrayTest);
        expect(result.children).toEqual(["1","2","3","4"]);
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
});
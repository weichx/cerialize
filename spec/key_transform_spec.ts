///<reference path="./typings/jasmine.d.ts"/>
import {
    __TypeMap,
    serialize,
    serializeAs,
    deserialize,
    deserializeAs,
    autoserialize,
    autoserializeAs,
    DeserializeInto,
    DeserializeKeysFrom,
    SerializeKeysTo,
    Serialize,
    Deserialize,
    SnakeCase,
    CamelCase,
    UnderscoreCase,
    DashCase
} from '../src/serialize';

class T1 {
    @autoserialize myVar : number;
    @autoserializeAs('something-else') other : number;
}

describe('Key Transforms', function () {

    afterEach(function () {
        DeserializeKeysFrom(CamelCase);
        SerializeKeysTo(CamelCase);
    });
    
    it('should just clone key name if no transform functions are set', function() {
        SerializeKeysTo(null);
        DeserializeKeysFrom(null);
        var t1 = new T1();
        t1.myVar = 10;
        t1.other = 11;
        var result = Serialize(t1);
        expect(result['something-else']).toBe(11);
        expect(result.myVar).toBe(10);
        var result = Deserialize({
            myVar: 10,
            'something-else': 11
        }, T1);
        expect(result.myVar).toBe(10);
        expect(result.other).toBe(11);
    });

    it('should transform keys if serializedKeyTransform is set', function () {
        SerializeKeysTo(UnderscoreCase);
        var t1 = new T1();
        t1.myVar = 10;
        t1.other = 11;
        var result = Serialize(t1);
        expect(result['something-else']).toBe(11);
        expect(result.my_var).toBe(10);
    });

    it('should transform keys if deserializedKeyTransform is set', function () {
        DeserializeKeysFrom(UnderscoreCase);
        var result = Deserialize({
            my_var: 10,
            'something-else': 11
        }, T1);
        expect(result.myVar).toBe(10);
        expect(result.other).toBe(11);
        var t1 = new T1();
        result = DeserializeInto({
            my_var: 10,
            'something-else': 11
        }, T1, t1);
        expect(result).toBe(t1);
        expect(result.myVar).toBe(10);
        expect(result.other).toBe(11);
    });

});

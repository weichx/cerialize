///<reference path="./typings/jasmine.d.ts"/>
import {
    autoserialize,
    autoserializeAs,
    Serialize,
    Deserialize,
    DeserializeInto,
    SerializableEnumeration
} from '../src/serialize';

enum TestEnum {
    One = 1 << 0,
    Two = 1 << 1,
    Three = 1 << 2
}

SerializableEnumeration(TestEnum);

class T1 {
    @autoserializeAs(TestEnum) public e : TestEnum;
}

describe('Enums', function() {

    it('should serialize an enum', function () {
        var t1 = new T1();
        t1.e = TestEnum.One;
        var result = Serialize(t1);
        expect(result.e).toBe("One");
    });

    it('should deserialize an enum', function () {
        var json = {
            e : "One"
        };
        var result = Deserialize(json, T1);
        expect(result.e).toBe(TestEnum.One);
    });

    it('should deserializeInto an enum', function () {
        var json = {
            e : "One"
        };
        var t1 = new T1();
        var result = DeserializeInto(json, T1, t1);
        expect(result.e).toBe(TestEnum.One);
        expect(result).toBe(t1);
    });

});
///<reference path="./typings/jasmine.d.ts"/>
import {
    __TypeMap,
    Serialize,
    Deserialize,
    serialize,
    serializeAs,
    deserializeAs,
    deserialize,
    inheritSerialization
} from '../src/serialize';

class T {
    @serialize x : number;
    @serializeAs('Y') y : number;
    @deserialize dX : number;
    @deserializeAs('DY') dY : number;
}

@inheritSerialization(T)
class ExtendedT extends T {
    @serialize z : number;
    @deserialize dZ : number;
}

describe('Inherit Serialization', function () {

    it('should inherit serialized properties from a class', function () {
        var instance = new ExtendedT();
        instance.x = 1;
        instance.y = 2;
        instance.z = 3;
        var result = Serialize(instance);
        expect(result.x).toBe(1);
        expect(result.Y).toBe(2);
        expect(result.z).toBe(3);
    });

    it('should inherit deserialized properties from a class', function () {
        var json = { dX: 1, DY: 2, dZ: 3 };
        var instance = Deserialize(json, ExtendedT);
        expect(instance.dX).toBe(1);
        expect(instance.dY).toBe(2);
        expect(instance.dZ).toBe(3);
    });

});
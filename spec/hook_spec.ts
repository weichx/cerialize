import {
    Serialize,
    Deserialize,
    DeserializeInto,
    serialize,
    serializeAs,
    deserializeAs,
    deserialize,
    inheritSerialization
} from '../src/serialize';

class HookTest {
    public hello : string; //not serialized on purpose
    public static OnDeserialized(instance : HookTest, json : any) { }
}

describe("OnDeserialized hooks", function() {

    it("should always call OnDeserialized with Deserialize", function() {
        var x : any = {hello: 'Guten Tag'};
        spyOn(HookTest, 'OnDeserialized');
        var inst = Deserialize(x, HookTest);
        expect(HookTest.OnDeserialized).toHaveBeenCalledWith(inst, x);
    });

    it("should always call OnDeserialized with DeserializeInto", function() {
        var x : any = {hello: 'Guten Tag'};
        spyOn(HookTest, 'OnDeserialized');
        var inst = DeserializeInto(x, HookTest, new HookTest());
        expect(HookTest.OnDeserialized).toHaveBeenCalledWith(inst, x);
    });

});
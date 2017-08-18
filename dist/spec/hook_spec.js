import { Serialize, Deserialize, DeserializeInto } from '../src/serialize';
class HookTest {
    static OnDeserialized(instance, json) { }
    static OnSerialized(instance, json) { }
}
describe("OnDeserialized hooks", function () {
    it("should always call OnDeserialized with Deserialize", function () {
        var x = { hello: 'Guten Tag' };
        spyOn(HookTest, 'OnDeserialized');
        var inst = Deserialize(x, HookTest);
        expect(HookTest.OnDeserialized).toHaveBeenCalledWith(inst, x);
    });
    it("should always call OnDeserialized with DeserializeInto", function () {
        var x = { hello: 'Guten Tag' };
        spyOn(HookTest, 'OnDeserialized');
        var inst = DeserializeInto(x, HookTest, new HookTest());
        expect(HookTest.OnDeserialized).toHaveBeenCalledWith(inst, x);
    });
    it("should always call OnSerialized with Serialize", function () {
        var inst = new HookTest();
        spyOn(HookTest, 'OnSerialized');
        var json = Serialize(inst);
        expect(HookTest.OnSerialized).toHaveBeenCalledWith(inst, json);
    });
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { autoserializeAs, Serialize, Deserialize, DeserializeInto, SerializableEnumeration } from '../src/serialize';
var TestEnum;
(function (TestEnum) {
    TestEnum[TestEnum["One"] = 1] = "One";
    TestEnum[TestEnum["Two"] = 2] = "Two";
    TestEnum[TestEnum["Three"] = 4] = "Three";
})(TestEnum || (TestEnum = {}));
SerializableEnumeration(TestEnum);
class T1 {
}
__decorate([
    autoserializeAs(TestEnum)
], T1.prototype, "e", void 0);
describe('Enums', function () {
    it('should serialize an enum', function () {
        var t1 = new T1();
        t1.e = TestEnum.One;
        var result = Serialize(t1);
        expect(result.e).toBe("One");
    });
    it('should deserialize an enum', function () {
        var json = {
            e: "One"
        };
        var result = Deserialize(json, T1);
        expect(result.e).toBe(TestEnum.One);
    });
    it('should deserializeInto an enum', function () {
        var json = {
            e: "One"
        };
        var t1 = new T1();
        var result = DeserializeInto(json, T1, t1);
        expect(result.e).toBe(TestEnum.One);
        expect(result).toBe(t1);
    });
});

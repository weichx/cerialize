var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { autoserialize, autoserializeAs, DeserializeInto, DeserializeKeysFrom, SerializeKeysTo, Serialize, Deserialize, CamelCase, UnderscoreCase } from '../src/serialize';
class T1 {
}
__decorate([
    autoserialize
], T1.prototype, "myVar", void 0);
__decorate([
    autoserializeAs('something-else')
], T1.prototype, "other", void 0);
describe('Key Transforms', function () {
    afterEach(function () {
        DeserializeKeysFrom(CamelCase);
        SerializeKeysTo(CamelCase);
    });
    it('should just clone key name if no transform functions are set', function () {
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

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="./typings/jasmine.d.ts"/>
import { Serialize, Deserialize, serialize, serializeAs, deserializeAs, deserialize, inheritSerialization } from '../src/serialize';
class T {
}
__decorate([
    serialize
], T.prototype, "x", void 0);
__decorate([
    serializeAs('Y')
], T.prototype, "y", void 0);
__decorate([
    deserialize
], T.prototype, "dX", void 0);
__decorate([
    deserializeAs('DY')
], T.prototype, "dY", void 0);
let ExtendedT = class ExtendedT extends T {
};
__decorate([
    serialize
], ExtendedT.prototype, "z", void 0);
__decorate([
    deserialize
], ExtendedT.prototype, "dZ", void 0);
ExtendedT = __decorate([
    inheritSerialization(T)
], ExtendedT);
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

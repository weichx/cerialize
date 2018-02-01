//helper class to contain serialization meta data for a property, each property
//in a type tagged with a serialization annotation will contain an array of these
//objects each describing one property
import { NoOp } from "./string_transforms";
const TypeMap = new Map();
/** @internal */
export class MetaData {
    constructor(keyName) {
        this.keyName = keyName;
        this.serializedKey = "";
        this.deserializedKey = "";
        this.deserializedType = Function;
        this.serializedType = Function;
        this.flags = 0;
    }
    getSerializedKey() {
        if (this.serializedKey === this.keyName) {
            return MetaData.serializeKeyTransform(this.keyName);
        }
        return this.serializedKey ? this.serializedKey : this.keyName;
    }
    getDeserializedKey() {
        if (this.deserializedKey === this.keyName) {
            return MetaData.deserializeKeyTransform(this.keyName);
        }
        return this.deserializedKey ? this.deserializedKey : this.keyName;
    }
    //checks for a key name in a meta data array
    static hasKeyName(metadataArray, key) {
        for (var i = 0; i < metadataArray.length; i++) {
            if (metadataArray[i].keyName === key)
                return true;
        }
        return false;
    }
    //clone a meta data instance, used for inheriting serialization properties
    static clone(data) {
        const metadata = new MetaData(data.keyName);
        metadata.deserializedKey = data.deserializedKey;
        metadata.serializedKey = data.serializedKey;
        metadata.serializedType = data.serializedType;
        metadata.deserializedType = data.deserializedType;
        metadata.flags = data.flags;
        return metadata;
    }
    //gets meta data for a key name, creating a new meta data instance
    //if the input array doesn't already define one for the given keyName
    static getMetaData(target, keyName) {
        var metaDataList = TypeMap.get(target);
        if (metaDataList === void 0) {
            metaDataList = [];
            TypeMap.set(target, metaDataList);
        }
        for (var i = 0; i < metaDataList.length; i++) {
            if (metaDataList[i].keyName === keyName) {
                return metaDataList[i];
            }
        }
        metaDataList.push(new MetaData(keyName));
        return metaDataList[metaDataList.length - 1];
    }
    static inheritMetaData(parentType, childType) {
        var parentMetaData = TypeMap.get(parentType) || [];
        var childMetaData = TypeMap.get(childType) || [];
        for (var i = 0; i < parentMetaData.length; i++) {
            const keyName = parentMetaData[i].keyName;
            if (!MetaData.hasKeyName(childMetaData, keyName)) {
                childMetaData.push(MetaData.clone(parentMetaData[i]));
            }
        }
        TypeMap.set(childType, childMetaData);
    }
    static getMetaDataForType(type) {
        if (type !== null && type !== void 0) {
            return TypeMap.get(type) || null;
        }
        return null;
    }
}
MetaData.TypeMap = TypeMap;
MetaData.serializeKeyTransform = NoOp;
MetaData.deserializeKeyTransform = NoOp;
//# sourceMappingURL=meta_data.js.map
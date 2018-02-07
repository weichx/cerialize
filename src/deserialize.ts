import {
  getTarget, Indexable, isPrimitiveType, JsonArray, JsonObject, JsonType, SerializablePrimitiveType,
  SerializableType, InstantiationMethod
} from "./util";
import { MetaData, MetaDataFlag } from "./meta_data";

function _DeserializeMap<T>(data : JsonObject, type : SerializableType<T>, target? : Indexable<T>, instantiationMethod? : InstantiationMethod) : Indexable<T> {
  if (typeof data !== "object") {
    throw new Error("Expected input to be of type `object` but received: " + typeof data);
  }

  if (target === null || target === void  0) target = {};

  if (data === null || data === void 0) {
    return null;
  }

  const keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = data[key];
    if (value !== void 0) {
      target[MetaData.deserializeKeyTransform(key)] = _Deserialize(data[key] as any, type, target[key], instantiationMethod) as T;
    }
  }

  return target;
}

export function DeserializeMap<T>(data : JsonObject, type : SerializableType<T>, target? : Indexable<T>, instantiationMethod? : InstantiationMethod) : Indexable<T> {
  if (instantiationMethod === void 0) {
    instantiationMethod = MetaData.deserializeInstantationMethod;
  }

  return _DeserializeMap(data, type, target, instantiationMethod);
}

function _DeserializeArray<T>(data : JsonArray, type : SerializableType<T>, target? : Array<T>, instantiationMethod? : InstantiationMethod) {
  if (!Array.isArray(data)) {
    throw new Error("Expected input to be an array but received: " + typeof data);
  }

  if (!Array.isArray(target)) target = [] as Array<T>;

  target.length = data.length;
  for (let i = 0; i < data.length; i++) {
    target[i] = _Deserialize(data[i] as any, type, target[i], instantiationMethod) as T;
  }

  return target;
}

export function DeserializeArray<T>(data : JsonArray, type : SerializableType<T>, target? : Array<T>, instantiationMethod? : InstantiationMethod) {
	if (instantiationMethod === void 0) {
		instantiationMethod = MetaData.deserializeInstantationMethod;
	}

	return _DeserializeArray(data, type, target, instantiationMethod);
}

function DeserializePrimitive(data : any, type : SerializablePrimitiveType, target? : Date) {
  if (type === Date) {
    const deserializedDate = new Date(data as string);
    if (target instanceof Date) {
      target.setTime(deserializedDate.getTime());
    }
    else {
      return deserializedDate;
    }
  }
  else if (type === RegExp) {
    const fragments = data.match(/\/(.*?)\/([gimy])?$/);
    return new RegExp(fragments[1], fragments[2] || "");
  }
  else if (data === null) {
    return null;
  }
  else {
    return (type as any)(data);
  }
}

export function DeserializeJSON<T extends JsonType>(data : JsonType, transformKeys = true, target? : JsonType) : JsonType {
  // if (data === null || data === void 0) {}

  if (Array.isArray(data)) {

    if (!Array.isArray(target)) target = new Array<any>(data.length);

    (target as Array<JsonType>).length = data.length;

    for (let i = 0; i < data.length; i++) {
      (target as Array<JsonType>)[i] = DeserializeJSON(data[i], transformKeys, (target as Array<JsonType>)[i]);
    }

    return target;
  }

  const type = typeof data;

  if (type === "object") {

    const retn = (target && typeof target === "object" ? target : {}) as Indexable<JsonType>;
    const keys = Object.keys(data as object);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = (data as Indexable<JsonType>)[key];
      if(value !== void 0) {
        const retnKey = transformKeys ? MetaData.deserializeKeyTransform(key) : key;
        retn[retnKey] = DeserializeJSON((data as Indexable<JsonType>)[key], transformKeys);
      }
    }
    return retn;

  }
  else if (type === "function") {
    throw new Error("Cannot deserialize a function, input is not a valid json object");
  }
  //primitive case
  return data;
}

function _Deserialize<T extends Indexable>(data : JsonObject, type : SerializableType<T>, target? : T, instantiationMethod? : InstantiationMethod) : T | null {
  const metadataList = MetaData.getMetaDataForType(type);

  if (metadataList === null) {
    if (typeof type === "function") {
      if (isPrimitiveType(type)) {
        return DeserializePrimitive(data, type as any, target as any);
      }

      switch (instantiationMethod) {
        case InstantiationMethod.New:
          return new type();

        case InstantiationMethod.ObjectCreate:
          return Object.create(type.prototype);

        default:
          return {} as T;
      }
    }

    return null;
  }

  target = getTarget(type as any, target, instantiationMethod) as T;

  for (let i = 0; i < metadataList.length; i++) {
    const metadata = metadataList[i];

    if (metadata.deserializedKey === null) continue;

    const source : any = data[metadata.getDeserializedKey()];

    if (source === void 0) continue;

    const keyName = metadata.keyName;
    const flags = metadata.flags;

    if ((flags & MetaDataFlag.DeserializeMap) !== 0) {
      target[keyName] = _DeserializeMap(source, metadata.deserializedType, target[keyName], instantiationMethod);
    }
    else if ((flags & MetaDataFlag.DeserializeArray) !== 0) {
      target[keyName] = _DeserializeArray(source, metadata.deserializedType, target[keyName], instantiationMethod);
    }
    else if ((flags & MetaDataFlag.DeserializePrimitive) !== 0) {
      target[keyName] = DeserializePrimitive(source, metadata.deserializedType as SerializablePrimitiveType, target[keyName]);
    }
    else if ((flags & MetaDataFlag.DeserializeObject) !== 0) {
      target[keyName] = _Deserialize(source, metadata.deserializedType, target[keyName], instantiationMethod);
    }
    else if ((flags & MetaDataFlag.DeserializeJSON) !== 0) {
      target[keyName] = DeserializeJSON(source, (flags & MetaDataFlag.DeserializeJSONTransformKeys) !== 0, instantiationMethod);
    }
    else if ((flags & MetaDataFlag.DeserializeUsing) !== 0) {
      target[keyName] = (metadata.deserializedType as any)(source, target[keyName], instantiationMethod);
    }

  }

  if (typeof type.onDeserialized === "function") {
    const value = type.onDeserialized(data, target, instantiationMethod);
    if (value !== void 0) return value as any;
  }

  return target as T;
}

export function Deserialize<T extends Indexable>(data : JsonObject, type : SerializableType<T>, target? : T, instantiationMethod? : InstantiationMethod) : T | null {
  if (instantiationMethod === void 0) {
    instantiationMethod = MetaData.deserializeInstantationMethod;
  }

  return _Deserialize(data, type, target, instantiationMethod);
}

export function DeserializeRaw<T>(data : JsonObject, type : SerializableType<T>, target? : T) : T | null {
  return _Deserialize(data, type, target, InstantiationMethod.None);
}

export function DeserializeArrayRaw<T>(data : JsonArray, type : SerializableType<T>, target? : Array<T>) : Array<T> | null {
  return _DeserializeArray(data, type, target, InstantiationMethod.None);
}

export function DeserializeMapRaw<T>(data : Indexable<JsonType>, type : SerializableType<T>, target? : Indexable<T>) : Indexable<T> | null {
  return _DeserializeMap(data, type, target, InstantiationMethod.None);
}

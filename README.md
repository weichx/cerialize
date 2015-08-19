# Cerialize
Easy serialization through ES7/Typescript annotations

This is a library to make serializing and deserializing complex JS objects a breeze. It works by applying meta data annotations (as described in ES7 proposal and experimental Typescript feature) to fields in a user defined class. 

```typescript
import { serialize, serializeAs } from 'cerialize';
class Pet {
  @serializeAs('Name') public name : string;
  @serialize type : string;
  
  constructor(name : string, type : string) {
    this.name = name;
    this.type = type;
  }
  
  //this callback runs after the object is serialized. JSON can be altered here
  public static OnSerialized(instance : Pet, json : any) {
    json['addiction'] = 'laser pointers';
  }
}

class Person {
  //primitive properties marked with @serialize will be serialized as is 
  @serialize public name : string;
  
  //complex types like Date or a user defined type like `User` 
  @serializeAs(Date) 
  public birthdate : Date;
  
  @serializeAs('favorite_hobby') //serialize key name as `favorite_hobby` instead of `hobby`
  public hobby : string;
  
  @serializeAs('favorite_pet', Pet) //serialize the key name as `favorite_pet` and treat it like a `Pet`
  public pet : Pet;
  
  public firstName : string; //things not marked with an annotate are not serialized
  
  constructor(name : string, birthdate : Date, hobby : string, pet : Pet) {
    this.name = name;
    this.firstName = name.split(' ')[0];
    this.birthdate = birthdate;
    this.hobby = hobby;
    this.pet = pet;
  }
  
}
var pet = new Pet('Cracker', 'Cat');
var person = new Person(Matt', new Date(1989, 4, 3), 'coding', pet);
var json = Serialize(person);
/* json = {
    name: 'Matt', 
    birthdate: 'Wed May 03 1989 00:00:00 GMT-0400 (EDT)', 
    favorite_hobby: 'coding', 
    'favorite_pet': { 
      Name: 'Snuffles', 
      type: 'Cat',
      hobby: 'laser pointers'
    } 
  }
*/  
```

After defining which properties should be serialized, deserialized, or both, the actual marshalling is handled by a trio of simple functions.

* `Serialize(value)` takes in a value and spits out a serialized value using the algorithm described in [Serializing Objects](#serializing_objects)

* `Deserialize(rawObject, classType)` takes an untyped js object or array and a class type to deserialize it into and returns a new instance of `classType` with all the deserialized properties from `rawObject` using the algorithm described in [Deserializing Objects](#deserializing_new_instances)

* `DeserializeInto(rawObject, instance)` takes an untyped js object or array and an instance to populate with the new data, reusing any fields that are reference types and already exist on `instance` where possible and creating the fields where not. This is described in detail in [Deserializing Into Existing Objects](#deserializing_existing_instances)

## <a name="serializing_objects"></a>Serializing Objects

Calling `Serialize(value)` on something will serialize it into a pre-stringified json object. You must call `JSON.stringify` to make it a string. Serialization works through the following alorithm:

1. If `value` is an array, all items in the array will be have `Serialize` called on them. 

2. If `value` is an object that has any properties marked with a serializtion annotation, or inherits any properties marked for serialization, only those properties marked for serialization will be serialized. Anything without an annotation will not have `Serialize` called on them.

3. If `value` is an object that does not have any properties marked for serialization and does not inherit any properties marked for serialization, all keys in that object will be serialized, unless the value at a given key is an instance of a class with serialized properties, in which case it will be serialized as described above in 2.

4. If `value` is a primitive, it will be returned as is.

5. If `value` is `undefined`, `Serialize` will return `null`.

```typescript
  var serialized = Serialize(userInstance);
```

## <a name="deserializing_new_instances"></a> Deserializing Into New Instances

## <a name="deserializing_existing_instances"></a> Deserializing Into Existing Instances

## Callbacks

## Marking fields for serialization



## Marking fields for deserialization

```typescript
import { autoserialize, autoserializeAs } from 'cerialize';

```

## Marking fields for serialization and deserialization

```typescript
import { autoserialize, autoserializeAs } from 'cerialize';

```

## Mixing and matching
```typescript
import { serializeAs, deserializeAs } from 'cerialize';

```
## Inheriting Serialization
```typescript
import { autoserialize, inheritSerialization } from 'cerialize';

@inheritSerialization(User)
class Admin extends User {

}

```

## Requirements

Cerialize uses the ES6 Map implementation so you must be on a browser that supports it or include a shim.


# Cerialize
Easy serialization through ES7/Typescript annotations

This is a library to make serializing and deserializing complex JS objects a breeze. It works by applying meta data annotations (as described in ES7 proposal and experimental Typescript feature) to fields in a user defined class. 
## Example
```typescript
var pet = new Pet('Cracker', 'Cat');
var person = new Person('Matt', new Date(1989, 4, 3), 'coding', pet);
var json = Serialize(person);
/* json = {
    name: 'Matt', 
    birthdate: 'Wed May 03 1989 00:00:00 GMT-0400 (EDT)', 
    favorite_hobby: 'coding', 
    'favorite_pet': { 
      Name: 'Cracker', 
      animalType: 'Cat',
      hobby: 'laser pointers'
    } 
  }
*/  
```
## Details
```typescript
import { serialize, serializeAs } from 'cerialize';
class Pet {
  //keys can be customized using serializeAs(string)
  @serializeAs('Name') public name : string;
  @serialize animalType : string;
  
  constructor(name : string, animalType : string) {
    this.name = name;
    this.animalType = animalType;
  }
  
  //this callback runs after the object is serialized. JSON can be altered here
  public static OnSerialized(instance : Pet, json : any) : void {
    json['addiction'] = 'laser pointers';
  }
}

class Person {
  //primitive properties marked with @serialize will be serialized as is 
  @serialize public name : string;
  
  //complex types like Date or a user defined type like `User` use the serializeAs(keyNameOrType, keyName?) construct
  @serializeAs(Date) public birthdate : Date; 
  
  //serialize key name as `favorite_hobby` instead of `hobby`
  @serializeAs('favorite_hobby') public hobby : string; 
  
  //serialize the key name as `favorite_pet` and treat it like a `Pet`
  @serializeAs(Pet, 'favorite_pet') public pet : Pet;
  
  
  public firstName : string; //things not marked with an annotation are not serialized
  
  constructor(name : string, birthdate : Date, hobby : string, pet : Pet) {
    this.name = name;
    this.firstName = name.split(' ')[0];
    this.birthdate = birthdate;
    this.hobby = hobby;
    this.pet = pet;
  }
  
}

```

After defining which properties should be serialized, deserialized, or both, the actual marshalling is handled by a trio of simple functions.

* `Serialize(value, classType?)` takes in a value and spits out a serialized value using the algorithm described in [Serializing Objects](#serializing_objects)

* `Deserialize(rawObject, classType)` takes an untyped js object or array and a class type to deserialize it into and returns a new instance of `classType` with all the deserialized properties from `rawObject` using the algorithm described in [Deserializing Objects](#deserializing_new_instances)

* `DeserializeInto(rawObject, instance)` takes an untyped js object or array and an instance to populate with the new data, reusing any fields that are reference types and already exist on `instance` where possible and creating the fields where not. This is described in detail in [Deserializing Into Existing Objects](#deserializing_existing_instances)

## <a name="serializing_objects"></a>Serializing Objects

Calling `Serialize(value, classType?)` on something will serialize it into a pre-stringified json object. You must call `JSON.stringify` to make it a string. Serialization works through the following alorithm:

1. If `value` is an array, all items in the array will be have `Serialize` called on them (with `classType` argument if given). 

2. If `classType` is given, the `value` is considered like an instance of this object class (see `3` and `4`).

3. If `value` is an object that has any properties marked with a serializtion annotation, or inherits any properties marked for serialization, only those properties marked for serialization will be serialized. Anything without an annotation will not have `Serialize` called on them.

4. If `value` is an object that does not have any properties marked for serialization and does not inherit any properties marked for serialization, all keys in that object will be serialized as primtives, unless the value at a given key is an instance of a class with serialized properties, in which case it will be serialized as described above in 2.

5. If `value` is a primitive, it will be returned as is.

6. If `value` is `undefined`, `Serialize` will return `null`.

```typescript
import { serialize, Serialize } from 'cerialize';

class Product {

  // Will be serialized as is 
  @serialize public name : string;

  // Will not be serialized
  public sku : string;

  constructor(name : string, sku : string) {
    this.name = name;
    this.sku = sku;
  }
}

var product = new Product('47Z Phone', '47Z-S');
var serializedProduct = Serialize(product);
console.log(JSON.stringify(serializedProduct)); // Will display : {name: '47Z Phone'}

var productJson = {name: '47Z Phone', sku: '47Z-S'};
var serializedProductJson = Serialize(productJson);
console.log(JSON.stringify(serializedProductJson)); // Will display : {name: '47Z Phone', sku: '47Z-S'}

var serializedProductJsonToObject = Serialize(productJson, Product);
console.log(JSON.stringify(serializedProductJsonToObject)); // Will display : {name: '47Z Phone'}
```

## <a name="deserializing_new_instances"></a> Deserializing Into New Instances
The simplest way to deserialize a piece of JSON is to call `Deserialize(json, type)` on it. This function takes the provided type and pulls out all the properties you tagged with `@deserialize`, `@deserializeAs(keyNameOrType, keyName?)`, `@autoserialize` or `@autoserializeAs(keyNameOrType, keyName?)` and will pump them (recursively) into a new instance of `type` which is returned. If your type marks a property for deserialization that is itself tagged with deserialization annotations, that property will be hydrated into it's type following the same deserialization algorithm.

```typescript
class Tree {
  @deserialize public species : string; 
  @deserializeAs(Leaf) public leafs : Array<Leaf>;  //arrays do not need extra specifications, just a type.
  @deserializeAs(Bark, 'barkType') public bark : Bark;  //using custom type and custom key name
  @deserializeIndexable(Leaf) public leafMap : {[idx : string] : Leaf}; //use an object as a map
}

class Leaf {
  @deserialize public color : string;
  @deserialize public blooming : boolean;
  @deserializeAs(Date) public bloomedAt : Date;
}

class Bark {
  @deserialize roughness : number;
}
var json = {
  species: 'Oak',
  barkType: { roughness: 1 },
  leafs: [ {color: 'red', blooming: false, bloomedAt: 'Mon Dec 07 2015 11:48:20 GMT-0500 (EST)' } ],
  leafMap: { type1: { some leaf data }, type2: { some leaf data } }
}
var tree = Deserialize(json, Tree);
```
## <a name="deserializing_existing_instances"></a> Deserializing Into Existing Instances

It is also possible to re-use existing objects when deserializing with `DeserializeInto(json, Type, target)`. You might want to do this so that you can maintain references to things even after updating their properties. This is handled exactly the same way as `Deserialize(json, Type)` except that it takes one additional argument, the object you want to deserialize properties into. If the target instance you provide is null or undefined, this behaves identically to `Deserialize`. 

```typescript
  //reusing the above class and json structures
  var localTree = new Tree();
  var leaf = new Leaf();
  leaf.color = 'blue';
  localTree.leafMap = { type1: new Leaf(), type2: new Leaf() }
  localTree.leafs[0] = leaf;
  DeserializeInto(json, Tree, localTree)
  expect(localTree.leafs[0]).toEqual(leaf) //true, the leaf instance was reused but has a differnt color
  expect(localTree.leafs[0].color).toEqual('red'); //red comes from the json defined earlier
  expect(localTree.leafMap['type1']).color).toEqual('red') //this is how `@xxxIndexable` works
```

## <a name="autoserialize"></a> Serializing and Deserializing
If you want the same behavior for a property when serializing and deserializing, you can either tag that property with a `@serialize` and `@deserialize` (or their `As` variants) or you can use `@autoserialize` and `@autoserializeAs(keyNameOrType, keyName?)` which will do this in a single annotation and behave exactly the same as `@serialize` and `@deserialize`. `@autoserializeIndexable`(and friends) will retain type information while allowing an object to be used as a dictionary, without this the system would treat your input object as whatever type you provide instead of a map of objects of that type.

## Callbacks

A callback can be provided for when a class is serialized and / or deserialized. To define the callback, add a static method `OnSerialized(instance : any, json : any)` to the class that needs custom post processing. Continuing with the Tree example from before, lets say your server expects a zero indexed roughness value but your front end needs to use a 1 based roughness. This can be handled with `OnSerialized` and `OnDeserialized` trivially.

```typescript
class Bark {
  public static OnSerialized(instance : Bark, json : any) : void {
    json.roughness--;
  }
  
  public static OnDeserialized(instance : Bark, json : any) : void {
    instance.roughness++;
  }
}
```
## Inheriting Serialization

Serialization behavior is not inherited by subclasses automatically. To inherit a base class's serialization / deserialization behavior, tag the subclass with @inheritSerialization(ParentClass).
```typescript
import { inheritSerialization } from 'cerialize';

@inheritSerialization(User)
class Admin extends User {

}
```
##Generics
Typescript generics unfortunately do not give any runtime type information, but they are still helpful in that you don not need to cast the output of a `Deserialize` function to a given type when the type can be inferred by the compiler. Cerialize supports generics through `GenericDeserialize` and `GenericDeserializeInto`. These two functions work exactly the same as their non generic counterparts but have a typed signature. 
```typescript
import { GenericDeserialize, GenericDeserializeInto } from 'cerialize';

var tree = GenericDeserialize({value: "someValue"}, Tree);
expect((tree instanceof Tree)).toBe(true);
expect(tree.value).toBe("someValue");

var tree = new Tree();
tree.value = 'hello';
var tree2 = GenericDeserializeInto({value: "someValue"}, Tree, tree);
expect((tree2 instanceof Tree)).toBe(true);
expect(tree2).toBe(tree);
expect(tree.value).toBe("someValue");
```

## Customizing key transforms
Often your server and your client will have different property naming conventions. For instance, Rails / Ruby generally expects objects to have properties that are under_score_cased while most JS authors prefer camelCase. You can tell Cerialize to use a certain key transform automatically when serializing and deserializing by calling `DeserializeKeysFrom(transform : (key : string) => string)` and `SerializeKeysTo(transform : (key : string) => string)`. A handful of transform functions are provided in this package or you can define your own function conforming to `(key : string) => string`.

```typescript
import {SerializeKeysTo, DeserializeKeysFrom, UnderscoreCase} from 'cerialize';
//CamelCase, UnderscoreCase, SnakeCase, and DashCase are provided
SerializeKeysTo(UnderscoreCase);
DeserializeKeysFrom(UnderscoreCase);
```

## Requirements

Cerialize uses the ES6 Map implementation so you must be on a browser that supports it or include a shim.


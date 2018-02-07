# Cerialize

Easy serialization through ES7/Typescript annotations

This is a library to make serializing and deserializing complex JS objects a breeze. It works by applying meta data annotations (as described in ES7 proposal and experimental Typescript feature) to fields in a user defined class. 

## Concepts
This library works by processing annotations on class types. Annotations are provided for reading (deserializing) and writing (serializing) values to and from json.

Once you have annotated your class types, you can use the `Serialize*` and `Deserialize*`functions to serialize and deserialize your data. 

## Example

```typescript
    
    const ship = new Starship();
    /* assume values assigned */
    const json = Serialize(ship, Starship);
    /*
     json = {
        remainingFuel: 500.5,
        capt: {
            name: "Sparrow",
            onDuty: true,
            credits: { amount: 500, currency: "galactic" }
        },
        crew: [
            {
                name: "Bill",
                onDuty: true,
                credits: { amount: 0, currency: "galactic" }
            },
            {
                name: "Ben",
                onDuty: false,
                credits: { amount: 1500, currency: "galactic" }
            },
            {
                name: "Bob",
                onDuty: true,
                credits: { amount: 50, currency: "galactic" }
            }
        ],
        planetsVisited: {
            Tatooine: {
                timeVisited: "Mon Feb 05 2018 11:35:42 GMT+0100 (CET)",
                description: "desert"
            },
            Yavin4: {
                timeVisited: "Tue Feb 06 2018 11:35:42 GMT+0100 (CET)",
                description: "jungle"
            },
            Endor: {
                timeVisited: "Wed Feb 07 2018 11:35:42 GMT+0100 (CET)",
                description: "forest"
            }
        },
        cargo: {
            containers: 4,
            contents: ["lots", "of", "stuff"]
        }
     }    
    */
    const instance = Deserialize(json, Starship);
```

## Details
```typescript
    class CrewMemeber {

        //unannotated properties are not serialized or deserialized, they are totally ignored
        localId :number;

        //serialize and deserialize the crew name as a string
        @autoserializeAs(String) name : string;

        //serialize the onDuty property as a boolean, don't deserialize it
        @serializeAs(Boolean) onDuty : boolean;

        //deserialize the happiness rating as a number, don't serialize it
        @deserializeAs(Number) happinessRating : number;

        //we only want to write our credit value, never deserialize it
        //we want to transform the value into a representation our server
        //understands which is not a direct mapping of number values. 
        //use a custom serialization function instead of a type.
        @serializeUsing(CreditSerializer) credits : number;
    }

    class PlanetLog {
        
        // we handle the timeVisited field specially in our callbacks
        // we do not annotate it so that we can customize it outselves
        timeVisited : Date;

        // serialize and deserialize description as a string
        @autoserializeAs(String) description : string;

        // when serializing our planet log we need to convert the timezone 
        // of the timeVisited value from local time to galactic time
        // (This could also be done via @serializeUsing(Time.toGalacticTime))
        static onSerialized(instance : PlanetLog, json : JsonObject) {
            json["timeVisited"] = Time.toGalacticTime(instance.timeVisited);
        }

        // when deserializing our planet log we need to convert the timezone 
        // of the timeVisited value from galactic to local time  
        // (This could also be done via @deserializeUsing(Time.toLocalTime))
        static onDeserialized(instance : PlanetLog, json : JsonObject, instantiationMethod : boolean) {
            instance.timeVisited = Time.toLocalTime(instance.timeVisited);
        }

    }

    class Starship {

        // when writing our fuel value to the server, we have a number but the server expects a string
        // when reading our fuel value from the server, we receive a string but we want a number
        @serializeAs(String) 
        @deserializeAs(Number) 
        remainingFuel : number;
        
        // keys can be customized by providing a second argument to any of the annotations
        @autoserializeAs(CrewMember, "capt") captain : CrewMember;

        // serialize and deserialize the crew members as an array
        @autoserializeAsArray(CrewMember) : crew : Array<CrewMember>;

        // serialize and deserialize our planet log as an indexable map by planet name
        @autoserializeAsMap(Planet) : planetsVisited : Indexable<PlanetLog>;

        // we don't have a specific format for cargo, so just serialize and deserialize it as normal json
        @autoserializeAsJSON() cargo : any; 

    }

    // a function to transform our credit amount into a format our server understands
    function CreditSerializer(instance : { credits : number }) : JsonType {
        return { amount: instance.credits, currency: "galactic" };
    }
```
## Annotations

When annotating your classes you can declare which fields get treated as which kinds of values and how they are read and written to and from json format. To specify how fields are written to json, use `@serialize*` annotations. For writing, use `@deserialize*`.

Most annotations take a class constructor. For primitives, use `String`, `Number`, `Boolean`, `Date`, or `RegExp`. For other types, provide the corresponding type constructor. All annotations take an optional argument `customKey` which will overwrite the corresponding key in the output. If no `customKey` is provided, the property key will be the same as defined in the class. For example, if our class has a field called `protons` but our server sends json with `particles` instead, we would use "particles" as the `customKey` value. If no `customKey` is provided, the property key will be the same as defined in the class. 

If you want the same behavior for a property when serializing and deserializing, you can either tag that property with a `@serialize*` and `@deserialize*` or you can use `@autoserializeXXX` which will do this in a single annotation and behave exactly the same as `@serialize*` and `@deserialize*`. The only difference in behavior is that `@autoserializingUsing()` takes an argument of type `SerializeAndDeserializeFns` instead of a single function argument like it's siblings do.

##### Serialization
- `@serializeAs(type : ClassConstructor, customKey? : string)`
- `@serializeAsMap(type : ClassConstructor, customKey? : string)`
- `@serializeAsArray(type : ClassConstructor, customKey? : string)`
- `@serializeUsing(transform : SerializerFn, customKey? : string)`
- `@serializeAsJson(customKey? : string)`
##### Deserialization
- `@deserializeAs(type : ClassConstructor, customKey? : string)`
- `@deserializeAsArray(type : ClassConstructor, customKey? : string)`
- `@deserializeAsMap(type : ClassConstructor, customKey? : string)`
- `@deserializeUsing(transform : DeserializerFn, customKey? : string)`
- `@deserializeAsJson(customKey? : string)`
##### Serialization and Deserialization
- `@autoserializeAs(type : ClassConstructor, customKey? : string)`
- `@autoserializeAsMap(type : ClassConstructor, customKey? : string)`
- `@autoserializeAsArray(type : ClassConstructor, customKey? : string)`
- `@autoserializeUsing(transforms : SerializeAndDeserializeFns, customKey? : string)`
- `@autoserializeAsJson(customKey? : string)`
##### Types
```typescript
 type SerializationFn = <T>(target : T) => JsonType;
 type DeserializationFn = <T>(data : JsonType, target? : T, instantiationMethod? : InstantiationMethod) => T
 type SerializeAndDeserializeFns = { 
     Serialize: SerializationFn,
     Deserialize: DeserializationFn
 }
```

## Serializing Data to JSON
Calling any of the `Serialize*` family of methods will convert the input object into json. The output is a plain javascript object that has not had `JSON.stringify` called on it.

#### Functions for Serializing
Depending on how your data is structured there are a few options for serialization. You can work with single objects, maps of objects, or arrays of objects. 

- `Serialize<T>(target : T, ClassConstructor<T>) => JsonObject` 
    ```typescript
        /* takes a single object and serializes it using the provided class type. */
        const ship = new Starship();
        const json = Serialize(ship, Starship);
    ```
- `SerializeArray<T>(target : Array<T>, ClassConstructor<T>) => JsonArray`
    ```typescript
        /* takes an array of objects and serializes each entry using the provided class type */
        const ships : Array<Starship>;
        const json = SerializeArray(ships, Starship);
    ```
- `SerializeMap<T>(target: Indexable<T>, ClassConstructor<T>) => JsonObject` 
    ```typescript
        /* takes an indexable object ie `<T>{ [idx: string] : T }` and for each key serializes
         the object using the provided class type. */
        const ships : Indexable<Starship> = { 
            ship1: new Starship(),
            ship2: new Starship() 
        };
        const json = SerializeMap(ships, Starship);
    ```
- `SerializeJson(target : any) => JsonType` 
    ```typescript
     /* takes any value and serializes it as json, no structure is assumed 
        and any serialization annotations on any processed objects are totally ignored. */

        const value = {}; /* anything that isn't a function */
        const json = SerializeJson(value);
    ```

## Deserializing From JSON

Calling any of the `Deserialize*` family of methods will convert the input json into an instance of the provided ClassConstructor or a plain JS object if that is preferred (Redux for example, expects plain objects and not instances)

The simplest way to deserialize a piece of JSON is to call `Deserialize(json, type)` on it. This function takes the provided type and pulls out all the properties you've tagged with `@deserializeXXX` or `@autoserializeXXX`. It will pump them (recursively) into a new instance of type which is returned. If your type marks a property for deserialization that is itself tagged with deserialization annotations, that property will be hydrated into it's type following the same deserialization algorithm.

#### Deserializing Into Existing Instances

It is also possible to re-use existing objects when deserializing with `Deserialize(json, Type, target)`. You might want to do this so that you can maintain references to things even after updating their properties. This is handled exactly the same way as `Deserialize(json, Type)` except that it takes one additional argument, the object you want to deserialize properties into. If the target instance you provide is null or undefined, this behaves identically to `Deserialize(json, Type)`, otherwise the deserialization will always use existing objects as write targets (if they are defined and of the expected type) instead of creating new ones.

```typescript
    const existingInstance = new Type();
    const instance = Deserialize(json, Type, existingInstance);
    expect(existingInstance === instance).toBe(true);
```

#### Deserializing Into Plain Objects

The `instantiationMethod` parameter can be used to change the way in which instances of the input type are created. With `InstantiationMethod.New`, the constructor will be invoked when a new instance needs to be created. With `InstantiationMethod.ObjectCreate`, the object will be created without invoking its constructor, which is useful for systems where constructed objects immediately freeze themselves. With `InstantiationMethod.None`, the `deserializeXXX` functions will return a plain object instead, which can be useful for systems like Redux that expect / require plain objects and not class instances.

```typescript
	import {Deserialize, Instances} from 'cerialize';
	
	class Immutable {
	
		public value : string;
		
		constructor(value : string) {
			this.value = value;
			Object.freeze(this);
		}
		
		public getValue() : string {
			return value;
		}
		
	}
	
	Deserialize({value: 'example'}, Immutable, InstantiationMethod.New);          // Error because of Object.freeze
	Deserialize({value: 'example'}, Immutable, InstantiationMethod.ObjectCreate); // Immutable {value 'example'}
	Deserialize({value: 'example'}, Immutable, InstantiationMethod.None);         // Object {value: 'example'}
```

##### Functions
- `Deserialize<T>(json : JsonObject, ClassConstructor<T>, target? : T) : T`
    ```typescript
        /* takes a single object and serializes it using the provided class type. */

        const json = {/* some values from server */};
        const existingInstance = new Starship();        
        const instance = Deserialize(json, Starship); // make a new instance
        
        Deserialize(json, Starship, existing); // re-use our existing instance
    ```
- `DeserializeArray<T>(json : JsonArray, ClassConstructor<T>, target? : Array<T>) : Array<T>`
    ```typescript
        const json = [
            {/* some values from server */},
            {/* some values from server */},
            {/* some values from server */}
        ];
        const existingInstances = [ new Starship(), new Starship() ];
        const existingArray = [ new Starship() ];
        
        const array = DeserializeArray(json, Starship); // make a new array of instances
        
        /* re-use our existing array, if possible use existing instances in array, otherwise create new ones */
        DeserializeArray(json, Starship, existingArray); 
    ```
- `DeserializeMap<T>(json : JsonObject, ClassConstructor<T>, target? : Indexable<T>) : Indexable<T>`
    ```typescript
        const json = {
            ship0: {/* some values from server */},
            ship1: {/* some values from server */},
            ship2: {/* some values from server */}
        };
        const existingMap = {
            ship0: new Starship(), 
            ship3: new Starship()
        ];
        
        const map = DeserializeMap(json, Starship); // make a new map of instances
        
        /* re-use our existing map, in the case of key collision, 
           write new property values into existing instance
           otherwise create new ones */
        DeserializeMap(json, Starship, existingMap); 
    ```
- `DeserializeJson(json : JsonType, target? : any) : any`
    ```typescript
     /* takes any value and deserializes it from json, no structure is assumed 
        and any deserialization annotations on any processed objects are totally ignored. */

        const value = { /* anything that isn't a function */ };
        const json = DeserializeJson(value);
    ```

- `DeserializeRaw<T>(data : JsonObject, type : SerializableType<T>, target? : T) : T`
    ```typescript
        const json = {/* some values from server */};

        //deserialize into a new object
        const newObject = DeserializeRaw(json, Starship);

        //deserialize into an existing object
        const existingObject = {};
        DeserializeRaw(json, Starship, existingObject);
    ```
- `DeserializeArrayRaw<T>(data : JsonArray, type : SerializableType<T>, target? : Array<T>) : Array<T>`
    ```typescript
        const json = [
            {/* some values from server */},
            {/* some values from server */},
            {/* some values from server */}
        ];

        // make a new array of plain objects
        const plainObjectArray = DeserializeArrayRaw(json, Starship); 
        const existingArray = [{}, {}];
        
        const value0 = existingArray[0];
        const value1 = existingArray[1];

        /* re-use our existing array, if possible use existing plain objects in array, otherwise create new ones */
        DeserializeArrayRaw(json, Starship, existingArray); 
        expect(existingArray[0]).toBe(value0);
        expect(existingArray[1]).toBe(value1);
        expect(existingArray.length).toBe(3);

    ```
- `DeserializeMapRaw<T>(data : Indexable<JsonType>, type : SerializableType<T>, target? : Indexable<T>) : Indexable<T>`
    ```typescript
        const json = {
            ship0: {/* some values from server */},
            ship1: {/* some values from server */},
            ship2: {/* some values from server */}
        };
        const plainObjectMap = DeserializeMapRaw(json, Starship); // make a new map of plain objects
        const existingMap = {
            ship0: {},
            ship3: {}
        }
        /* re-use our existing map, if possible use existing plain objects in map, otherwise create new ones */
        DeserializeMapRaw(json, Starship, existingMap); 
    ```
    

## onSerialized Callback 
A callback can be provided for when a class is serialized. To define the callback, add a static method `onSerialized<T>(instance : T, json : JsonObject)` to the class that needs custom post processing. You can either return a new value from this function, or modify the `json` parameter.

```typescript 
    class CrewMember {

        @autoserializeAs(String) firstName;
        @autoserializeAs(String) lastName;

        static onSerialized(instance : CrewMember, json : JsonObject) {
            json["employeeId"] = instance.lastName.toUpperCase() + ", " + instance.firstName.toUpperCase();
        }

    }
```

## onDeserialized Callback
A callback can be provided for when a class is deserialized. To define the callback, add a static method `onDeserialized<T>(instance : T, json : JsonObject, instantiationMethod = InstantationMethod.New)` to the class that needs custom post processing. You can either return a new value from this function, or modify the `json` parameter. The `instantiationMethod` parameter signifies whether the initial call to deserialize this object should create instances of the types (when true) or just plain objects (when false)

```typescript 
    class CrewMember {

        @autoserializeAs(String) firstName;
        @autoserializeAs(String) lastName;

        static onDeserialized(instance : CrewMember, json : JsonObject, instantiationMethod : InstantiationMethod) {
            instance.firstName = json.firstName.toLowerCase();
            instance.lastName = json.lastName.toLowerCase();
        }

    }
```

## Inheriting Serialization
Serialization behavior is not inherited by subclasses automatically. To inherit a base class's serialization / deserialization behavior, tag the subclass with `@inheritSerialization(ParentClass)`.

```typescript
    import { inheritSerialization } from 'cerialize';

    @inheritSerialization(User)
    class Admin extends User {

    }
```

## Customizing key transforms

Often your server and your client will have different property naming conventions. For instance, Rails / Ruby generally expects objects to have properties that are under_score_cased while most JS authors prefer camelCase. You can tell Cerialize to use a certain key transform automatically when serializing and deserializing by calling `SetSerializeKeyTransform(fn : (str : string) => string)` and `SetDeserializeKeyTransform(fn : (str : string) => string)`. A handful of transform functions are provided in this package or you can define your own function conforming to `(key : string) => string`.  
- The provided functions are:
    - `CamelCase`
    - `UnderscoreCase`
    - `SnakeCase`
    - `DashCase`


##### Note
When using `SetDeserializeKeyTransform(fn : (str : string) => string)` you need to provide a function that transforms the EXISTING keys to a format that allows indexing of the input object.
```typescript
    //in this example we expect the server to give us upper cased key names
    //we need to map our local camel cased key to match the server provided key
    //NOT the other way around.
    SetDeserializeKeyTransform(function (value : string) : string {
        return value.toUpperCase();
    });

    class Test {
        @deserializeAs(String) value : string;
    }

    const json = {
        VALUE: "strvalue",
    };

    const instance = Deserialize(json, Test);
    expect(instance).toEqual({
        value: "strvalue"
    });
```

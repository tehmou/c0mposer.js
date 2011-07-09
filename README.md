c0mposer.js
===========

Combine JS objects in a manner that prevents them from conflicting with each other.

Usage
-----

    var obj1 = {
    	text: "hello",
	    sayNumber: function () { alert("one"); },
	    names: ["Peter", "Helen"]
    };

    var obj2 = {
    	text: "another text",
	    sayNumber: function () { alert("two"); },
	    names: ["Jennifer"]
    };

    var newObj = c0mposer.create(obj1, obj2, { names: ["Jack"] });

    console.log(newObj.text); // "another text"
    console.log(newObj.names); // ["Peter", "Helen", "Jennifer", "Jack"]
    newObj.sayNumber(); // Alerts first "one" and then "two"


Rules for Combining of Properties
-------------------------------------

Everything is easy until both the old object and the new object have a property of the same name. This case is actually the whole purpose of c0mposer.

An error is thrown if the new property value is not compatible with the old value. Old one stays untouched in this case.

Below is a list of all possibilities, grouped by the kind of the old property.

### null, undefined, NaN
Always replaced by the new value.

    null, {} => {}
    undefined, 3525 => 3525
    NaN, null => null

### Number, Boolean, String
Replaced with the new value, if it is of one of these as well.

    true, false => false
    4523, "foo" => "foo"
    "bar", [] => "bar" // Throws error

### Array
The arrays are concatenated with the old one first.

    ["A"], ["B", 2] => ["A", "B", 2]
    [1, 2], {} => [1, 2] // Throws error

### Function
The created function calls first the old function and then the new one.

    f1, f2 => f3 // Calls f1 first, then f2
    f1, "string" => f1 // Throws error

### Object
Properties of the new object override those of the old. This is equivalent to _.extend

    { type: "fruit", name: "orange" }, { name: "apple" } => { type: "fruit, name: "apple }
    { a: 1, b: 2 }, { b: 3, c: 4 } => { a: 1, b: 3, c: 4 }
    {}, 4 => {} // Throws error
    {}, [] => {} // Throw error

Using a Library of Objects
--------------------------

You can also defined a library hash to be used to resolve strings into objects.

    c0mposer.library = {
        myObject: { name: "obie" },
        object2: { age: 20 }
        group: {
            germanese: { country: "Germany" }
        }
    };

Then use corresponding strings.

    var guy = c0mposer.create("myObject", "object2", "group.germanese");


Debugging Objects Created from a Library
---------

Turn debugging on before composing anything.

    c0mposer.debug = true;

Now you can see what the object is composed of by seeing _lineage. (Continued from the first sample.)

    console.log(newObj._lineage); // ["obj1", "obj2", undefined]
    console.log(newObj.sayNumber._lineage); // ["obj1", "obj2"]


License
-------

(c) 2011 Timo Tuominen

c0mposer.js may be freely distributed under the MIT license.
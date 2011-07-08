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


Rules for Combining Single Properties
-------------------------------------

### null, NaN, undefined
Always replaced by new value.


### Array
Concatenated with the old one first.


### Function
Called in order from old to new.


### Number, Boolean, String
Replaced with the new one, if it is of one of these as well.


### Object
Properties of the new object override those of the old.



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

Turn debugging on.

    c0mposer.debug = true;

Now you can see what the object is composed of by seeing _lineage. (Continued from the first sample.)

    console.log(newObj._lineage); // ["obj1", "obj2", undefined]
    console.log(newObj.sayNumber._lineage); // ["obj1", "obj2"]


License
-------

(c) 2011 Timo Tuominen
c0mposer.js may be freely distributed under the MIT license.
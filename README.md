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


Rules
-----

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


License
-------

(c) 2011 Timo Tuominen
c0mposer.js may be freely distributed under the MIT license.
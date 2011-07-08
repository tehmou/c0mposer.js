/**
 * c0mposer.js
 *
 * (c) 2011 Timo Tuominen
 * May be freely distributed under the MIT license.
 * For all details and documentation:
 * http://tehmou.github.com/c0mposer.js
 *
 */

var c0mposer;

(function () {
    c0mposer = {

        debug: true,
        library: {},

        instance: function (options) {
            return _.extend({}, c0mposer, options || {});
        },
        create: function () {
            Array.prototype.splice.apply(arguments, [0, 0, {}]);
            return this.compose.apply(this, arguments);
        },
        compose: function () {
            var composer = this;
            var obj = arguments[0];
            Array.prototype.splice.apply(arguments, [0, 1]);
            _.each(arguments, function (argument) {
                composer.composeOne(obj, argument);
            });
            return obj;
        },
        composeOne: function (obj, srcDef) {
            var composer = this;
            var src = srcDef;
            if (_.isFunction(this.parseString) && _.isString(src)) {
                src = this.parseString(src);
            }
            _.each(src, function (value, key) {
                composer.composeProperty(obj, src, key, srcDef);
            });
        },
        parseString: function (string) {
            if (!this.library.hasOwnProperty(string)) {
                this.throwError("couldNotParseString", string);
            }
            return this.library[string];
        },
        resolveKind: function (obj) {
            if (_.isArray(obj)) {
                return "array";
            } else if (_.isFunction(obj)) {
                return "function";
            } else if ( _.isString(obj) || _.isBoolean(obj) || _.isNumber(obj)) {
                return "basic";
            } else if (_.isUndefined(obj) || _.isNaN(obj) || _.isNull(obj)) {
                return "empty";
            } else {
                return "object";
            }
        },
        composeProperty: function (obj, src, prop, debugName) {
            var objKind = this.resolveKind(obj[prop]);
            var srcKind = this.resolveKind(src[prop]);
            var value;

            if (srcKind === "empty") {
                return;
            } else if (objKind === "empty") {
                value = src[prop];
            } else if (objKind === "basic" && srcKind === "basic") {
                value = src[prop];
            } else if (objKind === "array" && srcKind === "array") {
                value = this.composeArrays(obj[prop], src[prop]);
            } else if (objKind === "function" && srcKind === "function") {
                value = this.composeFunctions(obj[prop], src[prop], debugName);
            } else if (objKind === "object" && srcKind === "object") {
                value = this.composeObjects(obj[prop], src[prop]);
            } else {
                this.throwError("extendingPropertyKindMismatch", [objKind, srcKind]);
            }
            obj[prop] = value;
        },
        composeArrays: function (a, b) {
            return a.concat(b);
        },
        composeObjects: function (a, b) {
            return _.extend({}, a, b);
        },
        composeFunctions: function (a, b, debugName) {
            var stackFunction;
            if (!a.hasOwnProperty("_stack")) {
                stackFunction = this.createStackFunction();
                stackFunction.pushFunction(a);
            } else {
                stackFunction = a;
            }
            stackFunction.pushFunction(b, debugName);
            return stackFunction;
        },
        createStackFunction: function () {
            var stack = [];
            var stackFunction;

            if (c0mposer.debug) {
                stackFunction = function () {
                    for (var i = 0; i < stack.length; i++) {
                        stack[i].fnc.apply(this, arguments);
                    }
                };
            } else {
                stackFunction = function () {
                    for (var i = 0; i < stack.length; i++) {
                        stack[i].apply(this, arguments);
                    }
                };
            }
            stackFunction._stack = stack;
            stackFunction.pushFunction = function (fnc, debugName) {
                if (fnc.hasOwnProperty("_stack")) {
                    this.concat(fnc);
                } else {
                    this.addOne(fnc, debugName);
                }
                return this;
            };
            stackFunction.concat = function (stackFunction) {
                Array.prototype.splice.apply(this._stack, [this._stack.length, 0].concat(stackFunction._stack));
                return this;
            };
            if (c0mposer.debug) {
                stackFunction.addOne = function (fnc, debugName) {
                    this._stack.push({ name: debugName, fnc: fnc });
                    return this;
                };
            } else {
                stackFunction.addOne = function (fnc) {
                    this._stack.push(fnc);
                    return this;
                };
            }
            return stackFunction;
        },

        log: function (msg) {
            if (c0mposer.debug && typeof (console) != "undefined") {
                console.log(msg);
            }
        },
        throwError: function (msg, obj) {
            this.log("c0mposer error \"" + msg + "\", with object:");
            this.log(obj);
            throw msg;
        }
    };
})();
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
        composeProperty: function (obj, src, prop, debugName) {
            if (_.isArray(obj[prop])) {
                this.composeArrays.apply(this, arguments);
            } else if (_.isFunction(obj[prop])) {
                this.composeFunctions.apply(this, arguments);
            } else if (src[prop] !== null) {
                obj[prop] = src[prop];
            }            
        },
        composeArrays: function (obj, src, prop) {
            if (!_.isArray(src[prop])) {
                this.throwError("extendingArrayWithNonArray", src[prop]);
            }
            obj[prop] = obj[prop].concat(src[prop]);
        },
        composeFunctions: function (obj, src, prop, debugName) {
            if (!_.isFunction(src[prop])) {
                this.throwError("extendingFunctionWithNonFunction", src[prop]);
            }
            if (!obj[prop].hasOwnProperty("_stack")) {
                var stackFunction = this.createStackFunction();
                stackFunction.pushFunction(obj[prop]);
                obj[prop] = stackFunction;
            }
            obj[prop].pushFunction(src[prop], debugName);
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
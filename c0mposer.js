var c0mposer;

(function () {
    c0mposer = {
        create: function (options) {
            return _.extend({}, c0mposer, options || {});
        },

        debug: true,
        parseFunction: null,

        compose: function () {
            var obj = { }, composer = this;
            _.each(arguments, function(sourceDef) {
                var source = _.isString(sourceDef) && composer.parseFunction ? composer.parseFunction(sourceDef) : sourceDef;
                for (var prop in source) {
                    if (_.isFunction(obj[prop])) {
                        if (_.isFunction(source[prop])) {
                            if (obj[prop].hasOwnProperty("_stack")) {
                                if (source[prop].hasOwnProperty("_stack")) {
                                    Array.prototype.splice.apply(obj[prop]._stack, [obj[prop]._stack.length - 1, 0].concat(source[prop]._stack));
                                } else {
                                    if (composer.debug) {
                                        obj[prop]._stack.push({ name: sourceDef, fnc: source[prop] });
                                    } else {
                                        obj[prop]._stack.push(source[prop]);
                                    }
                                }
                            } else {
                                (function () {
                                    var stack;
                                    if (composer.debug) {
                                        stack = [{ fnc: obj[prop] }, { name: sourceDef, fnc: source[prop] }];
                                    } else {
                                        stack = [obj[prop], source[prop]];
                                    }
                                    obj[prop] = function () {
                                        for (var i = 0; i < stack.length; i++) {
                                            if (composer.debug) {
                                                stack[i].fnc.apply(this, arguments);
                                            } else {
                                                stack[i].apply(this, arguments);
                                            }
                                        }
                                    };
                                    obj[prop]._stack = stack;
                                })();
                            }
                        } else {
                            composer.throwError("addingExtendFunctionWithNonFunction");
                        }
                    } else if (_.isArray(obj[prop])) {
                        if (_.isArray(source[prop])) {
                            obj[prop] = obj[prop].concat(source[prop]);
                        } else {
                            composer.throwError("addingExtendArrayWithNonArray");
                        }
                    } else if (source[prop] !== null) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        },
        log: function (msg) {
            if (this.debug && typeof (console) != "undefined") {
                console.log(msg);
            }
        },
        throwError: function (msg, obj) {
            this.log(obj);
            throw msg;
        }
    };
})();
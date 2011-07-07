describe("c0mposer.compose", function () {
    var obj, composer;

    beforeEach(function () {
        obj = { a: "1", b: 2, c: true, d: function () { }, e: ["firstItem", "secondItem"] };
        composer = c0mposer.create();
        composer.debug = true;
    });

    it("should create a new instance and leave the original one untouched", function () {
        var obj2 = composer.compose(obj);
        expect(obj2===obj).toBeFalsy();
        expect(obj2).toEqual(obj);
    });

    it("should add property if it does not exist", function () {
        var array = ["newArray"], object = {};
        obj = composer.compose(obj, { f: array, g: object, h: "stringy", i: false, k: 6 });
        expect(obj.f).toEqual(array);
        expect(obj.g).toEqual(object);
        expect(obj.h).toEqual("stringy");
        expect(obj.i).toEqual(false);
        expect(obj.k).toEqual(6);
    });

    it("should replace properties that are not arrays of functions", function () {
        obj = composer.compose(obj, { a: "5", b: true, c: 784 });
        expect(obj.a).toEqual("5");
        expect(obj.b).toEqual(true);
        expect(obj.c).toEqual(784);
    });

    it("should concatenate arrays", function () {
        obj = composer.compose(obj, { e: ["thirdItem"] });
        expect(obj.e.length).toEqual(3);
        expect(obj.e[2]).toEqual("thirdItem");
    });

    describe("Function properties", function () {
        describe("Cumulating functions", function () {
            var f1, f1Called, f2, f2Called, f3, f3Called, args;

            beforeEach(function () {
                args = {};
                f1Called = false;
                f2Called = false;
                f3Called = false;

                f1 = function () {
                    if (f1Called || f2Called || f3Called) {
                        throw "Wrong order in calling extended function (old one should be first).";
                    }
                    if (arguments[0] !== args) {
                        throw "Wrong arguments given for f1";
                    }
                    f1Called = true;
                };

                f2 = function () {
                    if (f2Called || f3Called) {
                        throw "Wrong order in calling extended function (old one should be first).";
                    }
                    if (arguments[0] !== args) {
                        throw "Wrong arguments given for f2";
                    }
                    f2Called = true;
                };

                f3 = function () {
                    if (f3Called) {
                        throw "Wrong order in calling extended function (old one should be first).";
                    }
                    if (arguments[0] !== args) {
                        throw "Wrong arguments given for f3";
                    }
                    f3Called = true;
                };

                obj.f = f1;
            });

            afterEach(function () {
                expect(f1Called).toBeTruthy();
                expect(f2Called).toBeTruthy();
                expect(f3Called).toBeTruthy();
            });

            it("should call all replaced functions", function () {
                composer.debug = false;
                obj = composer.compose(obj, { f: f2 }, { f: f3 });
                obj.f(args);
            });

            it("should call all replaced functions when debugging", function () {
                composer.debug = true;
                obj = composer.compose(obj, { f: f2 }, { f: f3 });
                obj.f(args);
            });
        });

        describe("Debugging info", function () {
            var functions;

            beforeEach(function () {
                functions = {
                    first: { d: function () { } },
                    second: { d: function () { } }
                };
                composer.parseFunction = function (def) {
                      return functions[def];
                };
            });

            it("should not save debugging info when debug is set to false", function () {
                composer.debug = false;
                var obj2 = composer.compose(obj, "first", "second");
                expect(obj2.d._stack).toEqual([ obj.d, functions.first.d, functions.second.d ]);
            });

            it("should save debugging info when debug is set to true", function () {
                composer.debug = true;
                var obj2 = composer.compose(obj, "first", "second");
                expect(obj2.d._stack).toBeDefined();
                expect(obj2.d._stack[0]).toEqual({ fnc: obj.d });
                expect(obj2.d._stack[1]).toEqual({ name: "first", fnc: functions.first.d });
                expect(obj2.d._stack[2]).toEqual({ name: "second", fnc: functions.second.d });
            });
        });
    });

    describe("Error throwing", function () {
        var errorThrown;

        beforeEach(function () {
            errorThrown = false;
        });

        afterEach(function () {
            expect(errorThrown).toBeTruthy();
        });

        it("should throw an error when trying to replace an array with something else", function () {
            try {
                obj = composer.compose(obj, { e: "Hello world" });
            } catch(e) {
                errorThrown = e === "addingExtendArrayWithNonArray";
            }
        });

        it("should throw an error when trying to replace a function with something else", function () {
            try {
                obj = composer.compose(obj, { d: null });
            } catch(e) {
                errorThrown = e === "addingExtendFunctionWithNonFunction";
            }
        });
    });
});
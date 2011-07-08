describe("c0mposer.compose", function () {
    var obj, composer;

    beforeEach(function () {
        obj = {
            a: "1",
            b: 2,
            c: true,
            d: function () { },
            e: ["firstItem", "secondItem"],
            o: { key: "value", secondKey: "secondValue" }
        };
        composer = c0mposer.instance();
    });

    it("should create a new instance and leave the original one untouched", function () {
        var obj2 = composer.create(obj);
        expect(obj2===obj).toBeFalsy();
        expect(obj2).toEqual(obj);
    });

    it("should add property if it does not exist", function () {
        var array = ["newArray"], object = {};
        composer.compose(obj, { f: array, g: object, h: "stringy", i: false, k: 6 });
        expect(obj.f).toEqual(array);
        expect(obj.g).toEqual(object);
        expect(obj.h).toEqual("stringy");
        expect(obj.i).toEqual(false);
        expect(obj.k).toEqual(6);
    });

    it("should replace properties that are strings, booleans or numbers", function () {
        composer.compose(obj, { a: "5", b: true, c: 784 });
        expect(obj.a).toEqual("5");
        expect(obj.b).toEqual(true);
        expect(obj.c).toEqual(784);
    });

    it("should concatenate arrays", function () {
        composer.compose(obj, { e: ["thirdItem"] });
        expect(obj.e.length).toEqual(3);
        expect(obj.e[2]).toEqual("thirdItem");
    });

    it("should merge objects", function () {
        composer.compose(obj, { o: { key: "newValue", otherKey: "otherValue" } });
        expect(obj.o).toEqual({ key: "newValue", secondKey: "secondValue", otherKey: "otherValue" });
    });

    describe("Function properties", function () {
        it("should concatenate two stack functions", function () {
            var f1 = function () { };
            var f2 = function () { };
            var f3 = function () { };
            var f4 = function () { };
            var f5 = composer.createStackFunction().pushFunction(f1).pushFunction(f2);
            var f6 = composer.createStackFunction().pushFunction(f3).pushFunction(f4).concat(f5);
            expect(f6._stack).toEqual([f3, f4, f1, f2]);
        });

        describe("Cumulating functions", function () {
            var f1, f1Called, f2, f2Called, f3, f3Called, args;

            beforeEach(function () {
                args = {};
                f1Called = false;
                f2Called = false;
                f3Called = false;

                f1 = function () {
                    if (f1Called || f2Called || f3Called) {
                        throw "f1 Wrong order in calling extended function (old one should be first).";
                    }
                    if (arguments[0] !== args) {
                        throw "Wrong arguments given for f1";
                    }
                    f1Called = true;
                };

                f2 = function () {
                    if (f2Called || f3Called) {
                        throw "f2 Wrong order in calling extended function (old one should be first).";
                    }
                    if (arguments[0] !== args) {
                        throw "Wrong arguments given for f2";
                    }
                    f2Called = true;
                };

                f3 = function () {
                    if (f3Called) {
                        throw "f3 Wrong order in calling extended function (old one should be first).";
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
                composer.compose(obj, { f: f2 }, { f: f3 });
                obj.f(args);
            });

            it("should call all replaced functions when debugging", function () {
                composer.debug = true;
                composer.compose(obj, { f: f2 }, { f: f3 });
                obj.f(args);
            });
        });

        describe("Debugging info", function () {
            beforeEach(function () {
                composer.library = {
                    first: { d: function () { } },
                    second: { d: function () { } }
                };
            });

            it("should not save debugging info when debug is set to false", function () {
                var obj2 = composer.create(obj, "first", "second");
                expect(obj2.d._stack).toEqual([ obj.d, composer.library.first.d, composer.library.second.d ]);
            });

            it("should save debugging info when debug is set to true", function () {
                composer.debug = true;
                var obj2 = composer.create(obj, "first", "second");
                expect(obj2._lineage).toEqual([undefined, "first", "second"]);
                expect(obj2.d._lineage).toEqual([undefined, "first", "second"]);
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
                composer.compose(obj, { e: "Hello world" });
            } catch(e) {
                errorThrown = e === "extendingPropertyKindMismatch";
            }
        });

        it("should throw an error when trying to replace a function with something else", function () {
            try {
                composer.compose(obj, { d: "Hello world" });
            } catch(e) {
                errorThrown = e === "extendingPropertyKindMismatch";
            }
        });

        it("should throw an error when trying to replace an object with something else", function () {
            try {
                composer.compose(obj, { o: "Hello world" });
            } catch(e) {
                errorThrown = e === "extendingPropertyKindMismatch";
            }
        });
    });
});
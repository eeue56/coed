(() => {
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __commonJS = (cb, mod) =>
        function __require() {
            return (
                mod ||
                    (0, cb[__getOwnPropNames(cb)[0]])(
                        (mod = { exports: {} }).exports,
                        mod,
                    ),
                mod.exports
            );
        };
    var __copyProps = (to, from, except, desc) => {
        if ((from && typeof from === "object") || typeof from === "function") {
            for (let key of __getOwnPropNames(from))
                if (!__hasOwnProp.call(to, key) && key !== except)
                    __defProp(to, key, {
                        get: () => from[key],
                        enumerable:
                            !(desc = __getOwnPropDesc(from, key)) ||
                            desc.enumerable,
                    });
        }
        return to;
    };
    var __toESM = (mod, isNodeMode, target) => (
        (target = mod != null ? __create(__getProtoOf(mod)) : {}),
        __copyProps(
            isNodeMode || !mod || !mod.__esModule
                ? __defProp(target, "default", { value: mod, enumerable: true })
                : target,
            mod,
        )
    );

    // ../../../../../node_modules/@eeue56/ts-core/build/main/lib/basics.js
    var require_basics = __commonJS({
        "../../../../../node_modules/@eeue56/ts-core/build/main/lib/basics.js"(
            exports,
        ) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            exports.compose = exports.pipe = void 0;
            function pipe(value, ...functions) {
                return functions.reduce((currentValue, func) => {
                    return func(currentValue);
                }, value);
            }
            exports.pipe = pipe;
            function compose(...functions) {
                return function (value) {
                    return functions.reduce((currentValue, func) => {
                        return func(currentValue);
                    }, value);
                };
            }
            exports.compose = compose;
        },
    });

    // ../../../../../node_modules/@eeue56/ts-core/build/main/lib/debug.js
    var require_debug = __commonJS({
        "../../../../../node_modules/@eeue56/ts-core/build/main/lib/debug.js"(
            exports,
        ) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            exports.log = void 0;
            function log(message, value) {
                console.log(message, value);
                return value;
            }
            exports.log = log;
        },
    });

    // ../../../../../node_modules/@eeue56/ts-core/build/main/lib/maybe.js
    var require_maybe = __commonJS({
        "../../../../../node_modules/@eeue56/ts-core/build/main/lib/maybe.js"(
            exports,
        ) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            exports.andThen =
                exports.map3 =
                exports.map2 =
                exports.map =
                exports.withDefault =
                exports.isNothing =
                exports.isJust =
                exports.Nothing =
                exports.Just =
                    void 0;
            function Just(value) {
                return {
                    kind: "just",
                    value,
                };
            }
            exports.Just = Just;
            function Nothing() {
                return {
                    kind: "nothing",
                };
            }
            exports.Nothing = Nothing;
            function isJust(maybe) {
                switch (maybe.kind) {
                    case "just":
                        return true;
                    default:
                        return false;
                }
            }
            exports.isJust = isJust;
            function isNothing(maybe) {
                switch (maybe.kind) {
                    case "nothing":
                        return true;
                    default:
                        return false;
                }
            }
            exports.isNothing = isNothing;
            function withDefault(value, maybeValue) {
                switch (maybeValue.kind) {
                    case "just":
                        return maybeValue.value;
                    default:
                        return value;
                }
            }
            exports.withDefault = withDefault;
            function map(func, maybeValue) {
                switch (maybeValue.kind) {
                    case "just":
                        return Just(func(maybeValue.value));
                    default:
                        return maybeValue;
                }
            }
            exports.map = map;
            function map2(func, firstMaybeValue, secondMaybeValue) {
                switch (firstMaybeValue.kind) {
                    case "just":
                        switch (secondMaybeValue.kind) {
                            case "just":
                                return Just(
                                    func(
                                        firstMaybeValue.value,
                                        secondMaybeValue.value,
                                    ),
                                );
                            default:
                                return Nothing();
                        }
                    default:
                        return Nothing();
                }
            }
            exports.map2 = map2;
            function map3(
                func,
                firstMaybeValue,
                secondMaybeValue,
                thirdMaybeValue,
            ) {
                switch (firstMaybeValue.kind) {
                    case "just":
                        switch (secondMaybeValue.kind) {
                            case "just":
                                switch (thirdMaybeValue.kind) {
                                    case "just":
                                        return Just(
                                            func(
                                                firstMaybeValue.value,
                                                secondMaybeValue.value,
                                                thirdMaybeValue.value,
                                            ),
                                        );
                                    default:
                                        return Nothing();
                                }
                            default:
                                return Nothing();
                        }
                    default:
                        return Nothing();
                }
            }
            exports.map3 = map3;
            function andThen(func, maybeValue) {
                switch (maybeValue.kind) {
                    case "just":
                        return func(maybeValue.value);
                    default:
                        return Nothing();
                }
            }
            exports.andThen = andThen;
        },
    });

    // ../../../../../node_modules/@eeue56/ts-core/build/main/lib/result.js
    var require_result = __commonJS({
        "../../../../../node_modules/@eeue56/ts-core/build/main/lib/result.js"(
            exports,
        ) {
            "use strict";
            var __createBinding =
                (exports && exports.__createBinding) ||
                (Object.create
                    ? function (o, m, k, k2) {
                          if (k2 === void 0) k2 = k;
                          Object.defineProperty(o, k2, {
                              enumerable: true,
                              get: function () {
                                  return m[k];
                              },
                          });
                      }
                    : function (o, m, k, k2) {
                          if (k2 === void 0) k2 = k;
                          o[k2] = m[k];
                      });
            var __setModuleDefault =
                (exports && exports.__setModuleDefault) ||
                (Object.create
                    ? function (o, v) {
                          Object.defineProperty(o, "default", {
                              enumerable: true,
                              value: v,
                          });
                      }
                    : function (o, v) {
                          o["default"] = v;
                      });
            var __importStar =
                (exports && exports.__importStar) ||
                function (mod) {
                    if (mod && mod.__esModule) return mod;
                    var result = {};
                    if (mod != null) {
                        for (var k in mod)
                            if (
                                k !== "default" &&
                                Object.prototype.hasOwnProperty.call(mod, k)
                            )
                                __createBinding(result, mod, k);
                    }
                    __setModuleDefault(result, mod);
                    return result;
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            exports.andThen =
                exports.mapError =
                exports.map3 =
                exports.map2 =
                exports.map =
                exports.fromMaybe =
                exports.toMaybe =
                exports.either =
                exports.withDefault =
                exports.Err =
                exports.Ok =
                    void 0;
            var Maybe = __importStar(require_maybe());
            function Ok(value) {
                return {
                    kind: "ok",
                    value,
                };
            }
            exports.Ok = Ok;
            function Err(error) {
                return {
                    kind: "err",
                    error,
                };
            }
            exports.Err = Err;
            function withDefault(value, result) {
                switch (result.kind) {
                    case "ok":
                        return result.value;
                    default:
                        return value;
                }
            }
            exports.withDefault = withDefault;
            function either(result) {
                switch (result.kind) {
                    case "ok":
                        return result.value;
                    default:
                        return result.error;
                }
            }
            exports.either = either;
            function toMaybe(result) {
                switch (result.kind) {
                    case "ok":
                        return Maybe.Just(result.value);
                    default:
                        return Maybe.Nothing();
                }
            }
            exports.toMaybe = toMaybe;
            function fromMaybe(error, maybe) {
                switch (maybe.kind) {
                    case "just":
                        return Ok(maybe.value);
                    default:
                        return Err(error);
                }
            }
            exports.fromMaybe = fromMaybe;
            function map(func, result) {
                switch (result.kind) {
                    case "ok":
                        return Ok(func(result.value));
                    default:
                        return result;
                }
            }
            exports.map = map;
            function map2(func, firstResult, secondResult) {
                switch (firstResult.kind) {
                    case "ok":
                        switch (secondResult.kind) {
                            case "ok":
                                return Ok(
                                    func(firstResult.value, secondResult.value),
                                );
                            default:
                                return secondResult;
                        }
                    default:
                        return firstResult;
                }
            }
            exports.map2 = map2;
            function map3(func, firstResult, secondResult, thirdResult) {
                switch (firstResult.kind) {
                    case "ok":
                        switch (secondResult.kind) {
                            case "ok":
                                switch (thirdResult.kind) {
                                    case "ok":
                                        return Ok(
                                            func(
                                                firstResult.value,
                                                secondResult.value,
                                                thirdResult.value,
                                            ),
                                        );
                                    default:
                                        return thirdResult;
                                }
                            default:
                                return secondResult;
                        }
                    default:
                        return firstResult;
                }
            }
            exports.map3 = map3;
            function mapError(func, result) {
                switch (result.kind) {
                    case "err":
                        return Err(func(result.error));
                    default:
                        return result;
                }
            }
            exports.mapError = mapError;
            function andThen(func, result) {
                switch (result.kind) {
                    case "ok":
                        return func(result.value);
                    default:
                        return result;
                }
            }
            exports.andThen = andThen;
        },
    });

    // ../../../../../node_modules/@eeue56/ts-core/build/main/lib/tuple.js
    var require_tuple = __commonJS({
        "../../../../../node_modules/@eeue56/ts-core/build/main/lib/tuple.js"(
            exports,
        ) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            exports.mapBoth =
                exports.mapSecond =
                exports.mapFirst =
                exports.second =
                exports.first =
                exports.pair =
                    void 0;
            function pair(first2, second2) {
                return {
                    first: first2,
                    second: second2,
                };
            }
            exports.pair = pair;
            function first(tuple) {
                return tuple.first;
            }
            exports.first = first;
            function second(tuple) {
                return tuple.second;
            }
            exports.second = second;
            function mapFirst(func, tuple) {
                return {
                    first: func(tuple.first),
                    second: tuple.second,
                };
            }
            exports.mapFirst = mapFirst;
            function mapSecond(func, tuple) {
                return {
                    first: tuple.first,
                    second: func(tuple.second),
                };
            }
            exports.mapSecond = mapSecond;
            function mapBoth(firstFunc, secondFunc, tuple) {
                return {
                    first: firstFunc(tuple.first),
                    second: secondFunc(tuple.second),
                };
            }
            exports.mapBoth = mapBoth;
        },
    });

    // ../../../../../node_modules/@eeue56/ts-core/build/main/index.js
    var require_main = __commonJS({
        "../../../../../node_modules/@eeue56/ts-core/build/main/index.js"(
            exports,
        ) {
            "use strict";
            var __createBinding =
                (exports && exports.__createBinding) ||
                (Object.create
                    ? function (o, m, k, k2) {
                          if (k2 === void 0) k2 = k;
                          Object.defineProperty(o, k2, {
                              enumerable: true,
                              get: function () {
                                  return m[k];
                              },
                          });
                      }
                    : function (o, m, k, k2) {
                          if (k2 === void 0) k2 = k;
                          o[k2] = m[k];
                      });
            var __setModuleDefault =
                (exports && exports.__setModuleDefault) ||
                (Object.create
                    ? function (o, v) {
                          Object.defineProperty(o, "default", {
                              enumerable: true,
                              value: v,
                          });
                      }
                    : function (o, v) {
                          o["default"] = v;
                      });
            var __importStar =
                (exports && exports.__importStar) ||
                function (mod) {
                    if (mod && mod.__esModule) return mod;
                    var result = {};
                    if (mod != null) {
                        for (var k in mod)
                            if (
                                k !== "default" &&
                                Object.prototype.hasOwnProperty.call(mod, k)
                            )
                                __createBinding(result, mod, k);
                    }
                    __setModuleDefault(result, mod);
                    return result;
                };
            Object.defineProperty(exports, "__esModule", { value: true });
            exports.Tuple =
                exports.Result =
                exports.Maybe =
                exports.Debug =
                exports.Basics =
                    void 0;
            exports.Basics = __importStar(require_basics());
            exports.Debug = __importStar(require_debug());
            exports.Maybe = __importStar(require_maybe());
            exports.Result = __importStar(require_result());
            exports.Tuple = __importStar(require_tuple());
        },
    });

    // ../../build/coed.js
    var require_coed = __commonJS({
        "../../build/coed.js"(exports) {
            "use strict";
            Object.defineProperty(exports, "__esModule", { value: true });
            exports.embed =
                exports.em =
                exports.dt =
                exports.dl =
                exports.div =
                exports.dialog =
                exports.dfn =
                exports.details =
                exports.del =
                exports.dd =
                exports.datalist =
                exports.data =
                exports.colgroup =
                exports.col =
                exports.code =
                exports.cite =
                exports.caption =
                exports.canvas =
                exports.button =
                exports.br =
                exports.body =
                exports.blockquote =
                exports.bdo =
                exports.bdi =
                exports.base =
                exports.b =
                exports.audio =
                exports.aside =
                exports.article =
                exports.area =
                exports.address =
                exports.abbr =
                exports.a =
                exports.program =
                exports.map =
                exports.triggerEvent =
                exports.buildTree =
                exports.hydrateNode =
                exports.hydrate =
                exports.flatRender =
                exports.render =
                exports.voidNode =
                exports.node =
                exports.text =
                exports.onInput =
                exports.on =
                exports.attribute =
                exports.none =
                exports.style_ =
                exports.class_ =
                    void 0;
            exports.ruby =
                exports.rtc =
                exports.rt =
                exports.rp =
                exports.rb =
                exports.q =
                exports.progress =
                exports.pre =
                exports.param =
                exports.p =
                exports.output =
                exports.option =
                exports.optgroup =
                exports.ol =
                exports.object =
                exports.noscript =
                exports.nav =
                exports.meter =
                exports.meta =
                exports.menuitem =
                exports.menu =
                exports.mark =
                exports.map_ =
                exports.main =
                exports.link =
                exports.li =
                exports.legend =
                exports.label =
                exports.keygen =
                exports.kbd =
                exports.ins =
                exports.input =
                exports.img =
                exports.iframe =
                exports.i =
                exports.html =
                exports.hr =
                exports.hgroup =
                exports.header =
                exports.head =
                exports.h6 =
                exports.h5 =
                exports.h4 =
                exports.h3 =
                exports.h2 =
                exports.h1 =
                exports.form =
                exports.footer =
                exports.figure =
                exports.fieldset =
                    void 0;
            exports.wbr =
                exports.video =
                exports.var_ =
                exports.ul =
                exports.u =
                exports.track =
                exports.tr =
                exports.title =
                exports.time =
                exports.thead =
                exports.th =
                exports.tfoot =
                exports.textarea =
                exports.template =
                exports.td =
                exports.tbody =
                exports.table =
                exports.sup =
                exports.summary =
                exports.sub =
                exports.style =
                exports.strong =
                exports.span =
                exports.source =
                exports.small =
                exports.select =
                exports.section =
                exports.script =
                exports.samp =
                exports.s =
                    void 0;
            var ts_core_1 = require_main();
            function class_(str) {
                return {
                    kind: "string",
                    key: "class",
                    value: str,
                };
            }
            exports.class_ = class_;
            function style_(key, value) {
                return {
                    kind: "style",
                    key,
                    value,
                };
            }
            exports.style_ = style_;
            function none() {
                return {
                    kind: "none",
                };
            }
            exports.none = none;
            function attribute(key, value) {
                if (key === "style")
                    return style_(value.split(":")[0], value.split(":")[1]);
                return {
                    kind: "string",
                    key,
                    value,
                };
            }
            exports.attribute = attribute;
            function on2(name, tagger) {
                return {
                    name,
                    tagger: (event) => {
                        if (event.stopPropagation) {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                        return tagger(event);
                    },
                };
            }
            exports.on = on2;
            function onInput(tagger) {
                return {
                    name: "input",
                    tagger: (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        return tagger(event.target.value);
                    },
                };
            }
            exports.onInput = onInput;
            function text2(str) {
                return {
                    kind: "text",
                    text: str,
                };
            }
            exports.text = text2;
            function node(tag, events, attributes, children) {
                return {
                    kind: "regular",
                    tag,
                    events,
                    attributes: combineAttributes(attributes),
                    children,
                    _eventListeners: [],
                };
            }
            exports.node = node;
            function voidNode(tag, events, attributes) {
                return {
                    kind: "void",
                    tag,
                    events,
                    attributes: combineAttributes(attributes),
                    _eventListeners: [],
                };
            }
            exports.voidNode = voidNode;
            function combineAttributes(attributes) {
                const knownStringAttributes = {};
                const knownStyleAttributes = [];
                const otherAttributes = [];
                attributes.forEach((attribute2) => {
                    switch (attribute2.kind) {
                        case "string":
                            if (!knownStringAttributes[attribute2.key]) {
                                knownStringAttributes[attribute2.key] = [];
                            }
                            knownStringAttributes[attribute2.key].push(
                                attribute2,
                            );
                            break;
                        case "style":
                            knownStyleAttributes.push(attribute2);
                            break;
                        default:
                            otherAttributes.push(attribute2);
                    }
                });
                const combinedAttributes = otherAttributes.filter(
                    (attribute2) => attribute2.kind !== "none",
                );
                Object.keys(knownStringAttributes).map((key) => {
                    combinedAttributes.push(
                        knownStringAttributes[key].reduce(
                            (acc, currentValue) => {
                                if (key === "class") {
                                    acc.value += " " + currentValue.value;
                                }
                                return acc;
                            },
                        ),
                    );
                });
                if (knownStyleAttributes.length > 0) {
                    combinedAttributes.push(
                        knownStyleAttributes.reduce(
                            (acc, currentValue) => {
                                if (typeof acc.value === "undefined")
                                    acc.value = "";
                                acc.value +=
                                    currentValue.key +
                                    ":" +
                                    currentValue.value +
                                    ";";
                                return acc;
                            },
                            attribute("style", ""),
                        ),
                    );
                }
                return combinedAttributes;
            }
            function renderAttribute(attribute2) {
                switch (attribute2.kind) {
                    case "string":
                        if (attribute2.value.indexOf('"') > 0) {
                            return `${attribute2.key}='${attribute2.value}'`;
                        }
                        return `${attribute2.key}="${attribute2.value}"`;
                    case "number":
                        return `${attribute2.key}=${attribute2.value}`;
                    case "style":
                        return "";
                    case "none":
                        return "";
                }
            }
            function render(node2, depth = 0) {
                const whitespace = " ".repeat(depth * 4);
                switch (node2.kind) {
                    case "text":
                        return whitespace + node2.text;
                    case "void":
                    case "regular":
                        const attributes =
                            (node2.attributes.length > 0 ? " " : "") +
                            node2.attributes.map(renderAttribute).join(" ");
                        switch (node2.kind) {
                            case "void":
                                return (
                                    whitespace + `<${node2.tag}${attributes}>`
                                );
                            case "regular": {
                                if (node2.children.length > 0) {
                                    return (
                                        whitespace +
                                        `<${node2.tag}${attributes}>
${node2.children.map((child) => render(child, depth + 1)).join("\n")}
${whitespace}</${node2.tag}>`
                                    );
                                }
                                return (
                                    whitespace +
                                    `<${node2.tag}${attributes}></${node2.tag}>`
                                );
                            }
                        }
                }
            }
            exports.render = render;
            function flatRender(node2) {
                switch (node2.kind) {
                    case "text":
                        return node2.text;
                    case "void":
                    case "regular":
                        const attributes =
                            (node2.attributes.length > 0 ? " " : "") +
                            node2.attributes.map(renderAttribute).join(" ");
                        switch (node2.kind) {
                            case "void":
                                return `<${node2.tag}${attributes}>`;
                            case "regular": {
                                if (node2.children.length > 0) {
                                    return `<${
                                        node2.tag
                                    }${attributes}>${node2.children
                                        .map((child) => flatRender(child))
                                        .join("")}</${node2.tag}>`;
                                }
                                return `<${node2.tag}${attributes}></${node2.tag}>`;
                            }
                        }
                }
            }
            exports.flatRender = flatRender;
            function hydrate2(program3, root) {
                program3.program.root = root;
                const node2 = program3.program.view(
                    program3.program.initialModel,
                );
                hydrateNode(node2, program3.send, root);
            }
            exports.hydrate = hydrate2;
            function hydrateNode(node2, listener, root) {
                switch (node2.kind) {
                    case "text": {
                        return;
                    }
                    case "void":
                    case "regular": {
                        node2.events.forEach((event) => {
                            const listenerFunction = (data2) => {
                                listener(event.tagger(data2));
                            };
                            root.addEventListener(
                                event.name,
                                listenerFunction,
                                {
                                    once: true,
                                },
                            );
                            node2._eventListeners.push({
                                event,
                                listener: listenerFunction,
                            });
                        });
                    }
                }
                if (node2.kind === "regular") {
                    node2.children.forEach((child, i2) => {
                        const newRoot = root.children[i2];
                        hydrateNode(child, listener, newRoot);
                    });
                }
            }
            exports.hydrateNode = hydrateNode;
            function buildTree(listener, node2) {
                switch (node2.kind) {
                    case "text":
                        return document.createTextNode(node2.text);
                    case "void":
                    case "regular": {
                        const element = document.createElement(node2.tag);
                        node2.attributes.forEach((attribute2) => {
                            setAttributeOnElement(element, attribute2);
                        });
                        node2.events.forEach((event) => {
                            const listenerFunction = (data2) => {
                                listener(event.tagger(data2));
                            };
                            element.addEventListener(
                                event.name,
                                listenerFunction,
                                {
                                    once: true,
                                },
                            );
                            node2._eventListeners.push({
                                event,
                                listener: listenerFunction,
                            });
                        });
                        if (node2.kind === "regular") {
                            const children = node2.children.map((child) =>
                                buildTree(listener, child),
                            );
                            children.forEach((child) => {
                                element.appendChild(child);
                            });
                        }
                        return element;
                    }
                }
            }
            exports.buildTree = buildTree;
            function triggerEvent(eventName, payload, node2) {
                switch (node2.kind) {
                    case "text":
                        return ts_core_1.Maybe.Nothing();
                    case "void":
                    case "regular":
                        const events = node2.events.filter(
                            (event) => event.name === eventName,
                        );
                        if (events.length > 0) {
                            return ts_core_1.Maybe.Just(
                                events[0].tagger(payload),
                            );
                        } else {
                            return ts_core_1.Maybe.Nothing();
                        }
                }
            }
            exports.triggerEvent = triggerEvent;
            function map(tagger, tree) {
                switch (tree.kind) {
                    case "text":
                        return tree;
                    case "void":
                        return voidNode(
                            tree.tag,
                            tree.events.map((event) => {
                                return on2(event.name, (data2) =>
                                    tagger(event.tagger(data2)),
                                );
                            }),
                            tree.attributes,
                        );
                    case "regular":
                        return node(
                            tree.tag,
                            tree.events.map((event) => {
                                return on2(event.name, (data2) =>
                                    tagger(event.tagger(data2)),
                                );
                            }),
                            tree.attributes,
                            tree.children.map((child) => {
                                return map(tagger, child);
                            }),
                        );
                }
            }
            exports.map = map;
            function setAttributeOnElement(element, attribute2) {
                switch (attribute2.kind) {
                    case "string":
                    case "number":
                        const hasSameAttributeAlready =
                            element.getAttribute(attribute2.key) ===
                            attribute2.value;
                        if (hasSameAttributeAlready) return;
                        element[attribute2.key] = attribute2.value;
                        element.setAttribute(attribute2.key, attribute2.value);
                        return;
                    case "style":
                        element.removeAttribute("style");
                        const styles = attribute2.value.split(";");
                        for (var i2 = 0; i2 < styles.length; i2++) {
                            const styleName = styles[i2].split(":")[0];
                            const styleValue = styles[i2].split(":")[1];
                            element.style[styleName] = styleValue;
                        }
                        return;
                    case "none":
                        return;
                }
            }
            function patchFacts(previousTree, nextTree, elements) {
                switch (nextTree.kind) {
                    case "void":
                    case "regular": {
                        if (previousTree.kind === nextTree.kind) {
                            previousTree.attributes
                                .filter((attribute2) => {
                                    for (const nextAttribute of nextTree.attributes) {
                                        let seen = false;
                                        if (
                                            attribute2.kind ===
                                            nextAttribute.kind
                                        ) {
                                            switch (nextAttribute.kind) {
                                                case "number":
                                                case "string": {
                                                    seen =
                                                        nextAttribute.key ===
                                                        attribute2.key;
                                                    break;
                                                }
                                                case "style":
                                                    seen = true;
                                            }
                                        }
                                        if (seen) return false;
                                    }
                                    return true;
                                })
                                .forEach((attribute2) => {
                                    switch (attribute2.kind) {
                                        case "number":
                                            elements.removeAttribute(
                                                attribute2.key,
                                            );
                                        case "string":
                                            elements.removeAttribute(
                                                attribute2.key,
                                            );
                                        case "style":
                                            elements.removeAttribute("style");
                                    }
                                });
                        }
                        nextTree.attributes.forEach((attribute2) => {
                            setAttributeOnElement(elements, attribute2);
                        });
                        return;
                    }
                    case "text":
                        return;
                }
            }
            function patchEvents(listener, previousTree, nextTree, elements) {
                switch (nextTree.kind) {
                    case "void":
                    case "regular":
                        previousTree._eventListeners.forEach(
                            (eventListeners) => {
                                elements.removeEventListener(
                                    eventListeners.event.name,
                                    eventListeners.listener,
                                );
                            },
                        );
                        nextTree.events.forEach((event) => {
                            const listenerFunction = (data2) => {
                                listener(event.tagger(data2));
                            };
                            elements.addEventListener(
                                event.name,
                                listenerFunction,
                                {
                                    once: true,
                                },
                            );
                            nextTree._eventListeners.push({
                                event,
                                listener: listenerFunction,
                            });
                        });
                        return;
                    case "text":
                        return;
                }
            }
            function patch(listener, currentTree, nextTree, elements) {
                var _a, _b;
                if (currentTree.kind != nextTree.kind) {
                    elements.replaceWith(buildTree(listener, nextTree));
                    return nextTree;
                }
                switch (currentTree.kind) {
                    case "text":
                        nextTree = nextTree;
                        elements = elements;
                        if (currentTree.text == nextTree.text) {
                            return currentTree;
                        } else {
                            elements.replaceWith(
                                document.createTextNode(nextTree.text),
                            );
                            return nextTree;
                        }
                    case "void": {
                        currentTree = currentTree;
                        nextTree = nextTree;
                        if (currentTree.tag != nextTree.tag) {
                            elements.replaceWith(buildTree(listener, nextTree));
                            return nextTree;
                        } else {
                            patchFacts(currentTree, nextTree, elements);
                            patchEvents(
                                listener,
                                currentTree,
                                nextTree,
                                elements,
                            );
                            const htmlElements = elements;
                        }
                        return nextTree;
                    }
                    case "regular":
                        currentTree = currentTree;
                        nextTree = nextTree;
                        const currentTreeId =
                            (_a = currentTree.attributes.filter(
                                (x) => x.kind === "string" && x.key === "id",
                            )[0]) === null || _a === void 0
                                ? void 0
                                : _a.value;
                        const nextTreeId =
                            (_b = nextTree.attributes.filter(
                                (x) => x.kind === "string" && x.key === "id",
                            )[0]) === null || _b === void 0
                                ? void 0
                                : _b.value;
                        if (
                            currentTree.tag !== nextTree.tag ||
                            currentTreeId !== nextTreeId
                        ) {
                            elements.replaceWith(buildTree(listener, nextTree));
                            return nextTree;
                        } else {
                            patchFacts(currentTree, nextTree, elements);
                            patchEvents(
                                listener,
                                currentTree,
                                nextTree,
                                elements,
                            );
                            const htmlElements = elements;
                            for (
                                var i2 = 0;
                                i2 < nextTree.children.length;
                                i2++
                            ) {
                                const currentChild = currentTree.children[i2];
                                const nextChild = nextTree.children[i2];
                                const node2 = htmlElements.childNodes[i2];
                                if (typeof node2 === "undefined") {
                                    htmlElements.appendChild(
                                        buildTree(listener, nextChild),
                                    );
                                    continue;
                                }
                                switch (node2.nodeType) {
                                    case Node.ELEMENT_NODE:
                                        const element = node2;
                                        patch(
                                            listener,
                                            currentChild,
                                            nextChild,
                                            element,
                                        );
                                        break;
                                    case Node.TEXT_NODE:
                                        const text3 = node2;
                                        patch(
                                            listener,
                                            currentChild,
                                            nextChild,
                                            text3,
                                        );
                                        break;
                                }
                            }
                            for (
                                var i2 = htmlElements.childNodes.length - 1;
                                i2 > nextTree.children.length - 1;
                                i2--
                            ) {
                                const node2 = htmlElements.childNodes[i2];
                                htmlElements.removeChild(node2);
                            }
                        }
                        return nextTree;
                }
            }
            function program2(program3) {
                let model = program3.initialModel;
                let previousView = program3.view(program3.initialModel);
                let currentTree = null;
                const listener = (msg) => {
                    if (currentTree === null) {
                        currentTree = buildTree(listener, previousView);
                        if (program3.root !== "hydration") {
                            while (program3.root.firstChild) {
                                program3.root.removeChild(
                                    program3.root.firstChild,
                                );
                            }
                            program3.root.appendChild(currentTree);
                        }
                    }
                    model = program3.update(msg, model, listener);
                    const nextView = program3.view(model);
                    patch(listener, previousView, nextView, currentTree);
                    previousView = nextView;
                };
                if (program3.root !== "hydration") {
                    currentTree = buildTree(listener, previousView);
                    program3.root.appendChild(currentTree);
                }
                return {
                    program: program3,
                    send: listener,
                };
            }
            exports.program = program2;
            function a(events, attributes, children) {
                return node("a", events, attributes, children);
            }
            exports.a = a;
            function abbr(events, attributes, children) {
                return node("abbr", events, attributes, children);
            }
            exports.abbr = abbr;
            function address(events, attributes, children) {
                return node("address", events, attributes, children);
            }
            exports.address = address;
            function area(events, attributes) {
                return voidNode("area", events, attributes);
            }
            exports.area = area;
            function article(events, attributes, children) {
                return node("article", events, attributes, children);
            }
            exports.article = article;
            function aside(events, attributes, children) {
                return node("aside", events, attributes, children);
            }
            exports.aside = aside;
            function audio(events, attributes, children) {
                return node("audio", events, attributes, children);
            }
            exports.audio = audio;
            function b(events, attributes, children) {
                return node("b", events, attributes, children);
            }
            exports.b = b;
            function base(events, attributes) {
                return voidNode("base", events, attributes);
            }
            exports.base = base;
            function bdi(events, attributes, children) {
                return node("bdi", events, attributes, children);
            }
            exports.bdi = bdi;
            function bdo(events, attributes, children) {
                return node("bdo", events, attributes, children);
            }
            exports.bdo = bdo;
            function blockquote(events, attributes, children) {
                return node("blockquote", events, attributes, children);
            }
            exports.blockquote = blockquote;
            function body(events, attributes, children) {
                return node("body", events, attributes, children);
            }
            exports.body = body;
            function br(events, attributes) {
                return voidNode("br", events, attributes);
            }
            exports.br = br;
            function button2(events, attributes, children) {
                return node("button", events, attributes, children);
            }
            exports.button = button2;
            function canvas(events, attributes, children) {
                return node("canvas", events, attributes, children);
            }
            exports.canvas = canvas;
            function caption(events, attributes, children) {
                return node("caption", events, attributes, children);
            }
            exports.caption = caption;
            function cite(events, attributes, children) {
                return node("cite", events, attributes, children);
            }
            exports.cite = cite;
            function code(events, attributes, children) {
                return node("code", events, attributes, children);
            }
            exports.code = code;
            function col(events, attributes) {
                return voidNode("col", events, attributes);
            }
            exports.col = col;
            function colgroup(events, attributes, children) {
                return node("colgroup", events, attributes, children);
            }
            exports.colgroup = colgroup;
            function data(events, attributes, children) {
                return node("data", events, attributes, children);
            }
            exports.data = data;
            function datalist(events, attributes, children) {
                return node("datalist", events, attributes, children);
            }
            exports.datalist = datalist;
            function dd(events, attributes, children) {
                return node("dd", events, attributes, children);
            }
            exports.dd = dd;
            function del(events, attributes, children) {
                return node("del", events, attributes, children);
            }
            exports.del = del;
            function details(events, attributes, children) {
                return node("details", events, attributes, children);
            }
            exports.details = details;
            function dfn(events, attributes, children) {
                return node("dfn", events, attributes, children);
            }
            exports.dfn = dfn;
            function dialog(events, attributes, children) {
                return node("dialog", events, attributes, children);
            }
            exports.dialog = dialog;
            function div2(events, attributes, children) {
                return node("div", events, attributes, children);
            }
            exports.div = div2;
            function dl(events, attributes, children) {
                return node("dl", events, attributes, children);
            }
            exports.dl = dl;
            function dt(events, attributes, children) {
                return node("dt", events, attributes, children);
            }
            exports.dt = dt;
            function em(events, attributes, children) {
                return node("em", events, attributes, children);
            }
            exports.em = em;
            function embed(events, attributes) {
                return voidNode("embed", events, attributes);
            }
            exports.embed = embed;
            function fieldset(events, attributes, children) {
                return node("fieldset", events, attributes, children);
            }
            exports.fieldset = fieldset;
            function figure(events, attributes, children) {
                return node("figure", events, attributes, children);
            }
            exports.figure = figure;
            function footer(events, attributes, children) {
                return node("footer", events, attributes, children);
            }
            exports.footer = footer;
            function form(events, attributes, children) {
                return node("form", events, attributes, children);
            }
            exports.form = form;
            function h1(events, attributes, children) {
                return node("h1", events, attributes, children);
            }
            exports.h1 = h1;
            function h2(events, attributes, children) {
                return node("h2", events, attributes, children);
            }
            exports.h2 = h2;
            function h3(events, attributes, children) {
                return node("h3", events, attributes, children);
            }
            exports.h3 = h3;
            function h4(events, attributes, children) {
                return node("h4", events, attributes, children);
            }
            exports.h4 = h4;
            function h5(events, attributes, children) {
                return node("h5", events, attributes, children);
            }
            exports.h5 = h5;
            function h6(events, attributes, children) {
                return node("h6", events, attributes, children);
            }
            exports.h6 = h6;
            function head(events, attributes, children) {
                return node("head", events, attributes, children);
            }
            exports.head = head;
            function header(events, attributes, children) {
                return node("header", events, attributes, children);
            }
            exports.header = header;
            function hgroup(events, attributes, children) {
                return node("hgroup", events, attributes, children);
            }
            exports.hgroup = hgroup;
            function hr(events, attributes) {
                return voidNode("hr", events, attributes);
            }
            exports.hr = hr;
            function html(events, attributes, children) {
                return node("html", events, attributes, children);
            }
            exports.html = html;
            function i(events, attributes, children) {
                return node("i", events, attributes, children);
            }
            exports.i = i;
            function iframe(events, attributes, children) {
                return node("iframe", events, attributes, children);
            }
            exports.iframe = iframe;
            function img(events, attributes) {
                return voidNode("img", events, attributes);
            }
            exports.img = img;
            function input(events, attributes) {
                return voidNode("input", events, attributes);
            }
            exports.input = input;
            function ins(events, attributes, children) {
                return node("ins", events, attributes, children);
            }
            exports.ins = ins;
            function kbd(events, attributes, children) {
                return node("kbd", events, attributes, children);
            }
            exports.kbd = kbd;
            function keygen(events, attributes, children) {
                return node("keygen", events, attributes, children);
            }
            exports.keygen = keygen;
            function label(events, attributes, children) {
                return node("label", events, attributes, children);
            }
            exports.label = label;
            function legend(events, attributes, children) {
                return node("legend", events, attributes, children);
            }
            exports.legend = legend;
            function li(events, attributes, children) {
                return node("li", events, attributes, children);
            }
            exports.li = li;
            function link(events, attributes) {
                return voidNode("link", events, attributes);
            }
            exports.link = link;
            function main2(events, attributes, children) {
                return node("main", events, attributes, children);
            }
            exports.main = main2;
            function map_(events, attributes, children) {
                return node("map", events, attributes, children);
            }
            exports.map_ = map_;
            function mark(events, attributes, children) {
                return node("mark", events, attributes, children);
            }
            exports.mark = mark;
            function menu(events, attributes, children) {
                return node("menu", events, attributes, children);
            }
            exports.menu = menu;
            function menuitem(events, attributes, children) {
                return node("menuitem", events, attributes, children);
            }
            exports.menuitem = menuitem;
            function meta(events, attributes) {
                return voidNode("meta", events, attributes);
            }
            exports.meta = meta;
            function meter(events, attributes, children) {
                return node("meter", events, attributes, children);
            }
            exports.meter = meter;
            function nav(events, attributes, children) {
                return node("nav", events, attributes, children);
            }
            exports.nav = nav;
            function noscript(events, attributes, children) {
                return node("noscript", events, attributes, children);
            }
            exports.noscript = noscript;
            function object(events, attributes, children) {
                return node("object", events, attributes, children);
            }
            exports.object = object;
            function ol(events, attributes, children) {
                return node("ol", events, attributes, children);
            }
            exports.ol = ol;
            function optgroup(events, attributes, children) {
                return node("optgroup", events, attributes, children);
            }
            exports.optgroup = optgroup;
            function option(events, attributes, children) {
                return node("option", events, attributes, children);
            }
            exports.option = option;
            function output(events, attributes, children) {
                return node("output", events, attributes, children);
            }
            exports.output = output;
            function p(events, attributes, children) {
                return node("p", events, attributes, children);
            }
            exports.p = p;
            function param(events, attributes) {
                return voidNode("param", events, attributes);
            }
            exports.param = param;
            function pre2(events, attributes, children) {
                return node("pre", events, attributes, children);
            }
            exports.pre = pre2;
            function progress(events, attributes, children) {
                return node("progress", events, attributes, children);
            }
            exports.progress = progress;
            function q(events, attributes, children) {
                return node("q", events, attributes, children);
            }
            exports.q = q;
            function rb(events, attributes, children) {
                return node("rb", events, attributes, children);
            }
            exports.rb = rb;
            function rp(events, attributes, children) {
                return node("rp", events, attributes, children);
            }
            exports.rp = rp;
            function rt(events, attributes, children) {
                return node("rt", events, attributes, children);
            }
            exports.rt = rt;
            function rtc(events, attributes, children) {
                return node("rtc", events, attributes, children);
            }
            exports.rtc = rtc;
            function ruby(events, attributes, children) {
                return node("ruby", events, attributes, children);
            }
            exports.ruby = ruby;
            function s(events, attributes, children) {
                return node("s", events, attributes, children);
            }
            exports.s = s;
            function samp(events, attributes, children) {
                return node("samp", events, attributes, children);
            }
            exports.samp = samp;
            function script(events, attributes, children) {
                return node("script", events, attributes, children);
            }
            exports.script = script;
            function section(events, attributes, children) {
                return node("section", events, attributes, children);
            }
            exports.section = section;
            function select(events, attributes, children) {
                return node("select", events, attributes, children);
            }
            exports.select = select;
            function small(events, attributes, children) {
                return node("small", events, attributes, children);
            }
            exports.small = small;
            function source(events, attributes) {
                return voidNode("source", events, attributes);
            }
            exports.source = source;
            function span(events, attributes, children) {
                return node("span", events, attributes, children);
            }
            exports.span = span;
            function strong(events, attributes, children) {
                return node("strong", events, attributes, children);
            }
            exports.strong = strong;
            function style(events, attributes, children) {
                return node("style", events, attributes, children);
            }
            exports.style = style;
            function sub(events, attributes, children) {
                return node("sub", events, attributes, children);
            }
            exports.sub = sub;
            function summary(events, attributes, children) {
                return node("summary", events, attributes, children);
            }
            exports.summary = summary;
            function sup(events, attributes, children) {
                return node("sup", events, attributes, children);
            }
            exports.sup = sup;
            function table(events, attributes, children) {
                return node("table", events, attributes, children);
            }
            exports.table = table;
            function tbody(events, attributes, children) {
                return node("tbody", events, attributes, children);
            }
            exports.tbody = tbody;
            function td(events, attributes, children) {
                return node("td", events, attributes, children);
            }
            exports.td = td;
            function template(events, attributes, children) {
                return node("template", events, attributes, children);
            }
            exports.template = template;
            function textarea(events, attributes, children) {
                return node("textarea", events, attributes, children);
            }
            exports.textarea = textarea;
            function tfoot(events, attributes, children) {
                return node("tfoot", events, attributes, children);
            }
            exports.tfoot = tfoot;
            function th(events, attributes, children) {
                return node("th", events, attributes, children);
            }
            exports.th = th;
            function thead(events, attributes, children) {
                return node("thead", events, attributes, children);
            }
            exports.thead = thead;
            function time(events, attributes, children) {
                return node("time", events, attributes, children);
            }
            exports.time = time;
            function title(events, attributes, children) {
                return node("title", events, attributes, children);
            }
            exports.title = title;
            function tr(events, attributes, children) {
                return node("tr", events, attributes, children);
            }
            exports.tr = tr;
            function track(events, attributes) {
                return voidNode("track", events, attributes);
            }
            exports.track = track;
            function u(events, attributes, children) {
                return node("u", events, attributes, children);
            }
            exports.u = u;
            function ul(events, attributes, children) {
                return node("ul", events, attributes, children);
            }
            exports.ul = ul;
            function var_(events, attributes, children) {
                return node("var", events, attributes, children);
            }
            exports.var_ = var_;
            function video(events, attributes, children) {
                return node("video", events, attributes, children);
            }
            exports.video = video;
            function wbr(events, attributes) {
                return voidNode("wbr", events, attributes);
            }
            exports.wbr = wbr;
        },
    });

    // src/index.ts
    var coed = __toESM(require_coed());
    var import_coed = __toESM(require_coed());
    function GotText(text2) {
        return {
            kind: "GotText",
            text: text2,
        };
    }
    function GotError() {
        return {
            kind: "GotError",
        };
    }
    function Fetch() {
        return {
            kind: "Fetch",
        };
    }
    function Failure() {
        return {
            kind: "Failure",
        };
    }
    function Loading() {
        return {
            kind: "Loading",
        };
    }
    function Success(text2) {
        return {
            kind: "Success",
            text: text2,
        };
    }
    function PageLoaded() {
        return {
            kind: "PageLoaded",
        };
    }
    function update(msg, model, send) {
        switch (msg.kind) {
            case "GotText":
                return Success(msg.text);
            case "GotError":
                return Failure();
            case "Fetch": {
                fetch("https://elm-lang.org/assets/public-opinion.txt")
                    .then((data) => {
                        data.text().then((text2) => {
                            send(GotText(text2));
                        });
                    })
                    .catch(() => {
                        send(GotError());
                    });
                return Loading();
            }
        }
    }
    function viewState(model) {
        switch (model.kind) {
            case "PageLoaded": {
                return (0, import_coed.text)("Page loaded");
            }
            case "Loading":
                return (0, import_coed.text)("Loading...");
            case "Failure":
                return (0, import_coed.text)("I was unable to load your book.");
            case "Success":
                return (0, import_coed.pre)(
                    [],
                    [],
                    [(0, import_coed.text)(model.text)],
                );
        }
    }
    function view(model) {
        return coed.div(
            [],
            [],
            [
                coed.button(
                    [coed.on("click", () => Fetch())],
                    [],
                    [(0, import_coed.text)("Fetch text")],
                ),
                viewState(model),
            ],
        );
    }
    var initalModel = PageLoaded();
    function main() {
        console.log("Hydrating...");
        const program2 = coed.program({
            root: "hydration",
            initialModel: initalModel,
            view,
            update,
        });
        const root = document.getElementById("root");
        if (root === null) {
            console.log("Couldn't find root");
            return;
        }
        (0, import_coed.hydrate)(program2, root);
    }
    if (typeof document !== "undefined") {
        main();
    }
})();

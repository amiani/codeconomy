"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNSAFE_setModel = exports.UNSAFE_modelChanged = exports.UNSAFE_internals = void 0;
const core_1 = require("@javelin/core");
const signal_1 = require("../signal");
exports.UNSAFE_internals = {
    schemaIndex: new WeakMap(),
    schemaPools: new Map(),
    model: { [core_1.$flat]: {} },
    worlds: [],
    worldIds: 0,
    currentWorldId: -1,
};
exports.UNSAFE_modelChanged = signal_1.createSignal();
function UNSAFE_setModel(model) {
    ;
    exports.UNSAFE_internals.model = model;
    exports.UNSAFE_modelChanged.dispatch(model);
}
exports.UNSAFE_setModel = UNSAFE_setModel;
//# sourceMappingURL=internals.js.map
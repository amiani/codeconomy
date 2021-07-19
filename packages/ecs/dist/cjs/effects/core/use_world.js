"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWorld = void 0;
const internal_1 = require("../../internal");
function useWorld() {
    return internal_1.UNSAFE_internals.worlds[internal_1.UNSAFE_internals.currentWorldId];
}
exports.useWorld = useWorld;
//# sourceMappingURL=use_world.js.map
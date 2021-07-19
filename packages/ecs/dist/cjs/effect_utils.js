"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImmutableRef = exports.createRef = void 0;
const effect_1 = require("./effect");
const use_ref_1 = require("./effects/core/use_ref");
const createRef = (initializer, options = {}) => effect_1.createEffect(world => {
    const initialValue = initializer(world);
    return () => use_ref_1.useRef(initialValue);
}, options);
exports.createRef = createRef;
function createImmutableRef(initializer, options = {}) {
    return effect_1.createEffect(world => {
        const initialValue = initializer(world);
        return () => use_ref_1.useRef(initialValue).value;
    }, options);
}
exports.createImmutableRef = createImmutableRef;
//# sourceMappingURL=effect_utils.js.map
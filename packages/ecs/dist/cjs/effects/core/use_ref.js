"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRef = void 0;
const effect_1 = require("../../effect");
exports.useRef = effect_1.createEffect(() => {
    let initial = true;
    const api = { value: null };
    return function useRef(initialValue) {
        if (initial) {
            api.value = initialValue;
            initial = false;
        }
        return api;
    };
});
//# sourceMappingURL=use_ref.js.map
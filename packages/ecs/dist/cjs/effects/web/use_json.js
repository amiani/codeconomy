"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useJson = void 0;
const effect_1 = require("../../effect");
const core_1 = require("../core");
const use_request_1 = require("./use_request");
exports.useJson = effect_1.createEffect(() => {
    let response;
    return function useJson(...args) {
        const previousResponse = core_1.useRef(null);
        const result = use_request_1.useRequest(...args);
        if (result.response && result.response !== previousResponse.value) {
            result.response.json().then((json) => {
                response = json;
            });
            previousResponse.value = result.response;
        }
        return { ...result, response: response || null };
    };
});
//# sourceMappingURL=use_json.js.map
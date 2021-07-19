import { createEffect } from "../../effect";
import { useRef } from "../core";
import { useRequest } from "./use_request";
export const useJson = createEffect(() => {
    let response;
    return function useJson(...args) {
        const previousResponse = useRef(null);
        const result = useRequest(...args);
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
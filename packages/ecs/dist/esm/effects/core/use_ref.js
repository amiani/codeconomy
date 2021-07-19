import { createEffect } from "../../effect";
export const useRef = createEffect(() => {
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
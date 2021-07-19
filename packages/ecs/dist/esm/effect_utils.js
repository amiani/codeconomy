import { createEffect } from "./effect";
import { useRef } from "./effects/core/use_ref";
export const createRef = (initializer, options = {}) => createEffect(world => {
    const initialValue = initializer(world);
    return () => useRef(initialValue);
}, options);
export function createImmutableRef(initializer, options = {}) {
    return createEffect(world => {
        const initialValue = initializer(world);
        return () => useRef(initialValue).value;
    }, options);
}
//# sourceMappingURL=effect_utils.js.map
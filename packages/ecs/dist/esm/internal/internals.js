import { $flat } from "@javelin/core";
import { createSignal } from "../signal";
export const UNSAFE_internals = {
    schemaIndex: new WeakMap(),
    schemaPools: new Map(),
    model: { [$flat]: {} },
    worlds: [],
    worldIds: 0,
    currentWorldId: -1,
};
export const UNSAFE_modelChanged = createSignal();
export function UNSAFE_setModel(model) {
    ;
    UNSAFE_internals.model = model;
    UNSAFE_modelChanged.dispatch(model);
}
//# sourceMappingURL=internals.js.map
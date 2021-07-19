import { Model, Schema, StackPool } from "@javelin/core";
import { Component } from "../component";
import { World } from "../world";
export declare type Internals = {
    readonly model: Model;
    readonly schemaIndex: WeakMap<Schema, number>;
    readonly schemaPools: Map<number, StackPool<Component>>;
    readonly worlds: World[];
    worldIds: number;
    currentWorldId: number;
};
export declare const UNSAFE_internals: Internals;
export declare const UNSAFE_modelChanged: import("../signal").Signal<Model<unknown>, void, void, void>;
export declare function UNSAFE_setModel(model: Model): void;
//# sourceMappingURL=internals.d.ts.map
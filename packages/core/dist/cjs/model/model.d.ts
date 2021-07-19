export declare const $kind: unique symbol;
export declare const $flat: unique symbol;
export declare type StringMap<T> = {
    [key: string]: T;
};
export declare enum FieldKind {
    Number = 0,
    String = 1,
    Boolean = 2,
    Array = 3,
    Object = 4,
    Set = 5,
    Map = 6,
    Dynamic = 7
}
export declare type Field = {
    [$kind]: FieldKind;
};
export declare type Schema = {
    [key: string]: Field | Schema;
};
export declare type FieldData<T> = Field & {
    get(t?: T): T;
};
export declare type FieldNumber = FieldData<number> & {
    [$kind]: FieldKind.Number;
};
export declare type FieldString = FieldData<string> & {
    [$kind]: FieldKind.String;
};
export declare type FieldBoolean = FieldData<boolean> & {
    [$kind]: FieldKind.Boolean;
};
export declare type FieldArray<T, P = unknown> = FieldData<T[]> & {
    [$kind]: FieldKind.Array;
    element: Schema | FieldOf<T, P>;
};
export declare type FieldObject<T, P = unknown> = FieldData<StringMap<T>> & {
    [$kind]: FieldKind.Object;
    key: FieldOf<string>;
    element: Schema | FieldOf<T, P>;
};
export declare type FieldSet<T, P = unknown> = FieldData<Set<T>> & {
    [$kind]: FieldKind.Set;
    element: Schema | FieldOf<T, P>;
};
export declare type FieldMap<K, V, P = unknown> = FieldData<Map<K, V>> & {
    [$kind]: FieldKind.Map;
    key: FieldOf<K>;
    element: Schema | FieldOf<V, P>;
};
export declare type FieldDynamic<T> = FieldData<T> & {
    [$kind]: FieldKind.Dynamic;
};
export declare type FieldOf<T, P = unknown> = T extends number ? FieldNumber & P : T extends string ? FieldString & P : T extends boolean ? FieldBoolean & P : T extends (infer _)[] ? FieldArray<_, P> : T extends StringMap<infer _> ? FieldObject<_, P> : T extends Set<infer _> ? FieldSet<_, P> : T extends Map<infer K, infer V> ? FieldMap<K, V, P> : FieldData<T>;
export declare type FieldGet<T extends Field> = T extends FieldNumber ? number : T extends FieldString ? string : T extends FieldBoolean ? boolean : T extends FieldArray<infer _> ? _[] : T extends FieldObject<infer _> ? StringMap<_> : T extends FieldSet<infer _> ? Set<_> : T extends FieldMap<infer K, infer V> ? Map<K, V> : T extends FieldDynamic<infer _> ? _ : unknown;
export declare type FieldExtract<T> = T extends Field ? FieldGet<T> : T extends Schema ? {
    [K in keyof T]: FieldExtract<T[K]>;
} : never;
export declare type FieldPrimitive<P = unknown> = P & (FieldNumber | FieldString | FieldBoolean | FieldDynamic<unknown>);
export declare type FieldComplex<P = unknown> = FieldArray<unknown, P> | FieldObject<unknown, P> | FieldSet<unknown, P> | FieldMap<unknown, unknown, P>;
export declare type FieldAny = FieldPrimitive | FieldComplex;
export declare type CollatedNodeBase = {
    id: number;
    hi: number;
    lo: number;
    deep: boolean;
    traverse: (FieldString | FieldNumber)[];
};
export declare type CollatedNodeSchema<P = unknown> = CollatedNodeBase & {
    keys: string[];
    keysByFieldId: string[];
    fields: CollatedNode<P>[];
    fieldsByKey: {
        [key: string]: CollatedNode<P>;
    };
    fieldIdsByKey: {
        [key: string]: number;
    };
};
export declare type CollatedNodeField<P> = (FieldComplex<P> | FieldPrimitive<P>) & CollatedNodeBase;
export declare type CollatedNodeFieldComplex<P = unknown> = FieldComplex<P> & CollatedNodeBase;
export declare type CollatedNode<P = unknown> = CollatedNodeSchema<P> | CollatedNodeField<P>;
export declare type ModelFlat<P = unknown> = {
    [key: number]: {
        [f: number]: CollatedNode<P>;
    };
};
export declare type Model<P = unknown> = {
    [$flat]: ModelFlat<P>;
    [key: number]: CollatedNode<P>;
};
//# sourceMappingURL=model.d.ts.map
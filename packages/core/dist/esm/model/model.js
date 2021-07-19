export const $kind = Symbol("javelin_field_kind");
export const $flat = Symbol("javelin_model_flat");
export var FieldKind;
(function (FieldKind) {
    FieldKind[FieldKind["Number"] = 0] = "Number";
    FieldKind[FieldKind["String"] = 1] = "String";
    FieldKind[FieldKind["Boolean"] = 2] = "Boolean";
    FieldKind[FieldKind["Array"] = 3] = "Array";
    FieldKind[FieldKind["Object"] = 4] = "Object";
    FieldKind[FieldKind["Set"] = 5] = "Set";
    FieldKind[FieldKind["Map"] = 6] = "Map";
    FieldKind[FieldKind["Dynamic"] = 7] = "Dynamic";
})(FieldKind || (FieldKind = {}));
//# sourceMappingURL=model.js.map
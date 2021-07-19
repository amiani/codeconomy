"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldKind = exports.$flat = exports.$kind = void 0;
exports.$kind = Symbol("javelin_field_kind");
exports.$flat = Symbol("javelin_model_flat");
var FieldKind;
(function (FieldKind) {
    FieldKind[FieldKind["Number"] = 0] = "Number";
    FieldKind[FieldKind["String"] = 1] = "String";
    FieldKind[FieldKind["Boolean"] = 2] = "Boolean";
    FieldKind[FieldKind["Array"] = 3] = "Array";
    FieldKind[FieldKind["Object"] = 4] = "Object";
    FieldKind[FieldKind["Set"] = 5] = "Set";
    FieldKind[FieldKind["Map"] = 6] = "Map";
    FieldKind[FieldKind["Dynamic"] = 7] = "Dynamic";
})(FieldKind = exports.FieldKind || (exports.FieldKind = {}));
//# sourceMappingURL=model.js.map
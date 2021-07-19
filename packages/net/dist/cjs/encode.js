"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = void 0;
const Pack = __importStar(require("@javelin/pack"));
const message_op_1 = require("./message_op");
function encodePart(dataView, part, cursor) {
    Pack.write(dataView, Pack.uint8, cursor, part.kind);
    Pack.write(dataView, Pack.uint32, cursor, part.byteLength);
    for (let i = 0; i < part.ops.length; i++) {
        const { data, view } = part.ops[i];
        for (let j = 0; j < data.length; j++) {
            const d = data[j];
            const v = view[j];
            if (v === message_op_1.$buffer) {
                const byteLength = d.byteLength;
                new Uint8Array(dataView.buffer, 0, dataView.buffer.byteLength).set(new Uint8Array(d), cursor.offset);
                cursor.offset += byteLength;
            }
            else {
                Pack.write(dataView, v, cursor, d);
            }
        }
    }
}
function encode(message) {
    const buffer = new ArrayBuffer(message.byteLength);
    const view = new DataView(buffer);
    const cursor = { offset: 0 };
    // message.parts is sparse so we use forEach to skip empty elements
    message.parts.forEach(part => encodePart(view, part, cursor));
    return buffer;
}
exports.encode = encode;
//# sourceMappingURL=encode.js.map
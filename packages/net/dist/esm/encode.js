import * as Pack from "@javelin/pack";
import { $buffer } from "./message_op";
function encodePart(dataView, part, cursor) {
    Pack.write(dataView, Pack.uint8, cursor, part.kind);
    Pack.write(dataView, Pack.uint32, cursor, part.byteLength);
    for (let i = 0; i < part.ops.length; i++) {
        const { data, view } = part.ops[i];
        for (let j = 0; j < data.length; j++) {
            const d = data[j];
            const v = view[j];
            if (v === $buffer) {
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
export function encode(message) {
    const buffer = new ArrayBuffer(message.byteLength);
    const view = new DataView(buffer);
    const cursor = { offset: 0 };
    // message.parts is sparse so we use forEach to skip empty elements
    message.parts.forEach(part => encodePart(view, part, cursor));
    return buffer;
}
//# sourceMappingURL=encode.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPatch = exports.createPatch = exports.getFieldValue = exports.clearObservedChanges = exports.observe = exports.$delete = exports.$changes = exports.$touched = exports.$self = void 0;
const core_1 = require("@javelin/core");
const internal_1 = require("./internal");
exports.$self = Symbol("javelin_proxy_self");
exports.$touched = Symbol("javelin_proxy_touched");
exports.$changes = Symbol("javelin_proxy_changes");
exports.$delete = Symbol("javelin_proxy_deleted");
const proxies = new WeakMap();
const simpleStructHandler = {
    get(target, key) {
        if (key === exports.$self)
            return target;
        target[exports.$touched] = true;
        return target[key];
    },
    set(target, key, value) {
        const changes = target[exports.$changes];
        target[key] = value;
        target[exports.$touched] = true;
        changes.changes[key] = value;
        changes.dirty = true;
        return true;
    },
};
const structHandler = {
    get(target, key) {
        if (key === exports.$self)
            return target;
        const value = target[key];
        target[exports.$touched] = true;
        if (typeof value === "object" && value !== null) {
            return proxify(value, target, key);
        }
        return value;
    },
    set: simpleStructHandler.set,
};
const simpleArrayHandler = simpleStructHandler;
const arrayHandler = {
    get: structHandler.get,
    set: simpleArrayHandler.set,
};
const simpleObjectHandler = {
    ...simpleStructHandler,
    deleteProperty(target, key) {
        const changes = target[exports.$changes];
        delete target[key];
        target[exports.$touched] = true;
        changes.changes[key] = exports.$delete;
        changes.dirty = true;
        return true;
    },
};
const objectHandler = {
    ...structHandler,
    deleteProperty: simpleObjectHandler.deleteProperty,
};
const setHandler = {
    get(target, key) {
        if (key === exports.$self)
            return target;
        const value = target[key];
        target[exports.$touched] = true;
        return typeof value === "function"
            ? new Proxy(value, setMethodHandler)
            : value;
    },
};
const setMethodHandler = {
    apply(method, target, args) {
        const { [exports.$self]: self, [exports.$changes]: changes } = target;
        target[exports.$touched] = true;
        switch (method) {
            case Set.prototype.add:
                changes.changes.add.push(args[0]);
                changes.dirty = true;
                break;
            case Set.prototype.delete:
                changes.changes.delete.push(args[0]);
                changes.dirty = true;
                break;
            case Set.prototype.clear:
                self.forEach(value => changes.changes.delete.push(value));
                changes.dirty = true;
                break;
        }
        return method.apply(self, args);
    },
};
const mapHandler = {
    get(target, key, receiver) {
        if (key === exports.$self)
            return target;
        const value = Reflect.get(target, key, receiver);
        target[exports.$touched] = true;
        return typeof value === "function"
            ? new Proxy(value, mapMethodHandler)
            : value;
    },
};
const mapMethodHandler = {
    apply(method, target, args) {
        const { [exports.$self]: self } = target;
        const { [exports.$changes]: changes } = self;
        self[exports.$touched] = true;
        switch (method) {
            case Map.prototype.get: {
                const value = method.apply(self, args);
                if (typeof value === "object" && value !== null) {
                    return proxify(value, self, args[0]);
                }
            }
            case Map.prototype.set:
                changes.changes.set(args[0], args[1]);
                changes.dirty = true;
                break;
            case Map.prototype.delete:
                changes.changes.set(args[0], exports.$delete);
                changes.dirty = true;
                break;
            case Map.prototype.clear:
                self.forEach((_, key) => changes.changes.set(key, exports.$delete));
                changes.dirty = true;
                return self.clear();
        }
        return method.apply(self, args);
    },
};
function getHandler(node) {
    const simple = core_1.isSimple(node);
    if (core_1.isField(node)) {
        switch (node[core_1.$kind]) {
            case core_1.FieldKind.Array:
                return simple ? simpleArrayHandler : arrayHandler;
            case core_1.FieldKind.Object:
                return simple ? simpleObjectHandler : objectHandler;
            case core_1.FieldKind.Set:
                return setHandler;
            case core_1.FieldKind.Map:
                return mapHandler;
            default:
                throw new Error("Failed to observe object: cannot observe a primitive type");
        }
    }
    return simple ? simpleStructHandler : structHandler;
}
function getChanges(node) {
    const base = { dirty: false, node };
    if (core_1.isField(node)) {
        switch (node[core_1.$kind]) {
            case core_1.FieldKind.Array:
                return { ...base, changes: {} };
            case core_1.FieldKind.Object:
                return { ...base, changes: {} };
            case core_1.FieldKind.Set:
                return { ...base, changes: { add: [], delete: [] } };
            case core_1.FieldKind.Map:
                return { ...base, changes: new Map() };
        }
    }
    return { ...base, changes: {} };
}
const descriptorBase = {
    configurable: false,
    enumerable: true,
    writable: false,
};
function register(object, node) {
    const changes = getChanges(node);
    const observed = Object.defineProperties(object, {
        [exports.$self]: { ...descriptorBase, value: object },
        [exports.$changes]: { ...descriptorBase, value: changes },
    });
    const handler = getHandler(node);
    const proxy = new Proxy(observed, handler);
    proxies.set(object, proxy);
    return proxy;
}
function proxify(object, parent, key) {
    const parentNode = parent[exports.$changes].node;
    let node;
    if (core_1.isSchema(parentNode)) {
        node = parentNode.fieldsByKey[key];
    }
    else {
        core_1.assert("element" in parentNode);
        node = parentNode.element;
    }
    return proxies.get(object) ?? register(object, node);
}
function observe(component) {
    ;
    component[exports.$touched] = true;
    return (proxies.get(component) ??
        register(component, internal_1.UNSAFE_internals.model[component.__type__]));
}
exports.observe = observe;
function clearObservedChangesInner(object, node) {
    if (object[exports.$touched] !== true) {
        return;
    }
    const changes = object[exports.$changes];
    if (core_1.isSchema(node)) {
        for (const prop in changes.changes) {
            delete changes.changes[prop];
        }
        for (let i = 0; i < node.fields.length; i++) {
            clearObservedChangesInner(object[node.keys[i]], node.fields[i]);
        }
    }
    else if ("element" in node) {
        const element = node.element;
        switch (node[core_1.$kind]) {
            case core_1.FieldKind.Array: {
                for (const prop in changes.changes) {
                    delete changes.changes[prop];
                }
                for (let i = 0; i < object.length; i++) {
                    clearObservedChangesInner(object[i], element);
                }
                break;
            }
            case core_1.FieldKind.Object: {
                for (const prop in changes.changes) {
                    delete changes.changes[prop];
                }
                for (const prop in object) {
                    clearObservedChangesInner(object[prop], element);
                }
                break;
            }
            case core_1.FieldKind.Set: {
                core_1.mutableEmpty(changes.changes.add);
                core_1.mutableEmpty(changes.changes.delete);
                break;
            }
            case core_1.FieldKind.Map: {
                ;
                changes.changes.clear();
                object.forEach(value => clearObservedChangesInner(value, element));
                break;
            }
        }
    }
    changes.dirty = false;
    object[exports.$touched] = false;
}
function clearObservedChanges(component) {
    const self = exports.$self in component ? component[exports.$self] : component;
    const node = internal_1.UNSAFE_internals.model[self.__type__];
    return clearObservedChangesInner(self, node);
}
exports.clearObservedChanges = clearObservedChanges;
function getFieldValue(node, object, fieldId, traverse) {
    let t = 0;
    let key = null;
    let ref = object;
    outer: while (node.id !== fieldId) {
        if (core_1.isField(node)) {
            core_1.assert("element" in node);
            key = traverse[t++];
            switch (node[core_1.$kind]) {
                case core_1.FieldKind.Array:
                case core_1.FieldKind.Object:
                    ref = ref[key];
                    break;
                case core_1.FieldKind.Map:
                    ref = ref.get(key);
                    break;
                default:
                    throw new Error("Failed to apply change: invalid target field");
            }
            node = node.element;
        }
        else {
            for (let i = 0; i < node.fields.length; i++) {
                const child = node.fields[i];
                if (child.lo <= fieldId && child.hi >= fieldId) {
                    key = node.keys[i];
                    node = child;
                    if (node.id !== fieldId) {
                        ref = ref[key];
                    }
                    continue outer;
                }
            }
        }
    }
    return ref;
}
exports.getFieldValue = getFieldValue;
function createPatchInner(object, patch = { changes: new Map(), children: new Map() }) {
    const self = object[exports.$self];
    const { [exports.$changes]: { node, changes }, } = self;
    const simple = core_1.isSimple(node);
    if (core_1.isSchema(node)) {
        if (simple) {
            for (let i = 0; i < node.fields.length; i++) {
                const key = node.keys[i];
                if (key in changes)
                    patch.changes.set(key, self[key]);
            }
        }
        else {
            for (let i = 0; i < node.fields.length; i++) {
                const key = node.keys[i];
                const value = self[key];
                if (key in changes)
                    patch.changes.set(key, value);
                if (value[exports.$touched]) {
                    patch.children.set(key, createPatchInner(value, patch.children.get(key)));
                }
            }
        }
    }
    else if ("element" in node) {
        switch (node[core_1.$kind]) {
            case core_1.FieldKind.Array:
                if (simple) {
                    for (let i = 0; i < self.length; i++) {
                        if (i in changes)
                            patch.changes.set(i, self[i]);
                    }
                }
                else {
                    for (let i = 0; i < self.length; i++) {
                        const value = self[i];
                        if (i in changes)
                            patch.changes.set(i, value);
                        if (value[exports.$touched])
                            patch.children.set(i, createPatchInner(value, patch.children.get(i)));
                    }
                }
                break;
            case core_1.FieldKind.Map:
                if (simple) {
                    ;
                    changes.forEach((value, key) => patch.changes.set(key, value));
                }
                else {
                    ;
                    self.forEach((value, key) => {
                        if (changes.has(key)) {
                            patch.changes.set(key, value);
                            if (value[exports.$touched])
                                patch.children.set(key, createPatchInner(value, patch.children.get(key)));
                        }
                    });
                }
                break;
        }
    }
    return patch;
}
function createPatch(component, patch = {
    schemaId: component.__type__,
    children: new Map(),
    changes: new Map(),
}) {
    if (exports.$changes in component) {
        createPatchInner(component, patch);
    }
    return patch;
}
exports.createPatch = createPatch;
function resetPatch(patch) {
    patch.changes.clear();
    patch.children.clear();
}
exports.resetPatch = resetPatch;
//# sourceMappingURL=observe.js.map
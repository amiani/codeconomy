import { $kind, assert, FieldKind, isField, isSchema, isSimple, mutableEmpty, } from "@javelin/core";
import { UNSAFE_internals } from "./internal";
export const $self = Symbol("javelin_proxy_self");
export const $touched = Symbol("javelin_proxy_touched");
export const $changes = Symbol("javelin_proxy_changes");
export const $delete = Symbol("javelin_proxy_deleted");
const proxies = new WeakMap();
const simpleStructHandler = {
    get(target, key) {
        if (key === $self)
            return target;
        target[$touched] = true;
        return target[key];
    },
    set(target, key, value) {
        const changes = target[$changes];
        target[key] = value;
        target[$touched] = true;
        changes.changes[key] = value;
        changes.dirty = true;
        return true;
    },
};
const structHandler = {
    get(target, key) {
        if (key === $self)
            return target;
        const value = target[key];
        target[$touched] = true;
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
        const changes = target[$changes];
        delete target[key];
        target[$touched] = true;
        changes.changes[key] = $delete;
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
        if (key === $self)
            return target;
        const value = target[key];
        target[$touched] = true;
        return typeof value === "function"
            ? new Proxy(value, setMethodHandler)
            : value;
    },
};
const setMethodHandler = {
    apply(method, target, args) {
        const { [$self]: self, [$changes]: changes } = target;
        target[$touched] = true;
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
        if (key === $self)
            return target;
        const value = Reflect.get(target, key, receiver);
        target[$touched] = true;
        return typeof value === "function"
            ? new Proxy(value, mapMethodHandler)
            : value;
    },
};
const mapMethodHandler = {
    apply(method, target, args) {
        const { [$self]: self } = target;
        const { [$changes]: changes } = self;
        self[$touched] = true;
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
                changes.changes.set(args[0], $delete);
                changes.dirty = true;
                break;
            case Map.prototype.clear:
                self.forEach((_, key) => changes.changes.set(key, $delete));
                changes.dirty = true;
                return self.clear();
        }
        return method.apply(self, args);
    },
};
function getHandler(node) {
    const simple = isSimple(node);
    if (isField(node)) {
        switch (node[$kind]) {
            case FieldKind.Array:
                return simple ? simpleArrayHandler : arrayHandler;
            case FieldKind.Object:
                return simple ? simpleObjectHandler : objectHandler;
            case FieldKind.Set:
                return setHandler;
            case FieldKind.Map:
                return mapHandler;
            default:
                throw new Error("Failed to observe object: cannot observe a primitive type");
        }
    }
    return simple ? simpleStructHandler : structHandler;
}
function getChanges(node) {
    const base = { dirty: false, node };
    if (isField(node)) {
        switch (node[$kind]) {
            case FieldKind.Array:
                return { ...base, changes: {} };
            case FieldKind.Object:
                return { ...base, changes: {} };
            case FieldKind.Set:
                return { ...base, changes: { add: [], delete: [] } };
            case FieldKind.Map:
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
        [$self]: { ...descriptorBase, value: object },
        [$changes]: { ...descriptorBase, value: changes },
    });
    const handler = getHandler(node);
    const proxy = new Proxy(observed, handler);
    proxies.set(object, proxy);
    return proxy;
}
function proxify(object, parent, key) {
    const parentNode = parent[$changes].node;
    let node;
    if (isSchema(parentNode)) {
        node = parentNode.fieldsByKey[key];
    }
    else {
        assert("element" in parentNode);
        node = parentNode.element;
    }
    return proxies.get(object) ?? register(object, node);
}
export function observe(component) {
    ;
    component[$touched] = true;
    return (proxies.get(component) ??
        register(component, UNSAFE_internals.model[component.__type__]));
}
function clearObservedChangesInner(object, node) {
    if (object[$touched] !== true) {
        return;
    }
    const changes = object[$changes];
    if (isSchema(node)) {
        for (const prop in changes.changes) {
            delete changes.changes[prop];
        }
        for (let i = 0; i < node.fields.length; i++) {
            clearObservedChangesInner(object[node.keys[i]], node.fields[i]);
        }
    }
    else if ("element" in node) {
        const element = node.element;
        switch (node[$kind]) {
            case FieldKind.Array: {
                for (const prop in changes.changes) {
                    delete changes.changes[prop];
                }
                for (let i = 0; i < object.length; i++) {
                    clearObservedChangesInner(object[i], element);
                }
                break;
            }
            case FieldKind.Object: {
                for (const prop in changes.changes) {
                    delete changes.changes[prop];
                }
                for (const prop in object) {
                    clearObservedChangesInner(object[prop], element);
                }
                break;
            }
            case FieldKind.Set: {
                mutableEmpty(changes.changes.add);
                mutableEmpty(changes.changes.delete);
                break;
            }
            case FieldKind.Map: {
                ;
                changes.changes.clear();
                object.forEach(value => clearObservedChangesInner(value, element));
                break;
            }
        }
    }
    changes.dirty = false;
    object[$touched] = false;
}
export function clearObservedChanges(component) {
    const self = $self in component ? component[$self] : component;
    const node = UNSAFE_internals.model[self.__type__];
    return clearObservedChangesInner(self, node);
}
export function getFieldValue(node, object, fieldId, traverse) {
    let t = 0;
    let key = null;
    let ref = object;
    outer: while (node.id !== fieldId) {
        if (isField(node)) {
            assert("element" in node);
            key = traverse[t++];
            switch (node[$kind]) {
                case FieldKind.Array:
                case FieldKind.Object:
                    ref = ref[key];
                    break;
                case FieldKind.Map:
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
function createPatchInner(object, patch = { changes: new Map(), children: new Map() }) {
    const self = object[$self];
    const { [$changes]: { node, changes }, } = self;
    const simple = isSimple(node);
    if (isSchema(node)) {
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
                if (value[$touched]) {
                    patch.children.set(key, createPatchInner(value, patch.children.get(key)));
                }
            }
        }
    }
    else if ("element" in node) {
        switch (node[$kind]) {
            case FieldKind.Array:
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
                        if (value[$touched])
                            patch.children.set(i, createPatchInner(value, patch.children.get(i)));
                    }
                }
                break;
            case FieldKind.Map:
                if (simple) {
                    ;
                    changes.forEach((value, key) => patch.changes.set(key, value));
                }
                else {
                    ;
                    self.forEach((value, key) => {
                        if (changes.has(key)) {
                            patch.changes.set(key, value);
                            if (value[$touched])
                                patch.children.set(key, createPatchInner(value, patch.children.get(key)));
                        }
                    });
                }
                break;
        }
    }
    return patch;
}
export function createPatch(component, patch = {
    schemaId: component.__type__,
    children: new Map(),
    changes: new Map(),
}) {
    if ($changes in component) {
        createPatchInner(component, patch);
    }
    return patch;
}
export function resetPatch(patch) {
    patch.changes.clear();
    patch.children.clear();
}
//# sourceMappingURL=observe.js.map
import { Entity } from "../../entity";
import { Query, Selector, SelectorResult, SelectorResultSparse } from "../../query";
declare type MonitorCallback<S extends Selector> = (entity: Entity, results: SelectorResult<S>, diff: SelectorResultSparse<S>) => unknown;
/**
 * Detect when an entity begins matching or stops matching a query.
 *
 * The `onEnter` callback is executed when an entity begins matching the query,
 * while the `onExit` callback is executed when an entity no longer matches the
 * query. Either callback is executed with subject entity and a diff that
 * contains components that were either attached or detached to trigger the
 * transition.
 *
 * The diff of components is an array that matches the signature of a
 * query result. The value of the index of a component type which did not
 * change is null. The indices corresponding to components that did change hold
 * a reference to the component.
 *
 * Detached component references are already reset by the time the `onExit`
 * callback is invoked.
 *
 * @param query
 * @example
 * useMonitor(
 *   bodies,
 *   (e, results) => console.log(`${e} matches bodies`),
 *   (e, results) => console.log(`${e} no longer matches bodies`),
 * )
 *
 * @example
 * useMonitor(
 *   bodies,
 *   (e, [t]) => t && console.log(`transform was attached to ${e}`),
 *   (e, [t]) => t && console.log(`transform was detached from ${e}`),
 * )
 */
export declare const useMonitor: <S extends Selector>(query: Query<S>, onEnter?: MonitorCallback<S> | undefined, onExit?: MonitorCallback<S> | undefined) => void;
export {};
//# sourceMappingURL=use_monitor.d.ts.map
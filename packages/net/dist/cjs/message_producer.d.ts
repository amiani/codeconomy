import { Component, Entity } from "@javelin/ecs";
import * as Message from "./message";
export declare type MessageProducer = {
    /**
     * Increase the likelihood the specified entity will be included in the next
     * message by some factor.
     */
    amplify(entity: Entity, priority: number): void;
    /**
     * Enqueue an attach operation.
     */
    attach(entity: Entity, components: Component[]): void;
    /**
     * Enqueue an update (component data) operation.
     */
    update(entity: Entity, components: Component[], amplify?: number): void;
    /**
     * Enqueue a patch operation.
     */
    patch(entity: Entity, component: Component, amplify?: number): void;
    /**
     * Enqueue a detach operation.
     */
    detach(entity: Entity, components: Component[]): void;
    /**
     * Enqueue a destroy operation.
     */
    destroy(entity: Entity): void;
    /**
     * Dequeue a message.
     */
    take(includeModel?: boolean): Message.Message | null;
};
export declare type MessageProducerOptions = {
    maxByteLength?: number;
};
export declare function createMessageProducer(options?: MessageProducerOptions): MessageProducer;
//# sourceMappingURL=message_producer.d.ts.map
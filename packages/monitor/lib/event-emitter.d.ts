export type EmitterFunction = (...args: any[]) => void;
declare class EventEmitter {
    private events;
    constructor();
    on(event: string, listener: EmitterFunction): void;
    emit(event: string, ...args: any[]): any[];
    off(event: string, listener: EmitterFunction): void;
    once(event: string, listener: EmitterFunction): void;
    removeListener(event: string, listener: EmitterFunction): void;
    removeAllListeners(event?: string): void;
    listenerCount(event: string): number;
    eventNames(): string[];
    rawListeners(event: string): EmitterFunction[];
    listeners(event: string): EmitterFunction[];
    prependListener(event: string, listener: EmitterFunction): void;
    prependOnceListener(event: string, listener: EmitterFunction): void;
}
export default EventEmitter;

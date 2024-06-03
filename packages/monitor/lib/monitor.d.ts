import { EmitterFunction } from './event-emitter';
import { MonitorData, MonitorOptions } from './types';
export declare class Monitor {
    private ee;
    private logger;
    private options;
    private onLoadListener;
    private listeners;
    constructor(options: MonitorOptions);
    static init(options: MonitorOptions): Monitor;
    addListener(event: string, listener: EmitterFunction): void;
    removeListener(event: string): void;
    dispatchEvent(event: string, data: MonitorData): void;
    private initLoadListener;
    private initBasic;
    private initPerformance;
}

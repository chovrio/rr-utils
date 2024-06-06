import { STATE_ACTIVE, STATE_EXIT, STATE_INACTIVE, STATE_INVISIBLE, STATE_VISIBLE } from './const';
import { MonitorElementOptions } from './types';
export type MARK_STATE = typeof STATE_VISIBLE | typeof STATE_INVISIBLE | typeof STATE_ACTIVE | typeof STATE_INACTIVE | typeof STATE_EXIT;
declare class MonitorElement {
    private readonly key;
    private readonly name;
    private readonly node;
    private readonly config;
    private observer?;
    private isActive;
    private isVisible;
    private enterTime;
    private leaveTime;
    private lastVisibleTime;
    private lastInVisibleTime;
    private visibleDuration;
    private enterActiveTime;
    private leaveActiveTime;
    private lastActiveTime;
    private lastInActiveTime;
    private activeDuration;
    private ratio;
    private activeTimer?;
    private visibleTimer?;
    constructor(options: MonitorElementOptions);
    start(): void;
    exit(): {
        enterTime: number;
        leaveTime: number;
        visibleDuration: number;
        enterActiveTime: number;
        leaveActiveTime: number;
        activeDuration: number;
    };
    mark(state: MARK_STATE, time?: number): void;
    checkStatus(lazy: boolean): void;
    checkVisibility(): boolean | undefined;
    setVisibleState(visible: boolean, lazy: boolean): {
        enterTime: number;
        leaveTime: number;
        visibleDuration: number;
        enterActiveTime: number;
        leaveActiveTime: number;
        activeDuration: number;
    };
    onVisible(lazy: boolean): {
        enterTime: number;
        leaveTime: number;
        visibleDuration: number;
        enterActiveTime: number;
        leaveActiveTime: number;
        activeDuration: number;
    };
    onInvisible(lazy: boolean): {
        enterTime: number;
        leaveTime: number;
        visibleDuration: number;
        enterActiveTime: number;
        leaveActiveTime: number;
        activeDuration: number;
    };
    onActive(): {
        enterTime: number;
        leaveTime: number;
        visibleDuration: number;
        enterActiveTime: number;
        leaveActiveTime: number;
        activeDuration: number;
    } | undefined;
    onInActive(): {
        enterTime: number;
        leaveTime: number;
        visibleDuration: number;
        enterActiveTime: number;
        leaveActiveTime: number;
        activeDuration: number;
    } | undefined;
    private startVisibleTimer;
    private startActiveTimer;
    private clearLazyVisibleTimer;
    private clearLazyActiveTimer;
    get report(): {
        enterTime: number;
        leaveTime: number;
        visibleDuration: number;
        enterActiveTime: number;
        leaveActiveTime: number;
        activeDuration: number;
    };
}
export default MonitorElement;

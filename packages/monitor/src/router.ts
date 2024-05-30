import EventEmitter from './event-emitter';
import { TriggerOn } from './types';

export class Router {
  private ee: EventEmitter;
  private triggerOn: TriggerOn;
  constructor(triggerOn: TriggerOn) {
    if (!window) {
      throw new Error('Router can only be used in browser environment');
    }
    this.ee = new EventEmitter();
    this.triggerOn = triggerOn;
    if (triggerOn === TriggerOn.both) {
      this.initHashChange();
      this.initHistoryChange();
    } else if (triggerOn === TriggerOn.hash) {
      this.initHashChange();
    } else if (triggerOn === TriggerOn.history) {
      this.initHistoryChange();
    }
  }
  private initHashChange() {
    window.addEventListener('hashchange', () => {
      this.ee.emit('hashchange', window.location.hash);
    });
  }
  private initHistoryChange() {
    window.addEventListener('popstate', () => {
      this.ee.emit('popstate', window.location.pathname);
    });
  }
}

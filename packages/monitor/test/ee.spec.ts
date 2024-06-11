import EventEmitter from '../src/event-emitter';
import { beforeEach, describe, expect, it, Mock, vitest } from 'vitest';

describe('EventEmitter', () => {
	let emitter: EventEmitter;
	let callback: Mock;

	beforeEach(() => {
		emitter = new EventEmitter();
		callback = vitest.fn();
	});

	it('should add event listeners', () => {
		emitter.on('test', callback);
		expect(emitter.listenerCount('test')).toBe(1);
	});

	it('should call event listeners when event is emitted', () => {
		emitter.on('test', callback);
		emitter.emit('test');
		expect(callback).toHaveBeenCalled();
	});

	it('should remove event listeners', () => {
		emitter.on('test', callback);
		emitter.off('test', callback);
		emitter.emit('test');
		expect(callback).not.toHaveBeenCalled();
	});

	it('should only call listener once when using once()', () => {
		emitter.once('test', callback);
		emitter.emit('test');
		emitter.emit('test');
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should get event names', () => {
		emitter.on('test', callback);
		emitter.on('test2', callback);
		expect(emitter.eventNames()).toEqual(expect.arrayContaining(['test', 'test2']));
	});

	it('should get listeners for an event', () => {
		emitter.on('test', callback);
		expect(emitter.listeners('test')).toEqual(expect.arrayContaining([callback]));
	});

	it('should remove all listeners for an event', () => {
		emitter.on('test', callback);
		emitter.removeAllListeners('test');
		expect(emitter.listenerCount('test')).toBe(0);
	});

	it('should remove specific listener for an event', () => {
		emitter.on('test', callback);
		emitter.removeListener('test', callback);
		expect(emitter.listenerCount('test')).toBe(0);
	});

	it('should prepend a listener for an event', () => {
		const anotherCallback = vitest.fn();
		emitter.on('test', callback);
		emitter.prependListener('test', anotherCallback);
		expect(emitter.rawListeners('test')[0]).toBe(anotherCallback);
	});

	it('should prepend a once listener for an event', () => {
		const anotherCallback = vitest.fn();
		emitter.on('test', callback);
		emitter.prependOnceListener('test', anotherCallback);
		emitter.emit('test');
		expect(anotherCallback).toHaveBeenCalled();
		expect(emitter.listenerCount('test')).toBe(1); // only the first callback remains
	});
});

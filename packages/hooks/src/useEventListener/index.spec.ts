import { renderHook } from '@testing-library/react';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import useEventListener from '.';
import { JSDOM } from 'jsdom';
const jsdom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const { window } = jsdom;
global.document = window.document;
(global.window as any) = window;

describe('useEventListener', () => {
	it('should be defined', () => {
		expect(useEventListener).toBeDefined();
	});
	let container: HTMLDivElement;
	let containerRef: { current: any };
	beforeEach(() => {
		// 创建一个 div
		container = document.createElement('div');
		document.body.appendChild(container);
	});
	beforeEach(() => {
		containerRef = {
			current: {}
		};
	});
	it('测试监听点事件', async () => {
		let count: number = 0;
		const onClick = () => {
			count++;
		};
		const { rerender, unmount } = renderHook(() => {
			useEventListener('click', onClick, container);
		});
		document.body.click(); // 点击 document 应该无效
		expect(count).toEqual(0);
		container.click(); // 点击 container count + 1
		expect(count).toEqual(1);
		rerender(); // 重新渲染
		container.click(); // 点击 container count + 1
		expect(count).toEqual(2);
		unmount(); // 卸载
		container.click(); // 点击 container count 不变
		expect(count).toEqual(2);
	});
	it('测试监听点击事件--Ref', async () => {
		let count: number = 0;
		const onClick = () => {
			count++;
		};
		renderHook(() => useEventListener('click', onClick, containerRef));

		document.body.click();
		expect(count).toEqual(0);
	});

	afterEach(() => {
		// 卸载
		document.body.removeChild(container);
	});
});

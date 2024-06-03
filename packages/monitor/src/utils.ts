import { containerElements } from './const';
import { Timeout } from './types';

/**
 * debounce function from ts-debounce
 * @see https://github.com/chodorowicz/ts-debounce
 */
export type Procedure = (...args: any[]) => void;

export interface Options {
  isImmediate: boolean;
}

export interface DebouncedFunction<F extends Procedure> {
  (this: ThisParameterType<F>, ...args: Parameters<F>): void;
  cancel: () => void;
}

export function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds = 50,
  options: Options = {
    isImmediate: false,
  },
) {
  let timeoutId: Timeout | undefined;
  const debouncedFunction = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;

    const doLater = function () {
      timeoutId = undefined;
      if (!options.isImmediate) {
        func.apply(context, args);
      }
    };

    const shouldCallNow = options.isImmediate && timeoutId === undefined;

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(doLater, waitMilliseconds);

    if (shouldCallNow) {
      func.apply(context, args);
    }
  };

  debouncedFunction.cancel = function () {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  };

  return debouncedFunction;
}

/**
 * 获取当前设备的一些基本信息拼接而成的字符串
 * 后续将用于生成唯一标识
 */
export function getDeviceInfo() {
  return [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency,
    screen.width,
    screen.height,
    screen.colorDepth,
  ].join(' ');
}

// SHA-256 哈希生成函数
export async function sha256(message: string) {
  // 将字符串转换为 Uint8Array
  const msgBuffer = new TextEncoder().encode(message);
  // 计算哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // 将 ArrayBuffer 转换为字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// 生成唯一标识
export async function generateUniqueId() {
  const deviceInfo = getDeviceInfo();
  const deviceId = await sha256(deviceInfo);
  return deviceId;
}

/**
 * 对 load 事件做特殊处理避免在一些特殊情况 load 事件不触发
 * 比如微前端子应用、骨架屏
 * @param isSkeleton 是否是骨架屏项目
 * @param callback   回调函数
 */
export function onLoad(callback: () => void) {
  if (document.readyState === 'complete') {
    callback();
  } else {
    window.addEventListener('load', callback);
  }
}

/**
 * 获取选择器名
 * @param element dom元素
 * @returns 选择器名
 */
export function getSelector(element: Element) {
  if (element.id) {
    return `#${element.id}`;
  } else if (element.className) {
    return `.${element.className
      .split(' ')
      .filter(item => !!item)
      .join('.')}`;
  } else {
    return element.tagName.toLowerCase();
  }
}

/**
 * 判断是否为容器节点
 * @param element dom元素
 */
export function isContainer(element: Element) {
  const selector = getSelector(element);
  if (containerElements.indexOf(selector) > -1) {
    return true;
  }
  return false;
}

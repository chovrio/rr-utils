import { PageUniqKey, containerElements } from './const';
import { QueryObj } from './types';

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
  let timeoutId: number | undefined;
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
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(doLater, waitMilliseconds);

    if (shouldCallNow) {
      func.apply(context, args);
    }
  };

  debouncedFunction.cancel = function () {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
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

/**
 * 解析 URL query
 * @param queryStr query 字符串
 */
export function parseQueryObject(queryStr: string) {
  const result: QueryObj = {};
  queryStr &&
    queryStr
      .substring(1)
      .split('&')
      .forEach(pairStr => {
        const pair = pairStr.split('=');
        pair[0] && (result[decodeURIComponent(pair[0])] = pair[1] ? decodeURIComponent(pair[1]) : '');
      });

  return result;
}

/**
 * 判断是否是 Element 节点
 * @param value {Node}
 */
export function isElement(value: Node) {
  return (value && value.nodeType === Node.ELEMENT_NODE) || false;
}

/**
 * 简单的手动生成 UUID
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 解析字符生成对象
 * @param str
 * @returns
 */
export function safeJsonParse(str?: string) {
  try {
    return JSON.parse(str || '');
  } catch (e) {
    return {};
  }
}

/**
 * 获取 DOM 元素的 style 样式表
 * @param element DOM 元素
 * @returns
 */
export function computedStyle(element: Element) {
  return window.getComputedStyle(element, null);
}

export function styleProperty(style: CSSStyleDeclaration, property: string) {
  return style.getPropertyValue(property);
}

export function isDisplayed(element: Element, style?: CSSStyleDeclaration): boolean {
  if (!style) {
    style = computedStyle(element);
  }

  const display = styleProperty(style, 'display');
  if (display === 'none') {
    return false;
  }

  const parent = element.parentNode;
  return parent && isElement(parent) ? isDisplayed(parent as Element) : true;
}

export function isVisibleByStyling(element: Element | Document) {
  if (element === window.document) return true;

  if (!element || !element.parentNode) return false;

  const style = computedStyle(element as Element);

  const visibility = styleProperty(style, 'visibility');

  if (visibility === 'hidden' || visibility === 'collapse') return false;

  const opacity = styleProperty(style, 'opacity');
  if (opacity === '0') return false;

  return isDisplayed(element as Element, style);
}

/**
 * 获取事件派发机制
 * @param key {PageUniqKey}
 * @returns
 */
export function getPageUniqKey(key?: PageUniqKey) {
  switch (key) {
    case PageUniqKey.href: {
      return PageUniqKey.href;
    }
    case PageUniqKey.path: {
      return PageUniqKey.path;
    }
    case PageUniqKey.hash: {
      return 'pathWithHash';
    }
    default: {
      return PageUniqKey.href;
    }
  }
}

/**
 * 判断当前环境 localStorage 方法是否可用
 * @returns {boolean}
 */
export function isLocalStorageSupported() {
  let localStorageSupported: any = null;

  if (localStorageSupported !== null) {
    return localStorageSupported;
  }

  try {
    localStorage.setItem('check', 'check');
    localStorage.getItem('check');
    localStorage.removeItem('check');

    localStorageSupported = true;
  } catch (error) {
    localStorageSupported = false;
    console.error('[Monitor] localStorage not supported');
  }

  return localStorageSupported;
}

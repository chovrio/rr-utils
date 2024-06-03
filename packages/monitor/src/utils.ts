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

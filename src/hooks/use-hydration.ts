import { useSyncExternalStore } from "react";

/**
 * 检测客户端水合是否完成。
 * 
 * Zustand persist 中间件会在客户端从 localStorage 恢复状态，
 * 导致服务端渲染的默认值与客户端不一致（Hydration Mismatch）。
 * 
 * 使用此 Hook 可以在水合完成前显示默认值/骨架屏，
 * 水合完成后再显示真实的持久化数据。
 */
export function useHydration() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Stub for Anything platform's shared design-mode module.
// The real implementation is injected by the platform at runtime.
// This stub allows the app to run independently.

export function initDesignMode(getStyleInfo) {
  return function reselect() {};
}

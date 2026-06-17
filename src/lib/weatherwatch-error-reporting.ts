type WeatherWatchErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type WeatherWatchEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: WeatherWatchErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __weatherwatchEvents?: WeatherWatchEvents;
  }
}

export function reportWeatherWatchError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__weatherwatchEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}

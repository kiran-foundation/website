// global variables to check if site is in production
export const isProduction = typeof window !== "undefined" ? window.location.hostname.includes(".foundation"): false; 
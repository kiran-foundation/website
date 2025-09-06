const production_form = "1FAIpQLSefpzhGl46T63TuroNAmyfnRERfeeJjv8Z0hH6WNtNzp-bmgQ"
const test_form = "1FAIpQLSfoiKWC0Np2Clnq1DDj8Un9GCrkB86AX-Dg_QZcwxPiU2QNbQ"
export const isProduction = typeof window !== "undefined" ? window.location.hostname.includes(".foundation"): false; 
export const form_id = isProduction ? production_form : test_form; // form id for google form
// global variables to check if site is in production
export const roleField = isProduction ? "132713313" : "1943470005";
export const moreField = isProduction ? "1964045563" : "1695954646";
export const typeField = isProduction ? "579156192" : "1681195710";
export const resumeField = isProduction ? "1067411802" : "1964045563";
export const nameField = "1405737972";
export const emailField = "1290086262";
export const phoneField = "1357912889";
export const emailAddressField = "emailAddress";

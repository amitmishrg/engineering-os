/**
 * Terminal styling — re-exports from cli-ui for backward compatibility.
 */

export {
  check,
  confirm,
  die,
  eosBanner,
  guardPrompt,
  intro,
  isCancel,
  log,
  multiselect,
  note,
  outro,
  plainError,
  plainLine,
  scanBanner,
  scanError,
  scanHint,
  scanSuccess,
  scanWarn,
  select,
  text,
  uiCheck,
  uiError,
  uiHint,
  uiInfo,
  uiSuccess,
  uiWarn,
  withSpinner,
} from "./cli-ui.js";

export type { SelectOption } from "./cli-ui.js";

/** @deprecated Clack handles theming internally */
export const promptTheme = {};

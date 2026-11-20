/** Id of the server-rendered "Ladataan…" text shown until the app's JavaScript has run. */
export const STATIC_LOADING_INDICATOR_ID = "static-loading-indicator"

/** Removes the static loading text; call once React has mounted. */
export function removeStaticLoadingIndicator(): void {
  document.getElementById(STATIC_LOADING_INDICATOR_ID)?.remove()
}

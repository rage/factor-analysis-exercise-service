// Both functions are serialized with Function.prototype.toString into an inline script in
// _document, so they must not reference anything outside their own bodies.

/** How many self-reloads a page may do within a time window, and where they are counted. */
export interface ReloadGuardConfig {
  /** sessionStorage key holding the reload timestamps. */
  storageKey: string
  maxReloads: number
  windowMs: number
}

/** Limits for reloading the iframe page after its scripts or styles fail to load. */
export const LOAD_FAILURE_RELOAD_GUARD: ReloadGuardConfig = {
  storageKey: "factorial-survey-load-failure-reloads",
  maxReloads: 2,
  windowMs: 60_000,
}

/**
 * Decides whether the page may reload itself after a failed asset load, and records the reload
 * in `storage` when it may.
 *
 * Returns false once `config.maxReloads` reloads were recorded within `config.windowMs` of
 * `nowMs`, and whenever `storage` is null or throws: a reload that can't be counted could loop.
 */
export function recordReloadIfAllowed(
  storage: Pick<Storage, "getItem" | "setItem"> | null,
  nowMs: number,
  config: ReloadGuardConfig,
): boolean {
  if (!storage) {
    return false
  }
  try {
    const stored = storage.getItem(config.storageKey)
    let reloadTimestamps: number[] = []
    try {
      const parsed: unknown = JSON.parse(stored ?? "[]")
      if (Array.isArray(parsed)) {
        reloadTimestamps = parsed.filter((timestamp) => typeof timestamp === "number")
      }
    } catch {
      reloadTimestamps = []
    }
    const recentReloads = reloadTimestamps.filter(
      (timestamp) => timestamp <= nowMs && nowMs - timestamp < config.windowMs,
    )
    if (recentReloads.length >= config.maxReloads) {
      return false
    }
    recentReloads.push(nowMs)
    storage.setItem(config.storageKey, JSON.stringify(recentReloads))
    return true
  } catch {
    return false
  }
}

/**
 * Reloads the page, within the limits of `recordReload`, when a script or stylesheet fails to
 * load or a webpack chunk fails to load. Meant to run before any of the app's scripts.
 */
export function installLoadFailureRecovery(
  win: Window,
  recordReload: typeof recordReloadIfAllowed,
  config: ReloadGuardConfig,
): void {
  let isReloading = false
  const reloadIfAllowed = () => {
    if (isReloading) {
      return
    }
    let storage: Storage | null = null
    try {
      storage = win.sessionStorage
    } catch {
      storage = null
    }
    if (recordReload(storage, Date.now(), config)) {
      isReloading = true
      win.location.reload()
    }
  }
  const isChunkLoadError = (error: unknown) => {
    if (!error || typeof error !== "object") {
      return false
    }
    const { name, message } = error as { name?: unknown; message?: unknown }
    return (
      name === "ChunkLoadError" ||
      (typeof message === "string" && /Loading (CSS )?chunk .+ failed/.test(message))
    )
  }

  win.addEventListener(
    "error",
    (event) => {
      const target = event.target as Element | null
      const tagName = target && typeof target.tagName === "string" ? target.tagName : null
      if (
        tagName === "SCRIPT" ||
        (tagName === "LINK" && (target as HTMLLinkElement).rel === "stylesheet") ||
        isChunkLoadError(event.error)
      ) {
        reloadIfAllowed()
      }
    },
    // Resource load errors don't bubble; only a capturing listener on window sees them.
    true,
  )
  win.addEventListener("unhandledrejection", (event) => {
    if (isChunkLoadError(event.reason)) {
      reloadIfAllowed()
    }
  })
}

/** Source of the inline script that installs the load-failure recovery with the default limits. */
export function buildLoadFailureRecoveryScript(): string {
  return `(${installLoadFailureRecovery.toString()})(window, ${recordReloadIfAllowed.toString()}, ${JSON.stringify(
    LOAD_FAILURE_RELOAD_GUARD,
  )});`
}

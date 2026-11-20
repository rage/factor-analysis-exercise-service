/* eslint-disable i18next/no-literal-string */
import React from "react"
import { createRoot, Root } from "react-dom/client"
import { act } from "react-dom/test-utils"

import useExerciseServiceParentConnection from "../src/shared-module/hooks/useExerciseServiceParentConnection"
import {
  buildLoadFailureRecoveryScript,
  LOAD_FAILURE_RELOAD_GUARD,
  recordReloadIfAllowed,
} from "../src/util/reloadGuard"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextConfig = require("../next.config.js")

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

interface FakePort {
  onmessage: ((event: { data: unknown }) => void) | null
  postMessage: jest.Mock
}

function createFakePort(): FakePort {
  return { onmessage: null, postMessage: jest.fn() }
}

describe("parent connection handshake", () => {
  const fakeParent = { postMessage: jest.fn() }
  const originalParent = window.parent
  let root: Root | null = null
  let container: HTMLDivElement
  let receivedPort: MessagePort | null = null
  const onMessage = jest.fn((messageData: unknown, port: MessagePort) => {
    port.postMessage({ message: "current-state", data: messageData, valid: true })
  })

  const ConnectionProbe: React.FC = () => {
    receivedPort = useExerciseServiceParentConnection(onMessage)
    return null
  }

  const readyPostCount = () =>
    fakeParent.postMessage.mock.calls.filter(([message]) => message === "ready").length

  const sendPortFrom = (source: unknown, port: FakePort) => {
    const event = new Event("message")
    Object.defineProperties(event, {
      source: { value: source },
      ports: { value: [port] },
      data: { value: "communication-port" },
    })
    act(() => {
      window.dispatchEvent(event)
    })
  }

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    jest.spyOn(console, "info").mockImplementation(() => undefined)
    jest.spyOn(console, "groupCollapsed").mockImplementation(() => undefined)
    jest.spyOn(console, "groupEnd").mockImplementation(() => undefined)
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    jest.useFakeTimers()
    fakeParent.postMessage.mockClear()
    onMessage.mockClear()
    receivedPort = null
    Object.defineProperty(window, "parent", { value: fakeParent, configurable: true })
    container = document.createElement("div")
    root = createRoot(container)
    act(() => {
      root?.render(React.createElement(ConnectionProbe))
    })
  })

  afterEach(() => {
    act(() => {
      root?.unmount()
    })
    root = null
    Object.defineProperty(window, "parent", { value: originalParent, configurable: true })
    jest.useRealTimers()
  })

  test("posts ready at once and keeps retrying until a port arrives", () => {
    expect(fakeParent.postMessage).toHaveBeenCalledWith("ready", "*")
    expect(readyPostCount()).toBe(1)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(readyPostCount()).toBe(2)
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(readyPostCount()).toBe(3)

    sendPortFrom(fakeParent, createFakePort())
    expect(receivedPort).not.toBeNull()
    act(() => {
      jest.advanceTimersByTime(60_000)
    })
    expect(readyPostCount()).toBe(3)
  })

  test("ignores ports from other windows", () => {
    sendPortFrom({ postMessage: jest.fn() }, createFakePort())
    expect(receivedPort).toBeNull()
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(readyPostCount()).toBe(2)
  })

  test("routes messages from the first port to the callback and keeps that port", () => {
    const firstPort = createFakePort()
    const secondPort = createFakePort()
    sendPortFrom(fakeParent, firstPort)
    sendPortFrom(fakeParent, secondPort)

    expect(receivedPort).toBe(firstPort)
    expect(secondPort.onmessage).toBeNull()

    const setState = { message: "set-state", view_type: "answer-exercise" }
    act(() => {
      firstPort.onmessage?.({ data: setState })
    })
    expect(onMessage).toHaveBeenCalledWith(setState, firstPort)
    expect(firstPort.postMessage).toHaveBeenCalledWith({
      message: "current-state",
      data: setState,
      valid: true,
    })
  })

  test("stops retrying after unmount", () => {
    act(() => {
      root?.unmount()
    })
    root = null
    act(() => {
      jest.advanceTimersByTime(60_000)
    })
    expect(readyPostCount()).toBe(1)
  })
})

describe("reload guard", () => {
  const config = LOAD_FAILURE_RELOAD_GUARD

  test("allows reloads up to the limit within the window", () => {
    const storage = new MemoryStorage()
    expect(recordReloadIfAllowed(storage, 1_000, config)).toBe(true)
    expect(recordReloadIfAllowed(storage, 2_000, config)).toBe(true)
    expect(recordReloadIfAllowed(storage, 3_000, config)).toBe(false)
    expect(recordReloadIfAllowed(storage, 1_000 + config.windowMs - 1, config)).toBe(false)
  })

  test("allows reloading again once earlier reloads leave the window", () => {
    const storage = new MemoryStorage()
    recordReloadIfAllowed(storage, 1_000, config)
    recordReloadIfAllowed(storage, 2_000, config)
    expect(recordReloadIfAllowed(storage, 1_000 + config.windowMs, config)).toBe(true)
    expect(recordReloadIfAllowed(storage, 1_001 + config.windowMs, config)).toBe(false)
  })

  test("treats unreadable stored data as no earlier reloads", () => {
    const storage = new MemoryStorage()
    storage.setItem(config.storageKey, "{not json")
    expect(recordReloadIfAllowed(storage, 1_000, config)).toBe(true)
    storage.setItem(config.storageKey, JSON.stringify({ count: 5 }))
    expect(recordReloadIfAllowed(storage, 1_000, config)).toBe(true)
  })

  test("refuses to reload when the reload can't be recorded", () => {
    expect(recordReloadIfAllowed(null, 1_000, config)).toBe(false)
    const throwingOnRead = {
      getItem: () => {
        throw new Error("SecurityError")
      },
      setItem: jest.fn(),
    }
    expect(recordReloadIfAllowed(throwingOnRead, 1_000, config)).toBe(false)
    const throwingOnWrite = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError")
      },
    }
    expect(recordReloadIfAllowed(throwingOnWrite, 1_000, config)).toBe(false)
  })

  describe("inline script", () => {
    type Listener = (event: unknown) => void

    function loadPageWithScript(sessionStorage: () => Storage | MemoryStorage) {
      const listeners: Record<string, Listener[]> = {}
      const reload = jest.fn()
      const fakeWindow = {
        addEventListener: (type: string, listener: Listener) => {
          ;(listeners[type] ??= []).push(listener)
        },
        get sessionStorage() {
          return sessionStorage()
        },
        location: { reload },
      }
      new Function("window", buildLoadFailureRecoveryScript())(fakeWindow)
      const dispatch = (type: string, event: unknown) =>
        (listeners[type] ?? []).forEach((listener) => listener(event))
      return { reload, dispatch }
    }

    const failedScriptEvent = { target: { tagName: "SCRIPT" }, error: undefined }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(100_000)
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test("reloads at most twice per minute on failed script loads", () => {
      const storage = new MemoryStorage()
      const reloads = [1, 2, 3].map(() => {
        const page = loadPageWithScript(() => storage)
        page.dispatch("error", failedScriptEvent)
        return page.reload.mock.calls.length
      })
      expect(reloads).toEqual([1, 1, 0])

      jest.setSystemTime(100_000 + LOAD_FAILURE_RELOAD_GUARD.windowMs)
      const page = loadPageWithScript(() => storage)
      page.dispatch("error", failedScriptEvent)
      expect(page.reload).toHaveBeenCalledTimes(1)
    })

    test("reloads once per page even when several assets fail", () => {
      const storage = new MemoryStorage()
      const page = loadPageWithScript(() => storage)
      page.dispatch("error", failedScriptEvent)
      page.dispatch("error", { target: { tagName: "LINK", rel: "stylesheet" } })
      expect(page.reload).toHaveBeenCalledTimes(1)
      expect(
        JSON.parse(storage.getItem(LOAD_FAILURE_RELOAD_GUARD.storageKey) ?? "[]"),
      ).toHaveLength(1)
    })

    test("reloads on chunk load errors", () => {
      const chunkError = Object.assign(new Error("Loading chunk 182 failed."), {
        name: "ChunkLoadError",
      })
      const rejected = loadPageWithScript(() => new MemoryStorage())
      rejected.dispatch("unhandledrejection", { reason: chunkError })
      expect(rejected.reload).toHaveBeenCalledTimes(1)

      const thrown = loadPageWithScript(() => new MemoryStorage())
      thrown.dispatch("error", { target: {}, error: new Error("Loading CSS chunk 7 failed.") })
      expect(thrown.reload).toHaveBeenCalledTimes(1)
    })

    test("ignores unrelated errors", () => {
      const page = loadPageWithScript(() => new MemoryStorage())
      page.dispatch("error", { target: {}, error: new TypeError("x is undefined") })
      page.dispatch("error", { target: { tagName: "IMG" } })
      page.dispatch("error", { target: { tagName: "LINK", rel: "icon" } })
      page.dispatch("unhandledrejection", { reason: new Error("fetch failed") })
      expect(page.reload).not.toHaveBeenCalled()
    })

    test("does not reload when session storage is blocked", () => {
      const page = loadPageWithScript(() => {
        throw new Error("SecurityError")
      })
      page.dispatch("error", failedScriptEvent)
      expect(page.reload).not.toHaveBeenCalled()
    })
  })
})

describe("cache headers", () => {
  type HeaderRule = { source: string; headers: { key: string; value: string }[] }

  async function headerValue(source: string, key: string) {
    const rules: HeaderRule[] = await nextConfig.headers()
    const values = rules
      .filter((rule) => rule.source === source)
      .flatMap((rule) => rule.headers)
      .filter((header) => header.key.toLowerCase() === key.toLowerCase())
      .map((header) => header.value)
    return values[values.length - 1]
  }

  test("static assets are immutable", async () => {
    expect(await headerValue("/_next/static/:path*", "Cache-Control")).toBe(
      "public, max-age=31536000, immutable",
    )
  })

  test("the iframe page is always revalidated", async () => {
    expect(await headerValue("/iframe", "Cache-Control")).toBe("no-cache")
  })

  test("every response stays embeddable", async () => {
    expect(await headerValue("/(.*)", "Access-Control-Allow-Origin")).toBe("*")
    expect(await headerValue("/(.*)", "X-Frame-Options")).toBeUndefined()
  })
})

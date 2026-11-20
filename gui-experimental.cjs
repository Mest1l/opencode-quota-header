// OpenCode Desktop GUI plugin: OpenCode Go quota in the session header.
//
// Shows the used share of the three OpenCode Go windows (5-hour, weekly,
// monthly) to the left of the context indicator, coloured at 70% / 90%.
// Clicking opens the app's own usage dialog, falling back to the Console.
//
// Data comes from the app's usage store, the same numbers the Console shows:
//   session.server.data.location.usage.limits(location).go
//     .rolling / .weekly / .monthly -> { percent, resetsAt, limited }

const { Plugin, Slot, Style } = require("@opencode/plugin/gui")
const { createEffect, createSignal, onCleanup } = require("solid-js")

const WINDOW_ORDER = [
  { key: "rolling", fallback: "label.rolling" },
  { key: "weekly", fallback: "label.weekly" },
  { key: "monthly", fallback: "label.monthly" },
]

const DEFAULT_REFRESH_SECONDS = 60
const MIN_REFRESH_SECONDS = 30
const MAX_REFRESH_SECONDS = 3600

// One sync per location per interval, even when several session tabs are mounted.
const lastSync = new Map()

function refreshSeconds(value) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds)) return DEFAULT_REFRESH_SECONDS

  return Math.min(MAX_REFRESH_SECONDS, Math.max(MIN_REFRESH_SECONDS, Math.round(seconds)))
}

function customLabel(value) {
  if (typeof value !== "string") return undefined

  const label = value.trim().slice(0, 12)
  return label || undefined
}

function remaining(resetsAt) {
  if (typeof resetsAt !== "number" || !Number.isFinite(resetsAt)) return undefined

  const minutes = Math.floor(Math.max(0, resetsAt - Date.now()) / 60_000)
  if (minutes < 1) return "0m"
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  return `${Math.floor(hours / 24)}d`
}

const css = `
[data-quota-header] {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  height: 26px;
  margin: 0 2px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--v2-text-text-muted);
  font: inherit;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}

[data-quota-header]:hover {
  background: var(--v2-overlay-simple-overlay-hover);
  color: var(--v2-text-text-base);
}

[data-quota-header] .qh-label {
  opacity: 0.7;
}

[data-quota-header] .qh-item {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
}

[data-quota-header] .qh-sep {
  opacity: 0.35;
}

[data-quota-header] .qh-value {
  font-weight: 530;
}

[data-quota-header] .qh-value[data-tone="warning"] {
  color: var(--v2-text-text-warning, #d19a66);
}

[data-quota-header] .qh-value[data-tone="danger"] {
  color: var(--v2-text-text-danger, #e06c75);
}
`

function tone(percent) {
  if (typeof percent !== "number") return "normal"
  if (percent >= 90) return "danger"
  if (percent >= 70) return "warning"
  return "normal"
}

function paint(el, go, compact, t, label) {
  const frag = document.createDocumentFragment()

  const name = document.createElement("span")
  name.className = "qh-label"
  name.textContent = label ?? t("label.go")
  frag.append(name)

  // Narrow headers keep only the fullest window, so the title does not lose its room.
  const windows = WINDOW_ORDER.map((item) => {
    const meter = go?.[item.key]

    return { label: remaining(meter?.resetsAt) ?? t(item.fallback), percent: meter?.percent }
  })

  if (compact) {
    let worst = { label: t("label.usage"), percent: undefined }

    for (const item of windows) {
      if (typeof item.percent !== "number") continue
      if (worst.percent === undefined || item.percent > worst.percent) worst = item
    }

    windows.splice(0, windows.length, worst)
  }

  for (const [index, window] of windows.entries()) {
    const percent = window.percent

    if (index > 0) {
      const separator = document.createElement("span")
      separator.className = "qh-sep"
      separator.textContent = "·"
      frag.append(separator)
    }

    const item = document.createElement("span")
    item.className = "qh-item"

    const label = document.createElement("span")
    label.className = "qh-label"
    label.textContent = window.label

    const value = document.createElement("span")
    value.className = "qh-value"
    value.dataset.tone = tone(percent)
    value.textContent = typeof percent === "number" ? `${Math.round(percent)}%` : "—"

    item.append(label, value)
    frag.append(item)
  }

  el.replaceChildren(frag)
}

const COPY = {
  en: {
    "label.go": "Go",
    "label.rolling": "5h",
    "label.weekly": "Week",
    "label.monthly": "Month",
    "label.usage": "Usage",
    "aria": "OpenCode Go usage",
    "title": "OpenCode Go usage · Click for details",
  },
  zh: {
    "label.go": "Go",
    "label.rolling": "5h",
    "label.weekly": "周",
    "label.monthly": "月",
    "label.usage": "用量",
    "aria": "OpenCode Go 已用额度",
    "title": "OpenCode Go 已用额度 · 点击查看详情",
  },
  zht: {
    "label.go": "Go",
    "label.rolling": "5h",
    "label.weekly": "週",
    "label.monthly": "月",
    "label.usage": "用量",
    "aria": "OpenCode Go 已用額度",
    "title": "OpenCode Go 已用額度 · 點擊查看詳情",
  },
}

const LANGUAGE_ALIASES = {
  "zh-cn": "zh",
  "zh-hans": "zh",
  "zh-sg": "zh",
  "zh-tw": "zht",
  "zh-hk": "zht",
  "zh-hant": "zht",
}

function translator(ctx) {
  const forced = typeof ctx.options?.language === "string" ? ctx.options.language.trim().toLowerCase() : ""

  if (!forced || forced === "auto") return (key) => ctx.t(key)

  const locale = LANGUAGE_ALIASES[forced] ?? forced
  return (key) => COPY[locale]?.[key] ?? COPY.en[key] ?? key
}

module.exports = Plugin.define({
  i18n: COPY,
  setup(ctx) {
    const interval = refreshSeconds(ctx.options?.refreshSeconds) * 1000
    const label = customLabel(ctx.options?.label)
    const t = translator(ctx)

    ctx.add(Style, css)

    ctx.add(Slot, {
      at: "session.header",
      order: -100,
      render: (input) => {
        const el = document.createElement("button")
        el.type = "button"
        el.dataset.quotaHeader = "true"
        el.setAttribute("aria-label", t("aria"))
        el.title = t("title")

        el.addEventListener("click", () => {
          if (ctx.commands.run("usage.view")) return
          ctx.system.openExternal("https://opencode.ai/console")
        })

        const sync = () => {
          const session = input.session
          const location = session?.location
          if (!location) return

          // Every mounted session header shares one request per location.
          const key = `${session.server.id}\n${location.directory}`
          const now = Date.now()
          if (now - (lastSync.get(key) ?? 0) < interval * 0.8) return

          lastSync.set(key, now)

          // `usage.sync` is cached until invalidated; without this the row never
          // refetches and keeps the numbers from the first load.
          const usage = session.server.data.location.usage
          if (typeof usage.invalidate === "function") usage.invalidate(location)
          void usage.sync(location).catch(() => lastSync.delete(key))
        }

        const [tick, setTick] = createSignal(0)

        createEffect(() => {
          tick()

          const session = input.session
          const location = session?.location
          if (!location) return

          const limits = session.server.data.location.usage.limits(location)
          const go = limits?.go

          // Go and Go Plus share these meters. Hide when there is no Go allowance
          // (another plan, signed out) or while the first load is still running.
          if (!go) {
            el.style.display = "none"
            return
          }

          el.style.display = ""
          paint(el, go, input.compact === true, t, label)
        })

        let timer
        let ticker
        const stop = () => {
          if (timer !== undefined) clearInterval(timer)
          if (ticker !== undefined) clearInterval(ticker)
          timer = undefined
          ticker = undefined
        }

        const start = () => {
          stop()
          if (document.hidden) return

          sync()
          timer = setInterval(sync, interval)
          ticker = setInterval(() => setTick((n) => n + 1), 60_000)
        }

        const onVisibility = () => start()

        start()
        document.addEventListener("visibilitychange", onVisibility)
        onCleanup(() => {
          stop()
          document.removeEventListener("visibilitychange", onVisibility)
        })

        return el
      },
    })
  },
})

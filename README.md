# opencode-quota-header

OpenCode Desktop plugin: OpenCode Go / Go Plus usage in the session header.

```text
Go 5h 37% · Week 56% · Month 43%    ◔ 130k
```

Left of the context ring. Orange at 70%, red at 90%. Click for the native Usage dialog. Refreshes every 60 seconds; needs network. Labels follow the app language. Go and Go Plus share the same meters; the prefix stays Go for both plans, and the label option can show Go+ instead.

## Install

```sh
opencode plugin add github:Mest1l/opencode-quota-header
```

npm, after publishing:

```sh
opencode plugin add opencode-quota-header
```

Manual:

1. Copy this folder to `~/.config/opencode/plugins/opencode-quota-header`.
2. Add `"./plugins/opencode-quota-header"` to `plugins` in `opencode.json`.
3. Restart Desktop. No build step.

## Options

```jsonc
{
  "plugins": [
    {
      "package": "./plugins/opencode-quota-header",
      "options": { "refreshSeconds": 60, "label": "Go", "language": "auto" }
    }
  ]
}
```

- `refreshSeconds`: 30–3600, default 60.
- label: prefix, for example Go+.
- language: auto (default), en, zh, zht; unknown falls back to English.

## Notes

OpenCode Desktop 2.2+ · experimental GUI API · desktop only · the new-session draft has no header slot · MIT, see [LICENSE](./LICENSE) · publishing steps in [PUBLISH.md](./PUBLISH.md).

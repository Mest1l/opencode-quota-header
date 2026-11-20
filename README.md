# opencode-quota-header

OpenCode Desktop GUI plugin that shows your OpenCode Go / Go Plus usage in the
session header:

```text
Go 5h 37% · Week 56% · Month 43%    ◔ 130k
```

- Rolling 5-hour, weekly and monthly used share, immediately left of the context ring.
- Orange at 70%, red at 90%.
- Click it to open the app's native **Usage** dialog, with reset countdowns.
- Data comes from the app's own usage store, the same numbers as Console.
- Go and Go Plus expose the same three meters; the percentages follow the plan's
  allowance. The API does not include the tier, so the prefix stays `Go`; set
  `options.label` to `Go+` if you want to show the tier.
- Labels follow the app language: English (default), Simplified Chinese, and
  Traditional Chinese; other locales fall back to English.
- Refreshes on mount, when the window becomes visible, and every 60 seconds by
  default. `options.refreshSeconds` changes it (30–3600).
- A refresh asks the local OpenCode server, which calls the OpenCode Console API.
  It needs network; offline, the last numbers stay.

## Install

### From npm

```sh
opencode plugin add opencode-quota-header
```

### From GitHub

```sh
opencode plugin add github:Mest1l/opencode-quota-header
```

### Manual

1. Copy this folder to your OpenCode plugins directory:
   - Windows: `%USERPROFILE%\.config\opencode\plugins\opencode-quota-header`
   - macOS/Linux: `~/.config/opencode/plugins/opencode-quota-header`
   - If `XDG_CONFIG_HOME` is set, use `$XDG_CONFIG_HOME/opencode/plugins/...`
2. Add the path to `plugins` in `opencode.json`:

   ```jsonc
   {
     "plugins": ["./plugins/opencode-quota-header"]
   }
   ```

3. Restart OpenCode Desktop, or reload the config.

There is no build step: `gui-experimental.cjs` is the prebuilt bundle.

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

- `refreshSeconds` is clamped to 30–3600 and defaults to 60. One location is
  synced at most once per interval, even with several session tabs open.
- `label` overrides the prefix, for example `Go+` on a Go Plus plan. It is
  trimmed to 12 characters.
- `language` is `auto` (default), `en`, `zh` or `zht`. `auto` follows the app
  language; an unsupported value falls back to English.

## Requirements

- OpenCode Desktop 2.2 or newer, with the experimental GUI plugin API.
- An OpenCode Go or Go Plus subscription.
- Desktop only; the TUI has no GUI part.

## License

MIT. See [LICENSE](./LICENSE). Copyright (c) 2026 Mest1l.

## Publish

This package is prepared for `Mest1l/opencode-quota-header`.

- **GitHub:** push this folder to that repository; anyone can install it with
  `opencode plugin add github:Mest1l/opencode-quota-header`.
- **npm:** the name `opencode-quota-header` is unclaimed; run
  `npm publish --access public`, then anyone can install it with
  `opencode plugin add opencode-quota-header`.

See [PUBLISH.md](./PUBLISH.md) for the exact steps.

## Notes

- The GUI plugin API is experimental and may change between OpenCode releases.
- Only the three OpenCode Go / Go Plus windows are shown; other plans and
  providers are not queried. The row hides when the workspace has no Go
  allowance.
- The new-session draft has no session header or plugin slot yet, so the row
  appears once a session is open.

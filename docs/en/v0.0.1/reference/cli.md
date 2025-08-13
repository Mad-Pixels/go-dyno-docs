# CLI Reference

## ⚙️ Settings

#### Logging:

| Level   | Description                 | When to Use                |
| ------- | --------------------------- | -------------------------- |
| `debug` | Detailed debug information  | For diagnosing issues      |
| `info`  | General process information | Default logging level      |
| `warn`  | Warnings                    | For potential issues       |
| `error` | Errors                      | For critical failures only |

::: warning Logging level is set via the `GODYNO_LOG_LEVEL` environment variable.
:::

#### Formatting:

::: warning Disable colored output via the `GODYNO_LOG_NO_COLOR` environment variable.
:::

## 💻 Commands

| Command   | Description                         |
| --------- | ----------------------------------- |
| `version` | Display the current version         |
| `help`    | Show help information               |
| `gen`     | Generate Go code from a JSON schema |

### `gen`

#### Command Flags:

| Flag        | Required | Description                     | Env Variable  |
| ----------- | -------- | ------------------------------- | ------------- |
| `c` / `cfg` | ✅       | Path to the JSON schema file    | `GODYNO_CFG`  |
| `d` / `dst` | ✅       | Directory for generated Go code | `GODYNO_DEST` |

#### Examples:

::: code-group

```bash [default]
godyno gen --cfg schema.json --dst ./gen
```

```bash [short]
godyno gen -c schema.json -d ./gen
```

```bash [env]
export GODYNO_CFG=./schema.json
export GODYNO_DEST=./gen

godyno gen
```

:::

# CLI Reference

## ⚙️ Settings
#### Logging:
| Level   | Description                     | When to Use                |
|---------|---------------------------------|----------------------------|
| `debug` | Detailed debug information      | For diagnosing issues      |
| `info`  | General process information     | Default logging level      |
| `warn`  | Warnings                        | For potential issues       |
| `error` | Errors                          | For critical failures only |
::: warning Logging level is set via the `GODYNO_LOG_LEVEL` environment variable.
:::

#### Formatting:
::: warning Disable colored output via the `GODYNO_LOG_NO_COLOR` environment variable.
:::

## 💻 Commands
| Command    | Description                             | 
|------------|-----------------------------------------|
| `version`  | Display the current version             |
| `help`     | Show help information                   |
| `generate` | Generate Go code from a JSON schema     |
| `validate` | Validate JSON schema                    |

### `generate`
#### Command Flags:
| Flag               | Required | Description                             | Env Variable        |
|--------------------|----------|-----------------------------------------|---------------------|
| `s` / `schema`     | ✅       | Path to the JSON schema file            | `GODYNO_SCHEMA`     |
| `o` / `output-dir` | ✅       | Directory for generated Go code         | `GODYNO_OUTPUT-DIR` |
| `m` / `mode`       | ❌       | Set generation mode: [ALL, MIN]         | `GODYNO_MODE`       |
| `package`          | ❌       | Overwrite generated file package name   | `GODYNO_PACKAGE`    |
| `filename`         | ❌       | Overwrite generated filename            | `GODYNO_FILENAME`   |

#### Examples:
::: code-group
```bash [default]
godyno generate --schema schema.json --output-dir ./gen
```

```bash [short]
godyno generate -s schema.json -o ./gen -m min
```

```bash [env]
export GODYNO_SCHEMA=./schema.json
export GODYNO_OUTPUT-DIR=./gen

godyno generate -package mypackage
```
:::

### `validate`
#### Command Flags:
| Flag               | Required | Description                             | Env Variable        |
|--------------------|----------|-----------------------------------------|---------------------|
| `s` / `schema`     | ✅       | Path to the JSON schema file            | `GODYNO_SCHEMA`     |

#### Examples:
::: code-group
```bash [default]
godyno validate --schema schema.json
```

```bash [env]
export GODYNO_SCHEMA=./schema.json

godyno validate
```
:::
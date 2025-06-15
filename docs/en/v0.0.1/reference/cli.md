# CLI Reference

## Commands

| Command   | Description                      | Example                                           |
|-----------|----------------------------------|---------------------------------------------------|
| `gen`     | Generate Go code from JSON schema| `godyno gen --cfg schema.json --dest ./generated` |
| `help`    | Show help information            | `godyno --help`                                   |
| `version` | Show version information         | `godyno --version`                                |

## Flags for `gen` command

| Flag   | Short form | Type   | Required | Description                        | Example                      |
|--------|------------|--------|----------|------------------------------------|------------------------------|
| `cfg`  | `-c`       | string | ✅       | Path to JSON schema file           | `--cfg ./schemas/users.json` |
| `dest` | `-d`       | string | ✅       | Output directory for generated code| `--dest ./generated`         |

## Environment Variables

| Variable              | Description                              | Example                           |
|-----------------------|------------------------------------------|-----------------------------------|
| `GODYNO_CFG`          | Schema file path (alternative to `--cfg`)| `export GODYNO_CFG=./schema.json` |
| `GODYNO_DEST`         | Output directory (alternative to `--dest`)| `export GODYNO_DEST=./generated` |
| `GODYNO_LOG_LEVEL`    | Logging level                            | `export GODYNO_LOG_LEVEL=debug`   |
| `GODYNO_LOG_NO_COLOR` | Disable colored output                   | `export GODYNO_LOG_NO_COLOR=true` |

## Usage Examples

| Scenario                    | Command                                                                  |
|-----------------------------|--------------------------------------------------------------------------|
| Basic generation            | `godyno gen --cfg schema.json --dest ./gen`                              |
| Using environment variables | `GODYNO_CFG=schema.json GODYNO_DEST=./gen godyno gen`                    |
| Short flags                 | `godyno gen -c schema.json -d ./gen`                                     |
| With debug logging          | `GODYNO_LOG_LEVEL=debug godyno gen -c schema.json -d ./gen`              |
| Multiple schemas            | `godyno gen -c users.json -d ./gen && godyno gen -c posts.json -d ./gen` |

## Output File Structure

| Input File            | Output Structure                                 | Description                    |
|-----------------------|--------------------------------------------------|--------------------------------|
| `user-posts.json`     | `./generated/user_posts/user_posts.go`           | Package name from `table_name` |
| `blog-categories.json`| `./generated/blog_categories/blog_categories.go` | Auto-converted to Go format    |
| `UserActivity.json`   | `./generated/user_activity/user_activity.go`     | Name normalization             |


## Logging Levels

| Level   | Description                    | When to use            |
|---------|--------------------------------|------------------------|
| `debug` | Detailed debugging information | Troubleshooting issues |
| `info`  | General process information    | Default level          |
| `warn`  | Warning messages               | Potential issues       |
| `error` | Error messages only            | Critical errors only   |

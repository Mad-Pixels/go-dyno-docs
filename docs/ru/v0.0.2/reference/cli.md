# Описание CLI

## ⚙️ Конфигурация
#### Логгирование:
| Уровень | Описание                        | Когда использовать        |
|---------|---------------------------------|---------------------------|
| `debug` | Подробная отладочная информация | Диагностика проблем       |
| `info`  | Основная информация о процессе  | По умолчанию              |
| `warn`  | Предупреждения                  | Потенциальные проблемы    |
| `error` | Ошибки                          | Только критические ошибки |

::: warning Уровень логгирования задается через env `GODYNO_LOG_LEVEL`
:::
#### Форматирование:
::: warning Отключить цветной вывод через env `GODYNO_LOG_NO_COLOR`
:::

## 💻 Команды
| Команда    | Описание                        | 
|------------|---------------------------------|
| `version`  | Показать версию                 |
| `help`     | Показать справку                |
| `generate` | Генерация Go-кода из JSON схемы | 
| `validate` | Валидация JSON схемы            | 

### `generate`
#### Флаги команды:
|   Флаг             | Обязательный | Описание                             | Env               |
|--------------------|--------------|--------------------------------------|-------------------|
| `s` / `schema`     | ✅           | Путь к JSON файлу схемы              | `GODYNO_CFG`      |
| `o` / `output-dir` | ✅           | Директория для сгенерированного кода | `GODYNO_DEST`     |
| `m` / `mode`       | ❌           | Тип генерации: [ALL, MIN]            | `GODYNO_MODE`     |
| `package`          | ❌           | Переопределение названия пакета      | `GODYNO_PACKAGE`  |
| `filename`         | ❌           | Переопределение имени файла          | `GODYNO_FILENAME` |

#### Примеры:
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
#### Флаги команды:
|   Флаг             | Обязательный | Описание                | Env          |
|--------------------|--------------|-------------------------|--------------|
| `s` / `schema`     | ✅           | Путь к JSON файлу схемы | `GODYNO_CFG` |

#### Примеры:
::: code-group
```bash [default]
godyno validate --schema schema.json
```

```bash [env]
export GODYNO_SCHEMA=./schema.json

godyno validate
```
:::
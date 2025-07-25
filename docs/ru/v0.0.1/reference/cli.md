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
| Команда   | Описание                        | 
|-----------|---------------------------------|
| `version` | Показать версию                 |
| `help`    | Показать справку                |
| `gen`     | Генерация Go-кода из JSON схемы | 

### `gen`
#### Флаги команды:
|   Флаг      | Обязательный | Описание                             | Env           |
|-------------|--------------|--------------------------------------|---------------|
| `c` / `cfg` | ✅           | Путь к JSON файлу схемы              | `GODYNO_CFG`  |
| `d` / `dst` | ✅           | Директория для сгенерированного кода | `GODYNO_DEST` |

#### Примеры:
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

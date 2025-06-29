<div v-pre>
  <button onclick="window.scrollTo({ top: 0, behavior: 'smooth' });"
    style="
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
      background-color: #007bff;
      border: none;
      padding: 0.75rem;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    "
    aria-label="Наверх"
  >
    <img src="/icons/arrow-top.png" alt="Наверх" style="width: 24px; height: 24px;" />
  </button>
</div>

# Быстрый старт

`GoDyno` генерирует типобезопасный Go код для работы с DynamoDB из JSON схемы. Всего 3 шага от схемы до готового кода!

::: tip Установка:
_Если вы еще не установили GoDyno, перейдите к разделу [установки](./installation)._
:::

## 📋 Шаг 1: Создайте схему
Опишите вашу DynamoDB таблицу в JSON файле:
::: code-group
<<< @/snippets/quickstart/user_profiles{json}
:::

::: warning Aттрибуты:
* `hash_key` и `range_key` должны быть объявлены в массиве `attributes`.  
_Это обязательное требование DynamoDB для ключевых полей._

* `common_attributes` это обычные поля для хранения данных.
:::

[Полное описание JSON схемы →](../reference/json)

## ⚡ Шаг 2: Сгенерируйте код
```bash
godyno gen --cfg user_profiles.json --dst ./generated
```
[Полное описание СLI-утилиты, флагов и команд →](../reference/cli)

<br><br>

В папке `./generated` появится файл `userprofiles.go` с полным набором типобезопасных методов:
::: details full content 
::: code-group
<<< @/snippets/quickstart/userprofiles{go}
:::

::: info Сгенерированный код включает:
- `Константы`: _TableName, имена атрибутов и индексов_
- `Типы`: _SchemaItem struct с правильными Go типами_
- `Маршаллинг`: _ItemInput(), ItemOutput() для AWS SDK_
- `Query Builder`: _типобезопасные методы запросов с автодополнением_
- `Scan Builder`: _полнотабличный поиск с фильтрами_
- `Пагинация`: _Limit(), StartFrom() для больших результатов_
- `Сортировка`: _OrderByAsc(), OrderByDesc()_
:::

[Полное описание API →](../reference/api)

## 🎯 Шаг 3: Используйте в коде
### Основные операции
::: code-group
<<< @/snippets/quickstart/op_put{go}
<<< @/snippets/quickstart/op_read{go}
<<< @/snippets/quickstart/op_update{go}
<<< @/snippets/quickstart/op_delete{go}
:::

### Query Builder
::: code-group
<<< @/snippets/quickstart/qb_base{go}
:::

### Scan операции
::: code-group
<<< @/snippets/quickstart/sc_base{go}
:::

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
    aria-label="Top"
  >
    <img src="/icons/arrow-top.png" alt="top" style="width: 24px; height: 24px;" />
  </button>
</div>

# QuickStart

`GoDyno` generates type-safe Go code for working with DynamoDB from a JSON schema. Just 3 steps from schema to production-ready code!

::: tip Installation:
_If you haven’t installed GoDyno yet, head over to the [installation guide](./installation)._
:::

## 📋 Step 1: Create a Schema
Describe your DynamoDB table in a JSON file:
::: code-group
<<< @/snippets/quickstart/user_profiles{json}
:::

::: warning Attributes:
* `hash_key` and `range_key` must be declared in the `attributes` array.
_This is a DynamoDB requirement for key fields_.

* `common_attributes` are regular fields used for storing data.
:::

[Full JSON schema reference →](../reference/json)

## ⚡ Step 2: Generate the Code
```bash
godyno gen --cfg user_profiles.json --dst ./generated
```
[Full reference of CLI tool, flags, and commands →](../reference/cli)

<br><br>

A file named `userprofiles.go` will be created in the `./generated` folder, containing a complete set of type-safe methods:
::: details full content 
::: code-group
<<< @/snippets/quickstart/userprofiles{go}
:::

::: info The generated code includes:
- `Constants`: _TableName, attribute names, and index names_
- `Types`: _SchemaItem struct with correct Go types_
- `Marshalling`: _ItemInput(), ItemOutput() for AWS SDK_
- `Query Builder`: _type-safe query methods with autocomplete support_
- `Scan Builder`: _full-table scans with filters_
- `Pagination`: _Limit(), StartFrom() для больших результатов_
- `Sorting`: _OrderByAsc(), OrderByDesc()_
:::

[Full API Reference →](../reference/api)

## 🎯 Step 3: Use It in Your Code
### Core Operations:
::: code-group
<<< @/snippets/quickstart/op_put{go}
<<< @/snippets/quickstart/op_read{go}
<<< @/snippets/quickstart/op_update{go}
<<< @/snippets/quickstart/op_delete{go}
:::

### Query Builder:
::: code-group
<<< @/snippets/quickstart/qb_base{go}
:::

### Scan Operations:
::: code-group
<<< @/snippets/quickstart/sc_base{go}
:::

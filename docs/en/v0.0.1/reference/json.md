# JSON Schema Description
## Basic Structure
The JSON schema consists of several sections:
1. `table_name` - the name of the DynamoDB table  
2. `hash_key` / `range_key` - the table's primary keys  
3. `attributes` - key attributes used in indexes  
4. `common_attributes` - regular data fields  
5. `secondary_indexes` - secondary indexes (GSI/LSI)

## Examples
::: code-group
<<< @/snippets/v0.0.1/ref_json/basic.json{json}
<<< @/snippets/v0.0.1/ref_json/full.json{json}
<<< @/snippets/v0.0.1/ref_json/overwrite_subtypes.json{json}
<<< @/snippets/v0.0.1/ref_json/composite_keys.json{json}
:::

## Required Fields
### `table_name`
> **Type:** `string`  
> **Example:** `"user_profiles"` 
::: info Logical name of the DynamoDB table.  
Used to generate:
- Go package name (in lowercase)
- File name (`table_name.go`)
- `TableName` constant in code
:::
::: warning
Package will be `userprofiles`, file will be `userprofiles.go`
:::

<br>

### `hash_key`
> **Type:** `string`  
> **Example:** `"user_id"`
::: info The partition key (hash key) of the DynamoDB table.  
Must reference one of the attributes from the `attributes` array.
:::

<br>

### `attributes`
> **Type:** `array of objects`  
> **Example:** `{"name": "user_id", "type": "S"}`
::: info Array of key attributes.  
Used in primary keys and indexes.
:::
#### Consists of:
- `name`  
  > **Type:** `string`  
  > **Example:** `"user_id"`  
  ::: info Attribute name.  
  Must be unique across all table attributes.
  :::
- `type`  
  > **Type:** `string`  
  > **Example:** `"S"`  
  ::: info DynamoDB data type  
  | DynamoDB Type | Go Type   | Description           |
  |---------------|-----------|-----------------------|
  | `"S"`         | `string`  | String                |
  | `"N"`         | `int64`   | Number                |
  | `"BOOL"`      | `bool`    | Boolean               |
  | `"SS"`        | `[]string`| String Set            |
  | `"NS"`        | `[]int`   | Number Set            |
  | `"string"`    | `string`  | Alias for `"S"`       |
  | `"number"`    | `int64`   | Alias for `"N"`       |
  | `"boolean"`   | `bool`    | Alias for `"BOOL"`    |
  :::
- `subtype`  
  > **Type:** `string` _(optional)_  
  > **Example:** `"uint64"`  
  ::: info Specifies Go type.  
  _Only applicable for `"N"` and `"NS"` types._

  | DynamoDB Type | Subtype    | Go Type     | Description                    |
  |---------------|------------|-------------|--------------------------------|
  | `"N"`         | `"int32"`  | `int32`     | 32-bit integer                 |
  | `"N"`         | `"int64"`  | `int64`     | 64-bit integer (default)       |
  | `"N"`         | `"float32"`| `float32`   | 32-bit float                   |
  | `"N"`         | `"uint64"` | `uint64`    | 64-bit unsigned integer        |
  | `"N"`         | `"int16"`  | `int16`     | 16-bit integer                 |
  | `"NS"`        | `"int32"`  | `[]int32`   | Set of 32-bit integers         |
  | `"NS"`        | `"int64"`  | `[]int64`   | Set of 64-bit integers         |
  | `"NS"`        | `"float32"`| `[]float32` | Set of floating-point numbers  |
  | `"NS"`        | `"uint64"` | `[]uint64`  | Set of unsigned integers       |
  | `"NS"`        | `"int16"`  | `[]int16`   | Set of 16-bit integers         |
  :::

## Optional Fields
### `range_key`
> **Type:** `string`  
> **Example:** `"timestamp"`
::: info Sort key (range key) of the DynamoDB table.  
If specified, it must reference one of the attributes from the `attributes` array.
:::

<br>

### `common_attributes`
> **Type:** `array of objects`  
> **Example:** `{"name": "email", "type": "S"}`
::: info Array of regular data attributes.  
These attributes CANNOT be used in index keys — only for storing information.
:::
::: warning The object structure is the same as in `attributes`.
:::

<br>

### `secondary_indexes`
> **Type:** `array of objects`
::: info Array of secondary indexes (`GSI` and `LSI`) for advanced query capabilities.
:::

#### Consists of:
- `name`  
  > **Type:** `string`  
  > **Example:** `"user_id"`  
  ::: info Index name.  
  Must be unique within the table.
  :::
- `type`  
  > **Type:** `string`  
  > **Example:** `"GSI"`  
  ::: info Index type:  
  - **GSI** (Global Secondary Index) — can use any `hash_key`  
  - **LSI** (Local Secondary Index) — uses the table's main `hash_key`
  :::
- `hash_key`  
  > **Type:** `string`  
  > **Required:** Yes for GSI, optional for LSI  
  ::: info Hash key for the index.  
  Must reference an attribute from `attributes` and be different from the table's `range_key` (for LSI).
  :::
- `projection_type`  
  > **Type:** `string`  
  > **Values:** `"ALL"`, `"KEYS_ONLY"`, `"INCLUDE"`  
  ::: info Specifies which attributes are projected into the index:  
  - **ALL** — all attributes from the base table  
  - **KEYS_ONLY** — only index and table keys  
  - **INCLUDE** — keys + additional `non_key_attributes`
  :::
- `non_key_attributes`  
  > **Type:** `array of strings`  
  > **Required:** Only when `projection_type` = `"INCLUDE"`  
  ::: info List of additional attributes to include in the index.
  :::
- `read_capacity` and `write_capacity`  
  > **Type:** `integer`  
  > **Required:** No  
  ::: info Provisioned throughput settings for GSI.  
  _LSIs use the base table's capacity settings._
  :::
  ::: warning **Applies only to:** GSI
  :::

## Composite Keys
```json
{
  "name": "user_status_index",
  "type": "GSI",
  "hash_key": "user_id#status",
  "range_key": "created_at"
}
```
::: warning Composite key `user_id#status` creates a key by combining the `user_id` and `status` attributes.
:::

## Validation
GoDyno automatically checks:
- All keys reference existing attributes  
- Index names are unique  
- Projection types are valid  
- `non_key_attributes` are only used with the `INCLUDE` projection  
- LSI must have a `range_key`  
- GSI must have a `hash_key`  
- LSI `range_key` must differ from the table's `range_key`
::: info If validation errors are found, code generation will fail with a detailed problem description.
:::

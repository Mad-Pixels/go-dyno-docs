# IaC
::: tip
Одна из главных особенностей - это использование единой `JSON-схемы` не только для генерации кода, но и для описания схемы таблицы в `DynamoDB` используя IaC инструменты.
:::

::: warning
Ниже представлены варианты как можно работать с JSON-схемой и IaC-инструментами.

**Это лишь несколько вариантов**, а конкретная реализация может иметь совершенно другие способы и структуры в зависимости от конкретных нужд и соглашений внутри ваших проектов.

_GoDyno никак не регламентирует использование IaC инструментов._
:::

## Terraform
### Пример модуля для описания DynamoDB таблицы
::: code-group
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/module{bash}
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/main.tf{hcl}
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/dynamo.tf{hcl}
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/variables.tf{hcl}
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/outputs.tf{hcl}
:::

#### Применение
```bash
terraform init && terraform apply
```

### Пример в один файл
::: code-group
<<< @/snippets/v0.0.1/main/terraform
:::

#### Применение
```bash
# как пример, динамически задаем шаблон через EnvVar
export TF_VAR_schema=$(cat schema.json)

terraform init && terraform apply
```

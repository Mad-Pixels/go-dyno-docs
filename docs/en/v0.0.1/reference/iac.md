# IaC
::: tip
One of the key features is the use of a single `JSON schema` not only for code generation, but also for defining the table structure in `DynamoDB` using Infrastructure as Code (IaC) tools.
:::

::: warning
Below are some example approaches for working with a JSON schema and IaC tools.

**These are just a few options**, and the actual implementation may vary significantly depending on your specific needs and conventions within your projects.

_GoDyno does not enforce any particular use of IaC tools._
:::

## 🌍 Terraform
### Example of a module for describing a DynamoDB table
::: code-group
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/module{bash}
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/main.tf{hcl}
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/dynamo.tf{hcl}
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/variables.tf{hcl}
<<< @/snippets/v0.0.1/ref_iac/tf_module_1/outputs.tf{hcl}
:::

#### Usage 
```bash
terraform init && terraform apply
```

### Single file example
::: code-group
<<< @/snippets/v0.0.1/main/terraform
:::

#### Usage
```bash
# for example, the schema is passed dynamically via an environment variable
export TF_VAR_schema=$(cat schema.json)

terraform init && terraform apply
```

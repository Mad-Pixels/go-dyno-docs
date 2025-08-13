---
layout: home

hero:
  name: "GoDyno"
  tagline: "Type-Safe Development with DynamoDB"
  actions:
    - theme: brand
      text: Get Started
      link: ./guide/quickstart
    - theme: alt
      text: Releases
      link: https://github.com/Mad-Pixels/go-dyno/releases
    - theme: alt
      text: Docker
      link: https://hub.docker.com/r/madpixels/go-dyno
    - theme: alt
      text: Github
      link: https://github.com/Mad-Pixels/go-dyno
  image: /logo.png

features:
  - icon:
      src: /icons/develop.png
      alt: Schema-Driven Development
    title: Automatic Code Generation
    details: Clean Go code from DynamoDB JSON schemas without external dependencies — generating typed structs, constants, and query builders
  - icon:
      src: /icons/query.png
      alt: Advanced Query Builder
    title: Full Type Safety
    details: Provides compile-time checks, custom type support (int64, int32, float32, uint64, ...), IDE autocompletion, and eliminates runtime errors
  - icon:
      src: /icons/integration.png
      alt: Terraform Integration
    title: Unified Schema for App and Infrastructure
    details: A single JSON schema acts as the source of truth for both Go code and IaC configs — avoiding duplication and drift
  - icon:
      src: /icons/key.png
      alt: Composite Keys Support
    title: Smart Query Optimization
    details: Automatically selects optimal indexes, supports composite keys, GSI/LSI, filtering, pagination, and parallel scanning
---

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
    aria-label="top"
  >
    <img src="/icons/arrow-top.png" alt="top" style="width: 24px; height: 24px;" />
  </button>
</div>

<br><br>

# How It Works

A CLI tool that transforms declarative DynamoDB JSON schemas into production-ready Go modules with rich functionality for interacting with the database. With a single `godyno gen` command, you get fully-typed packages that include validation, query builders, helper functions, and all the infrastructure needed for reliable integration with AWS DynamoDB — eliminating repetitive boilerplate code.

<div align="center" style="margin-top:64px">
  <img src="/go-dyno-schema.png" alt="schema">
</div>

<br><br>

```bash
# generate GoLang code from JSON-schema
$ godyno -c schema.json -d ./gen # -mode all
# or
$ godyno -c schema.json -d ./gen -mode min
# result - new file:
# ./gen/basemixed.go

# create DynamoDB table from JSON-schema (terraform)
$ export TF_VAR_schema=$(cat schema.json)
$ terraform apply
```

::: code-group
<<< @/snippets/v0.0.1/main/schema{json}
<<< @/snippets/v0.0.2/main/generated_all{go}
<<< @/snippets/v0.0.2/main/generated_min{go}
<<< @/snippets/v0.0.1/main/terraform{hcl}
:::

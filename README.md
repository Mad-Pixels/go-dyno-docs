<div align="center">
  <img src="./docs/public/logo.png" alt="GoDyno Logo" />
  <br>
  <h3 align="center">Type-safe DynamoDB code generation</h3>
</div>

---

`Docs` for **`GoDyno`**: a cli-tool for generating type-safe Go code from JSON schemas for DynamoDB.

### Idea
`The Pain`: DynamoDB integration in Go often leads to runtime errors, endless string literals, and fragile code that breaks when schemas change. Developers waste time writing boilerplate query builders, managing attribute mappings, and debugging type mismatches that could be caught at compile-time.  
  
`The Solution`: GoDyno eliminates this friction by generating strongly-typed Go code directly from your DynamoDB schema definitions. Write your table schema once in JSON, and get production-ready Go code with full IDE support, automatic index selection, and compile-time safety. No more guessing attribute names or debugging marshaling errors at runtime.

### Why GoDyno?
- **Code Generation:** Produces clean, dependency-free Go code directly into your project.
- **Type Safety:** Ensures compile-time checks and full IDE autocompletion. 
- **Unified Schema:** Maintains a single source of truth—use one JSON schema for both Terraform and Go.
- **Production Ready:** Generates optimized queries with intelligent automatic index selection.
- **AWS SDK v2 Compatibility:** Full support for AWS SDK v2, including handling composite keys.

[docs](https://go-dyno.madpixels.io)

## I want to report an issue
- If you've found an issue in docs and want to report it, please check our [Issues](https://github.com/Mad-Pixels/go-dyno-docs/issues) page.
- If you've found an issue in CLI and want to report it, please check our [Issues](https://github.com/Mad-Pixels/go-dyno/issues) page.
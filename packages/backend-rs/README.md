A work-in-progress Firefish backend written in Rust

Minimum supported Rust version (MSRV): 1.74

# How to write the code

Currently, there is no entrypoint in this project, and all functions are executed via Node-API.

You need to apply the [`macros::export`] proc macro to export a function to the Node.js backend:

```rust,ignore
#[macros::export]
pub fn to_be_exported(value: &str) -> i32 {
    // You can also call other functions that are not exported
    do_something();
    42
}

fn do_something() {
    do_other_thing();
}
```

this code will be translated into this TypeScript code:

```typescript
export declare function toBeExported(value: string): number {
    /* executes the compiled Rust function */
}
```

You can also export `async` functions:

```rust,ignore
#[macros::export]
pub async fn async_function() -> i32 {
    some_async_task().await
}
```

```typescript
export declare function asyncFunction(): Promise<number> {
    /* executes the compiled Rust function */
}
```

You need to specify `object` attribute to export `struct`s:

```rust,ignore
#[macros::export(object)]
pub struct Thing {
    pub field_one: String,
    pub field_two: Option<String>,
}
```

```typescript
export interface Thing {
    fieldOne: string
    fieldTwo: string | null
}
```

# Update auto-generated files

These files are auto-generated and are not intended for manual editing:
- `packages/backend-rs/index.js`
- `packages/backend-rs/index.d.ts`
- [`packages/backend-rs/src/model/entity/*`](crate::model::entity)

## Prerequisites

1. `dev/config.env` (see `dev/config.example.env` for reference)
2. PostgreSQL database listening on port `25432`
3. Dev dependencies
    - [GNU Make](<https://www.gnu.org/software/make/>)
    - [sea-orm-cli](<https://www.sea-ql.org/SeaORM/docs/generate-entity/sea-orm-cli/>)

## Update database entity

Run the following command in the repository root directory

```sh
make entities
```

## Update `index.js` and `index.d.ts`

Run the following command in the repository root directory

```sh
make napi
```

# Unit tests

It is highly encouraged that you write unit tests and test the code yourself (there is no integration test at this point).

## Prerequisites

1. `dev/config.env` (see `dev/config.example.env` for reference)
2. Firefish config file (`.config/default.yml`)
3. Dev dependency
    - [cargo-nextest](<https://nexte.st/>)

## Run unit tests

Run the following command in the repository root directory

```sh
pnpm run test:rs
```

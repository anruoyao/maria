use quote::quote;

/// Reads the version field in the project root package.json at compile time.
///
/// # Example
/// You can get a compile-time constant version number using this macro:
/// ```
/// # use macros::read_version_from_package_json;
/// // VERSION == "YYYYMMDD" (or "YYYYMMDD-X")
/// const VERSION: &str = read_version_from_package_json!();
/// ```
#[proc_macro]
pub fn read_version_from_package_json(_item: proc_macro::TokenStream) -> proc_macro::TokenStream {
    #[derive(serde::Deserialize)]
    struct PackageJson {
        version: String,
    }

    let file = std::fs::File::open("package.json").expect("Failed to open package.json");
    let json: PackageJson = serde_json::from_reader(file).unwrap();
    let version = &json.version;

    quote!(#version).into()
}

/// See [`macros_impl::napi::napi`] for more details.
#[proc_macro_attribute]
pub fn napi(
    attr: proc_macro::TokenStream,
    item: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let attr: proc_macro2::TokenStream = attr.into();
    let orig_item: proc_macro2::TokenStream = item.into();
    let napi_item: proc_macro2::TokenStream =
        macros_impl::napi::napi(attr.clone(), orig_item.clone()).unwrap();

    quote! {
        #[cfg(not(feature = "napi"))]
        #orig_item

        #[cfg(feature = "napi")]
        #napi_item
    }
    .into()
}

/// Exports a function, struct, enum, const, etc. to TypeScript.
///
/// This is a wrapper of [macro@napi] that expands to
/// ```no_run
/// #[cfg_attr(feature = "napi", macros::napi(attr))]
/// # fn f() {} // to work around doc test compilation error
/// ```
/// where `attr` is given attribute(s). See [`macros_impl::napi::napi`] for more details.
#[proc_macro_attribute]
pub fn export(
    attr: proc_macro::TokenStream,
    item: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let attr: proc_macro2::TokenStream = attr.into();
    let item: proc_macro2::TokenStream = item.into();

    quote! {
        #[cfg_attr(feature = "napi", macros::napi(#attr))]
        #item
    }
    .into()
}

/// Exports a function, struct, enum, const, etc. to TypeScript
/// and make it unable to use in Rust.
///
/// This is a wrapper of [macro@napi] that expands to
/// ```no_run
/// #[cfg(feature = "napi")]
/// #[macros::napi(attr)]
/// # fn f() {} // to work around doc test compilation error
/// ```
/// where `attr` is given attribute(s). See [`macros_impl::napi::napi`] for more details.
#[proc_macro_attribute]
pub fn ts_export(
    attr: proc_macro::TokenStream,
    item: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let attr: proc_macro2::TokenStream = attr.into();
    let item: proc_macro2::TokenStream = item.into();

    quote! {
        #[cfg(feature = "napi")]
        #[macros::napi(#attr)]
        #item

        #[cfg(any(test, doctest))]
        #item
    }
    .into()
}

#[proc_macro_attribute]
pub fn for_ts(
    _: proc_macro::TokenStream,
    item: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let item: proc_macro2::TokenStream = item.into();

    quote! {
        #[cfg(any(test, doctest, feature = "napi"))]
        #item
    }
    .into()
}

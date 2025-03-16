//! Napi related macros

use convert_case::{Case, Casing};
use proc_macro2::{TokenStream, TokenTree};
use quote::{quote, ToTokens};

/// Creates an extra wrapper function for [napi_derive](https://docs.rs/napi-derive/latest/napi_derive/).
///
/// The macro is simply converted into `napi_derive::napi(...)`
/// if it is not applied to a function.
///
/// The macro sets the following attributes by default if not specified:
/// - `use_nullable = true` (if `object` or `constructor` attribute is specified)
/// - `js_name` to the camelCase version of the original function name (for functions)
///
/// The types of the function arguments is converted with following rules:
/// - `&str` and `&mut str` are converted to [`String`]
/// - `&[T]` and `&mut [T]` are converted to [`Vec<T>`]
/// - `&T` and `&mut T` are converted to `T`
/// - Other `T` remains `T`
///
/// In addition, return type [`Result<T>`] and [`Result<T, E>`] are converted to [`napi::Result<T>`](https://docs.rs/napi/latest/napi/type.Result.html).
/// Note that `E` must implement [std::error::Error] trait,
/// and `crate::util::error_chain::format_error(error: &dyn std::error::Error) -> String` function must be present.
///
/// # Examples
/// ## Applying the macro to a struct
/// ```
/// # use macros_impl::napi::napi;
/// # proc_macro_tester::assert_expands!({
/// #[macros::napi(object)]
/// struct Person {
///     id: i32,
///     name: String,
/// }
///
/// # }, {
/// /******* the code above expands to *******/
///
/// #[napi_derive::napi(use_nullable = true, object)]
/// struct Person {
///     id: i32,
///     name: String,
/// }
/// # });
/// ```
///
/// ## Function with explicitly specified `js_name`
/// ```
/// # use macros_impl::napi::napi;
/// # proc_macro_tester::assert_expands!({
/// #[macros::napi(js_name = "add1")]
/// pub fn add_one(x: i32) -> i32 {
///     x + 1
/// }
///
/// # }, {
/// /******* the code above expands to *******/
///
/// pub fn add_one(x: i32) -> i32 {
///     x + 1
/// }
///
/// #[napi_derive::napi(js_name = "add1")]
/// pub fn add_one_napi(x: i32) -> i32 {
///     add_one(x)
/// }
/// # });
/// ```
///
/// ## Function with `i32` argument
/// ```
/// # use macros_impl::napi::napi;
/// # proc_macro_tester::assert_expands!({
/// #[macros::napi]
/// pub fn add_one(x: i32) -> i32 {
///     x + 1
/// }
///
/// # }, {
/// /******* the code above expands to *******/
///
/// pub fn add_one(x: i32) -> i32 {
///     x + 1
/// }
/// #[napi_derive::napi(js_name = "addOne",)]
/// pub fn add_one_napi(x: i32) -> i32 {
///     add_one(x)
/// }
/// # });
/// ```
///
/// ## Function with `&str` argument
/// ```
/// # use macros_impl::napi::napi;
/// # proc_macro_tester::assert_expands!({
/// #[macros::napi]
/// pub fn concatenate_string(str1: &str, str2: &str) -> String {
///     str1.to_owned() + str2
/// }
///
/// # }, {
/// /******* the code above expands to *******/
///
/// pub fn concatenate_string(str1: &str, str2: &str) -> String {
///     str1.to_owned() + str2
/// }
///
/// #[napi_derive::napi(js_name = "concatenateString",)]
/// pub fn concatenate_string_napi(str1: String, str2: String) -> String {
///     concatenate_string(&str1, &str2)
/// }
/// # });
/// ```
///
/// ## Function with `&[String]` argument
/// ```
/// # use macros_impl::napi::napi;
/// # proc_macro_tester::assert_expands!({
/// #[macros::napi]
/// pub fn string_array_length(array: &[String]) -> u32 {
///     array.len() as u32
/// }
///
/// # }, {
/// /******* the code above expands to *******/
///
/// pub fn string_array_length(array: &[String]) -> u32 {
///     array.len() as u32
/// }
///
/// #[napi_derive::napi(js_name = "stringArrayLength",)]
/// pub fn string_array_length_napi(array: Vec<String>) -> u32 {
///     string_array_length(&array)
/// }
/// # });
/// ```
///
/// ## Function with `Result<T, E>` return type
/// ```
/// # quote::quote! { // prevent compiling the code
/// #[derive(thiserror::Error, Debug)]
/// pub enum IntegerDivisionError {
///     #[error("Divided by zero")]
///     DividedByZero,
///     #[error("Not divisible with remainder {0}")]
///     NotDivisible(i64),
/// }
/// # };
///
/// # use macros_impl::napi::napi;
/// # proc_macro_tester::assert_expands!({
/// #[macros::napi]
/// pub fn integer_divide(dividend: i64, divisor: i64) -> Result<i64, IntegerDivisionError> {
///     match divisor {
///         0 => Err(IntegerDivisionError::DividedByZero),
///         _ => match dividend % divisor {
///             0 => Ok(dividend / divisor),
///             remainder => Err(IntegerDivisionError::NotDivisible(remainder)),
///         },
///     }
/// }
/// # }, {
///
/// /******* the function above expands to *******/
///
/// pub fn integer_divide(dividend: i64, divisor: i64) -> Result<i64, IntegerDivisionError> {
///     match divisor {
///         0 => Err(IntegerDivisionError::DividedByZero),
///         _ => match dividend % divisor {
///             0 => Ok(dividend / divisor),
///             remainder => Err(IntegerDivisionError::NotDivisible(remainder)),
///         },
///     }
/// }
///
/// #[napi_derive::napi(js_name = "integerDivide",)]
/// pub fn integer_divide_napi(dividend: i64, divisor: i64) -> napi::Result<i64> {
///     integer_divide(dividend, divisor)
///         .map_err(|err| napi::Error::from_reason(
///             format!("\n{}\n", crate::util::error_chain::format_error(&err))
///         ))
/// }
/// # });
/// ```
///
pub fn napi(macro_attr: TokenStream, item: TokenStream) -> syn::Result<TokenStream> {
    let macro_attr_tokens: Vec<TokenTree> = macro_attr.clone().into_iter().collect();
    // generated extra macro attr TokenStream (prepended before original input `macro_attr`)
    let mut extra_macro_attr = TokenStream::new();

    let item: syn::Item =
        syn::parse2(item).expect("Failed to parse input TokenStream to syn::Item");

    // handle non-functions
    let syn::Item::Fn(item_fn) = item else {
        // set `use_nullable = true` if `object` or `constructor` present but not `use_nullable`
        if macro_attr_tokens.iter().any(|token| {
            matches!(token, TokenTree::Ident(ident) if ident == "object" || ident == "constructor")
        }) && !macro_attr_tokens.iter().any(|token| {
            matches!(token, TokenTree::Ident(ident) if ident == "use_nullable")
        }) {
            quote! { use_nullable = true, }.to_tokens(&mut extra_macro_attr);
        }
        return Ok(quote! {
          #[napi_derive::napi(#extra_macro_attr #macro_attr)]
          #item
        });
    };

    // handle functions
    let ident = &item_fn.sig.ident;
    let item_fn_attrs = &item_fn.attrs;
    let item_fn_vis = &item_fn.vis;
    let mut item_fn_sig = item_fn.sig.clone();
    let mut function_call_modifiers = Vec::<TokenStream>::new();

    // append "_napi" to function name
    item_fn_sig.ident = syn::parse_str(&format!("{}_napi", &ident)).unwrap();

    // append `.await` to function call in async function
    if item_fn_sig.asyncness.is_some() {
        function_call_modifiers.push(quote! {
            .await
        });
    }

    // convert return type `...::Result<T, ...>` to `napi::Result<T>`
    if let syn::ReturnType::Type(_, ref mut return_type) = item_fn_sig.output {
        if let Some(result_generic_type) = (|| {
            let syn::Type::Path(return_type_path) = &**return_type else {
                return None;
            };
            // match a::b::c::Result
            let last_segment = return_type_path.path.segments.last()?;
            if last_segment.ident != "Result" {
                return None;
            };
            // extract <T, ...> from Result<T, ...>
            let syn::PathArguments::AngleBracketed(generic_arguments) = &last_segment.arguments
            else {
                return None;
            };
            // return T only
            generic_arguments.args.first()
        })() {
            // modify return type
            *return_type = syn::parse_quote! {
                napi::Result<#result_generic_type>
            };
            // add modifier to function call result
            function_call_modifiers.push(quote! {
                .map_err(|err| napi::Error::from_reason(
                    format!("\n{}\n", crate::util::error_chain::format_error(&err))
                ))
            });
        }
    };

    // arguments in function call
    let called_args: Vec<TokenStream> = item_fn_sig
        .inputs
        .iter_mut()
        .map(|input| match input {
            // self
            syn::FnArg::Receiver(arg) => {
                let mut tokens = TokenStream::new();
                if let Some((ampersand, lifetime)) = &arg.reference {
                    ampersand.to_tokens(&mut tokens);
                    lifetime.to_tokens(&mut tokens);
                }
                arg.mutability.to_tokens(&mut tokens);
                arg.self_token.to_tokens(&mut tokens);
                tokens
            }
            // typed argument
            syn::FnArg::Typed(arg) => {
                match &mut *arg.pat {
                    syn::Pat::Ident(ident) => {
                        let name = &ident.ident;
                        match &*arg.ty {
                            // reference type argument => move ref from sigature to function call
                            syn::Type::Reference(r) => {
                                // add reference anotations to arguments in function call
                                let mut tokens = TokenStream::new();
                                r.and_token.to_tokens(&mut tokens);
                                if let Some(lifetime) = &r.lifetime {
                                    lifetime.to_tokens(&mut tokens);
                                }
                                r.mutability.to_tokens(&mut tokens);
                                name.to_tokens(&mut tokens);

                                // modify napi argument types in function sigature
                                // (1) add `mut` token to `&mut` type
                                ident.mutability = r.mutability;
                                // (2) remove reference
                                *arg.ty = syn::Type::Verbatim(match &*r.elem {
                                    syn::Type::Slice(slice) => {
                                        let ty = &*slice.elem;
                                        quote! { Vec<#ty> }
                                    }
                                    _ => {
                                        let elem_tokens = r.elem.to_token_stream();
                                        match elem_tokens.to_string().as_str() {
                                            // &str => String
                                            "str" => quote! { String },
                                            // &T => T
                                            _ => elem_tokens,
                                            // TODO: Option<String> => Option<&str>
                                        }
                                    }
                                });

                                // return arguments in function call
                                tokens
                            }
                            // o.w., return it as is
                            _ => quote! { #name },
                        }
                    }
                    pat => panic!("Unexpected FnArg: {pat:#?}"),
                }
            }
        })
        .collect();

    // handle macro attr
    // set js_name if not specified
    if !macro_attr_tokens
        .iter()
        .any(|token| matches!(token, TokenTree::Ident(ident) if ident == "js_name"))
    {
        let js_name = ident.to_string().to_case(Case::Camel);
        quote! { js_name = #js_name, }.to_tokens(&mut extra_macro_attr);
    }

    Ok(quote! {
      #item_fn

      #[napi_derive::napi(#extra_macro_attr #macro_attr)]
      #(#item_fn_attrs)*
      #item_fn_vis #item_fn_sig {
        #ident(#(#called_args),*)
        #(#function_call_modifiers)*
      }
    })
}

// prevent cargo fmt from modifying code blocks in assert_*!
#[rustfmt::skip]
#[cfg(test)]
mod unit_test {
    use super::napi;
    use proc_macro_tester::*;

    #[test]
    fn mut_ref_argument() {
        assert_yields!(
            {
                #[macros::napi]
                pub fn append_string_and_clone(
                    base_str: &mut String,
                    appended_str: &str,
                ) -> String {
                    base_str.push_str(appended_str);
                    base_str.to_owned()
                }
            },
            {
                #[napi_derive::napi(js_name = "appendStringAndClone", )]
                pub fn append_string_and_clone_napi(
                    mut base_str: String,
                    appended_str: String,
                ) -> String {
                    append_string_and_clone(&mut base_str, &appended_str)
                }
            }
        );
    }

    #[test]
    fn result_return_type() {
        assert_yields!(
            {
                #[macros::napi]
                pub fn integer_divide(
                    dividend: i64,
                    divisor: i64,
                ) -> Result<i64, IntegerDivisionError> {
                    match divisor {
                        0 => Err(IntegerDivisionError::DividedByZero),
                        _ => match dividend % divisor {
                            0 => Ok(dividend / divisor),
                            remainder => Err(IntegerDivisionError::NotDivisible(remainder)),
                        },
                    }
                }
            },
            {
                #[napi_derive::napi(js_name = "integerDivide", )]
                pub fn integer_divide_napi(dividend: i64, divisor: i64,) -> napi::Result<i64> {
                    integer_divide(dividend, divisor).map_err(|err|
                        napi::Error::from_reason(format!(
                            "\n{}\n",
                            crate::util::error_chain::format_error(&err)
                        ))
                    )
                }
            }
        );
    }

    #[test]
    fn async_function() {
        assert_yields!({
            #[macros::napi]
            pub async fn async_add_one(x: i32) -> i32 {
                x + 1
            }
        }, {
            #[napi_derive::napi(js_name = "asyncAddOne", )]
            pub async fn async_add_one_napi(x: i32) -> i32 {
                async_add_one(x)
                    .await
            }
        });
    }

    #[test]
    fn slice_type() {
        assert_yields!(
            {
                #[macros::napi]
                pub fn string_array_length(array: &[String]) -> u32 {
                    array.len() as u32
                }
            },
            {
                #[napi_derive::napi(js_name = "stringArrayLength", )]
                pub fn string_array_length_napi(array: Vec<String>) -> u32 {
                    string_array_length(&array)
                }
            }
        );
    }

    #[test]
    fn object_with_explicitly_set_use_nullable() {
        assert_expands!(
            {
                #[macros::napi(object, use_nullable = false)]
                struct Person {
                    id: i32,
                    name: Option<String>,
                }
            },
            {
                #[napi_derive::napi(object, use_nullable = false)]
                struct Person {
                    id: i32,
                    name: Option<String>,
                }
            }
        );
    }

    #[test]
    fn macro_attr() {
        assert_yields!(
            {
                #[macros::napi(ts_return_type = "number")]
                pub fn add_one(x: i32) -> i32 {
                    x + 1
                }
            },
            {
                #[napi_derive::napi(js_name = "addOne", ts_return_type = "number")]
                pub fn add_one_napi(x: i32) -> i32 {
                    add_one(x)
                }
            }
        );
    }

    #[test]
    fn explicitly_specified_js_name_and_other_macro_attr() {
        assert_yields!(
            {
                #[macros::napi(ts_return_type = "number", js_name = "add1")]
                pub fn add_one(x: i32) -> i32 {
                    x + 1
                }
            },
            {
                #[napi_derive::napi(ts_return_type = "number", js_name = "add1")]
                pub fn add_one_napi(x: i32) -> i32 {
                    add_one(x)
                }
            }
        );
    }
}

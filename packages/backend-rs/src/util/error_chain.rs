//! Error formatter used until backtracing methods are standarized

use std::error::Error;

/// Prettifies [`Error`] message (mainly for napi export)
pub fn format_error(mut error: &dyn Error) -> String {
    let mut to_return = String::new();

    to_return.push_str(&format!(
        concat!("      raw: {0:?}", "\n", "  message: {0}"),
        error,
    ));

    while let Some(source) = error.source() {
        to_return.push('\n');
        to_return.push_str(&format!("caused by: {}", source));
        error = source;
    }

    to_return
}

#[cfg(test)]
mod unit_test {
    use pretty_assertions::assert_eq;

    #[test]
    fn format_error() {
        #[derive(thiserror::Error, Debug)]
        #[error("inner error 1")]
        struct InnerError1;

        #[derive(thiserror::Error, Debug)]
        #[error("unexpected string '{0}'")]
        struct InnerError2(String);

        #[error_doc::errors]
        enum ErrorVariants {
            #[error("error 1 occured")]
            Error1(#[from] InnerError1),
            #[error("error 2 occured")]
            Error2(#[from] InnerError2),
        }

        fn causes_inner_error_1() -> Result<(), InnerError1> {
            Err(InnerError1)
        }
        fn causes_inner_error_2() -> Result<(), InnerError2> {
            Err(InnerError2("foo".to_owned()))
        }

        fn causes_error_1() -> Result<(), ErrorVariants> {
            causes_inner_error_1()?;
            Ok(())
        }
        fn causes_error_2() -> Result<(), ErrorVariants> {
            causes_inner_error_2()?;
            Ok(())
        }

        let error_1 = causes_error_1().unwrap_err();
        let error_2 = causes_error_2().unwrap_err();

        let error_message_1 = super::format_error(&error_1);
        let error_message_2 = super::format_error(&error_2);

        // We can't assume consistency in `Debug` output, so the output texts
        // may need to be updated in the future, and we shouldn't make this kind
        // of assumption in the actual program.
        let expected_message_1 = "
      raw: Error1(InnerError1)
  message: error 1 occured
caused by: inner error 1";
        let expected_message_2 = r#"
      raw: Error2(InnerError2("foo"))
  message: error 2 occured
caused by: unexpected string 'foo'"#;

        assert_eq!(error_message_1, expected_message_1[1..]);
        assert_eq!(error_message_2, expected_message_2[1..]);
    }
}

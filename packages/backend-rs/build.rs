fn main() {
    // watch the version in the project root package.json
    println!("cargo:rerun-if-changed=../../package.json");

    // napi
    #[cfg(feature = "napi")]
    napi_build::setup();
}

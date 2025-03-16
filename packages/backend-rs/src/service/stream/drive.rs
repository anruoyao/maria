use crate::service::stream::{publish_to_stream, Error, Stream};

#[macros::export(string_enum = "camelCase")]
pub enum DriveFileEvent {
    Create,
    Update,
    Delete,
}

#[macros::export(string_enum = "camelCase")]
pub enum DriveFolderEvent {
    Create,
    Update,
    Delete,
}

// We want to merge `kind` and `object` into a single enum and merge the 2 functions
// https://github.com/napi-rs/napi-rs/issues/2036

#[macros::export(js_name = "publishToDriveFileStream")]
pub async fn publish_file(
    user_id: String,
    kind: DriveFileEvent,
    object: &serde_json::Value, // file (create, update) or file id (delete)
) -> Result<(), Error> {
    let kind = match kind {
        DriveFileEvent::Create => "fileCreated",
        DriveFileEvent::Update => "fileUpdated",
        DriveFileEvent::Delete => "fileDeleted",
    };

    publish_to_stream(
        &Stream::Drive { user_id },
        Some(kind),
        Some(serde_json::to_string(object)?),
    )
    .await
}

#[macros::export(js_name = "publishToDriveFolderStream")]
pub async fn publish_folder(
    user_id: String,
    kind: DriveFolderEvent,
    object: &serde_json::Value, // folder (create, update) or folder id (delete)
) -> Result<(), Error> {
    let kind = match kind {
        DriveFolderEvent::Create => "folderCreated",
        DriveFolderEvent::Update => "folderUpdated",
        DriveFolderEvent::Delete => "folderDeleted",
    };

    publish_to_stream(
        &Stream::Drive { user_id },
        Some(kind),
        Some(serde_json::to_string(object)?),
    )
    .await
}

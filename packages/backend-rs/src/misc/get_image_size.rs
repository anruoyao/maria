use crate::{cache, misc::is_safe_url::is_safe_url, util::http_client};
use chrono::Duration;
use futures_util::AsyncReadExt;
use image::{ImageError, ImageFormat, ImageReader};
use isahc::AsyncReadResponseExt;
use nom_exif::{parse_jpeg_exif, EntryValue, ExifTag};
use std::io::Cursor;
use tokio::sync::Mutex;

#[error_doc::errors]
pub enum Error {
    #[error("Redis cache operation has failed")]
    Cache(#[from] cache::redis::Error),
    #[error("failed to acquire an HTTP client")]
    HttpClient(#[from] http_client::Error),
    #[error("HTTP request failed")]
    Isahc(#[from] isahc::Error),
    #[doc = "Bad HTTP status"]
    #[error("bad HTTP status ({0})")]
    BadStatus(String),
    #[error("failed to decode an image")]
    Image(#[from] ImageError),
    #[error("failed to decode an image")]
    Io(#[from] std::io::Error),
    #[error("failed to extract the exif data")]
    Exif(#[from] nom_exif::Error),
    #[doc = "Too many fetch attempts"]
    #[error("too many fetch attempts for {0}")]
    TooManyAttempts(String),
    #[doc = "Unsupported image type"]
    #[error("unsupported image type ({0})")]
    UnsupportedImage(String),
    #[error("access to this URL is not allowed")]
    UnsafeUrl,
}

const BROWSER_SAFE_IMAGE_TYPES: [ImageFormat; 8] = [
    ImageFormat::Png,
    ImageFormat::Jpeg,
    ImageFormat::Gif,
    ImageFormat::WebP,
    ImageFormat::Tiff,
    ImageFormat::Bmp,
    ImageFormat::Ico,
    ImageFormat::Avif,
];

static MTX_GUARD: Mutex<()> = Mutex::const_new(());

#[cfg_attr(test, derive(Debug, PartialEq))]
#[macros::export(object)]
pub struct ImageSize {
    pub width: u32,
    pub height: u32,
}

#[macros::export]
pub async fn get_image_size_from_url(url: &str) -> Result<ImageSize, Error> {
    if !is_safe_url(url) {
        return Err(Error::UnsafeUrl);
    }

    let attempted: bool;

    {
        let _ = MTX_GUARD.lock().await;

        attempted = cache::get_one::<bool>(cache::Category::FetchUrl, url)
            .await?
            .is_some();

        if !attempted {
            cache::set_one(cache::Category::FetchUrl, url, &true, Duration::minutes(10)).await?;
        }
    }

    if attempted {
        tracing::warn!("attempt limit exceeded: {}", url);
        return Err(Error::TooManyAttempts(url.to_owned()));
    }

    tracing::info!("retrieving image from {}", url);

    let response = http_client::client()?.get_async(url).await?;

    if !response.status().is_success() {
        tracing::info!("status: {}", response.status());
        return Err(Error::BadStatus(format!(
            "{} returned {}",
            url,
            response.status()
        )));
    }

    // Read up to 8 MiB of the response body
    let image_bytes = response
        .map(|body| body.take(8 * 1024 * 1024))
        .bytes()
        .await?;

    let reader = ImageReader::new(Cursor::new(&image_bytes)).with_guessed_format()?;

    let format = reader.format();
    if format.is_none() || !BROWSER_SAFE_IMAGE_TYPES.contains(&format.unwrap()) {
        return Err(Error::UnsupportedImage(format!("{:?}", format)));
    }

    let size = reader.into_dimensions()?;

    let res = ImageSize {
        width: size.0,
        height: size.1,
    };

    if format.unwrap() != ImageFormat::Jpeg {
        return Ok(res);
    }

    // handle jpeg orientation
    // https://magnushoff.com/articles/jpeg-orientation/

    let exif = parse_jpeg_exif(&*image_bytes)?;
    if exif.is_none() {
        return Ok(res);
    }

    let orientation = exif.unwrap().get_value(&ExifTag::Orientation)?;
    let rotated =
        orientation.is_some() && matches!(orientation.unwrap(), EntryValue::U32(v) if v >= 5);

    if !rotated {
        return Ok(res);
    }

    Ok(ImageSize {
        width: size.1,
        height: size.0,
    })
}

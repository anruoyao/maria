//! This module is (currently) used in the TypeScript backend only.

#[macros::ts_export]
pub async fn update_antenna_cache() -> Result<(), sea_orm::DbErr> {
    super::update().await?;
    Ok(())
}

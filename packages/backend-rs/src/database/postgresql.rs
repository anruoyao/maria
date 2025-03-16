//! PostgreSQL interface

use crate::config::CONFIG;
use sea_orm::{ConnectOptions, Database, DbConn, DbErr};
use std::time::Duration;
use tokio::sync::OnceCell;
use tracing::log::LevelFilter;

static DB_CONN: OnceCell<DbConn> = OnceCell::const_new();

async fn init_conn() -> Result<&'static DbConn, DbErr> {
    let database_uri = format!(
        "postgres://{}:{}@{}:{}/{}",
        CONFIG.db.user,
        urlencoding::encode(&CONFIG.db.pass),
        CONFIG.db.host,
        CONFIG.db.port,
        CONFIG.db.db,
    );
    let option: ConnectOptions = ConnectOptions::new(database_uri)
        .sqlx_logging_level(LevelFilter::Trace)
        .sqlx_slow_statements_logging_settings(LevelFilter::Warn, Duration::from_secs(3))
        .to_owned();

    let conn = DB_CONN
        .get_or_try_init(|| async {
            tracing::info!("initializing connection");
            Database::connect(option).await
        })
        .await?;

    Ok(conn)
}

/// Returns an async PostgreSQL connection that can be used with [sea_orm] utilities.
pub async fn get_conn() -> Result<&'static DbConn, DbErr> {
    match DB_CONN.get() {
        Some(conn) => Ok(conn),
        None => init_conn().await,
    }
}

#[cfg(test)]
mod unit_test {
    use super::get_conn;
    use sea_orm::{prelude::*, DbBackend, Statement};

    #[tokio::test]
    #[cfg_attr(miri, ignore)] // can't call foreign function `geteuid` on OS `linux`
    async fn connect_sequential() {
        get_conn().await.unwrap();
        get_conn().await.unwrap();
        get_conn().await.unwrap();
        get_conn().await.unwrap();
        get_conn().await.unwrap();
    }

    #[tokio::test]
    #[cfg_attr(miri, ignore)] // can't call foreign function `geteuid` on OS `linux`
    async fn connect_concurrent() {
        let [c1, c2, c3, c4, c5] = [get_conn(), get_conn(), get_conn(), get_conn(), get_conn()];
        let _ = tokio::try_join!(c1, c2, c3, c4, c5).unwrap();
    }

    #[tokio::test]
    #[cfg_attr(miri, ignore)] // can't call foreign function `geteuid` on OS `linux`
    async fn connect_spawn() {
        let mut tasks = Vec::new();

        for _ in 0..5 {
            tasks.push(tokio::spawn(get_conn()));
        }
        for task in tasks {
            task.await.unwrap().unwrap();
        }
    }

    #[tokio::test]
    #[cfg_attr(miri, ignore)] // can't call foreign function `geteuid` on OS `linux`
    async fn access() {
        // DO NOT write any raw SQL query in the actual program
        // (with the exception of PGroonga features)
        get_conn()
            .await
            .unwrap()
            .execute(Statement::from_string(
                DbBackend::Postgres,
                "SELECT version()",
            ))
            .await
            .unwrap();
    }
}

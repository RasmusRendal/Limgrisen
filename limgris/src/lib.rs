pub mod types {
    use std::str::FromStr;

    use serenity::model::id::ChannelId;
    use sqlx::encode::IsNull;
    use sqlx::sqlite::{SqliteArgumentValue, SqliteTypeInfo};
    use sqlx::Type;
    use sqlx::{Encode, Sqlite, SqlitePool};

    #[derive(Debug, Clone)]
    pub struct Ctf {
        pub id: Option<i64>,
        pub snowflake: Option<String>,
        pub name: String,
    }

    impl Ctf {
        pub async fn create(
            pool: &SqlitePool,
            name: String,
            snowflake: ChannelId,
        ) -> anyhow::Result<Self> {
            let mut conn = pool.acquire().await?;
            let snowflake_str = snowflake.clone().to_string();
            let id = sqlx::query!(
                r#"INSERT INTO ctfs (name, snowflake) VALUES (?1, ?2)"#,
                name,
                snowflake_str
            )
            .execute(&mut *conn)
            .await?
            .last_insert_rowid();

            Ok(Self {
                id: Some(id.clone()),
                name: name,
                snowflake: Some(snowflake_str),
            })
        }

        pub async fn fetch_all(pool: &SqlitePool) -> anyhow::Result<Vec<Self>> {
            Ok(sqlx::query_as!(Ctf, "SELECT * FROM ctfs")
                .fetch_all(pool)
                .await?)
        }

        pub fn channel_id(&self) -> Option<ChannelId> {
            match &self.snowflake {
                Some(snowflake) => {
                    Some(ChannelId::from_str(snowflake.as_str()).expect("BBB"))
                }
                _ => None,
            }
        }
    }

    #[derive(Debug)]
    pub struct Challenge<'a> {
        pub id: Option<i64>,
        pub snowflake: Option<ChannelId>,
        pub name: String,
        pub category: Category,
        pub ctf: &'a Ctf,
    }

    impl<'a> Challenge<'a> {
        pub async fn create(
            pool: &SqlitePool,
            name: String,
            category: Category,
            ctf: &'a Ctf,
            snowflake: ChannelId,
        ) -> anyhow::Result<Self> {
            let mut conn = pool.acquire().await?;
            let snowflake_str = snowflake.clone().to_string();
            let ctf_id = ctf.clone().id;
            let cat_str = category.clone().to_string();

            let id = sqlx::query!(
                r#"INSERT INTO challenges (name, snowflake, category, ctf_id)
 VALUES (?1, ?2, ?3, ?4)"#,
                name,
                snowflake_str,
                cat_str,
                ctf_id
            )
            .execute(&mut *conn)
            .await?
            .last_insert_rowid();

            Ok(Self {
                id: Some(id),
                snowflake: Some(snowflake),
                name: name,
                category: category,
                ctf: ctf,
            })
        }
    }

    #[derive(Debug, Default, Clone)]
    pub enum Category {
        #[default]
        Web,
        Pwn,
        Crypto,
        Misc,
        Forensics,
        ReverseEngineering,
        Other(String),
    }

    impl From<String> for Category {
        fn from(item: String) -> Self {
            match item.as_str() {
                "web" => Self::Web,
                "pwn" => Self::Pwn,
                "crypto" => Self::Crypto,
                "misc" => Self::Misc,
                "for" => Self::Forensics,
                "rev" => Self::ReverseEngineering,
                _ => Self::Other(item),
            }
        }
    }

    impl Into<String> for Category {
        fn into(self) -> String {
            match self {
                Self::Web => String::from("web"),
                Self::Pwn => String::from("pwn"),
                Self::Crypto => String::from("crypto"),
                Self::Misc => String::from("misc"),
                Self::Forensics => String::from("for"),
                Self::ReverseEngineering => String::from("rev"),
                Self::Other(string) => String::from(string),
            }
        }
    }

    impl ToString for Category {
        fn to_string(&self) -> String {
            match self {
                Self::Web => String::from("web"),
                Self::Pwn => String::from("pwn"),
                Self::Crypto => String::from("crypto"),
                Self::Misc => String::from("misc"),
                Self::Forensics => String::from("for"),
                Self::ReverseEngineering => String::from("rev"),
                Self::Other(string) => String::from(string),
            }
        }
    }
}

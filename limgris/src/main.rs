mod commands;

use serenity::async_trait;
use serenity::builder::{
    CreateChannel, CreateInteractionResponse, CreateInteractionResponseMessage,
};
use serenity::model::application::{Command, Interaction};
use serenity::model::channel::{ChannelType, GuildChannel};
use serenity::model::gateway::Ready;
use serenity::model::id::{ChannelId, GuildId};
use serenity::prelude::*;

mod lib;
use crate::lib::types::{Category, Challenge, Ctf};

use sqlx::{
    migrate::MigrateDatabase,
    Sqlite,
    SqlitePool,
    Pool,
    Database
};

use std::collections::HashMap;
use std::env;

struct Handler {
    pool: SqlitePool 
}

#[async_trait]
impl EventHandler for Handler{
    async fn interaction_create(&self, ctx: Context, interaction: Interaction) {
        if let Interaction::Command(command) = interaction {
            println!("Received command interaction: {command:#?}");

            let content = match command.data.name.as_str() {
                "ping" => Some(commands::ping::run(&command.data.options())),
                "ctf" => Some(
                    commands::ctf::run(
                        &self.pool,
                        &ctx,
                        &command.guild_id,
                        &command.data.options(),
                    )
                    .await,
                ),
                "challenge" => {
                    Some(commands::challenge::run(&self.pool, &ctx, &command).await)
                }
                _ => Some("not implemented :(".to_string()),
            };

            if let Some(content) = content {
                let data =
                    CreateInteractionResponseMessage::new().content(content);
                let builder = CreateInteractionResponse::Message(data);
                if let Err(why) =
                    command.create_response(&ctx.http, builder).await
                {
                    println!("Cannot respond to slash command: {why}");
                }
            }
        }
    }

    async fn ready(&self, ctx: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
        let guild_id = GuildId::new(
            env::var("GUILD_ID")
                .expect("Expected GUILD_ID in environment")
                .parse()
                .expect("GUILD_ID must be an integer"),
        );

        // TODO: do better configuration
        let mut channel_cat_map: HashMap<String, Option<ChannelId>> =
            HashMap::new();
        channel_cat_map.insert("Current CTFs".to_string(), None);
        channel_cat_map.insert("Active Challenges".to_string(), None);
        channel_cat_map.insert("Completed Challenges".to_string(), None);
        channel_cat_map.insert("Archive".to_string(), None);

        println!("Searching for Guild Categories");
        if let Ok(channels) = guild_id.channels(&ctx.http).await {
            let guild_categories: Vec<(&ChannelId, &GuildChannel)> = channels
                .iter()
                .filter(|(_, y)| y.kind == ChannelType::Category)
                .collect();

            for (channel_id, channel_info) in guild_categories {
                if channel_cat_map.contains_key(&channel_info.name) {
                    channel_cat_map.insert(
                        channel_info.name.clone(),
                        Some(channel_id.clone()),
                    );
                }
            }
        };

        if channel_cat_map.iter().any(|(_, x)| *x == None) {
            println!("Missing required categories");
            for (name, id) in channel_cat_map.iter() {
                if *id == None {
                    let res = guild_id
                        .create_channel(
                            &ctx.http,
                            CreateChannel::new(name)
                                .kind(ChannelType::Category),
                        )
                        .await;
                    match res {
                        Ok(cat) => {
                            println!("Created category: {}", name);
                            println!("{:?}", cat)
                        },
                        Err(err) => {
                            println!("Error creating: {} - {:?}", name, err)
                        }
                    }
                }
            }
        }

        for (key, val) in channel_cat_map.iter() {
            if let Ok(mut conn) = self.pool.acquire().await {
                if let Some(id) = val {
                    let id_str = format!("{}", id.get());
                    let _ = sqlx::query!(
                        r#"
INSERT OR REPLACE INTO config (option, value) VALUES (?1, ?2)
"#,
                        key,
                        id_str
                    )
                    .execute(&mut *conn)
                    .await;
                }
            }
        }

        println!("Categories are setup");

        let commands = guild_id
            .set_commands(
                &ctx.http,
                vec![
                    commands::ping::register(),
                    commands::ctf::register(),
                    commands::challenge::register(),
                ],
            )
            .await;

        match commands {
            Ok(result) => println!("Commands are now setup!"),
            Err(err) => println!("Error: {:#?}", err),
        }

        //let guild_command =
        //Command::create_global_command(&ctx.http, commands::wonderful_command::register())
        //.await;

        //println!("I created the following global slash command: {guild_command:#?}");
    }
}


#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let token =
        env::var("DISCORD_TOKEN").expect("Expected a token in the environment");

    let DB_URL: String = env::var("DATABASE_URL")
        .expect("Expected \"DATABASE_URL\" in environment");


    if !Sqlite::database_exists(&DB_URL).await.unwrap_or(false){
        println!("Creating dabate {}", DB_URL);
        match Sqlite::create_database(&DB_URL).await {
            Ok(_) => println!("DB Created"),
            Err(error) => panic!("error: {}", error)
        }
    }


    let pool = SqlitePool::connect(&DB_URL)
        .await
        .expect("Error connecting to database");

    let migrations = std::path::Path::new("/var/lib/limgris").join("./migrations");
    let migration_results = sqlx::migrate::Migrator::new(migrations)
        .await
        .unwrap()
        .run(&pool)
        .await;
    match migration_results {
        Ok(_) => println!("Migration success"),
        Err(error) => {
            panic!("error: {}", error);
        }
    }
    println!("migration: {:?}", migration_results);



    let handler = Handler{pool};
    // Build our client.
    let mut client = Client::builder(token, GatewayIntents::empty())
        .event_handler(handler)
        .await
        .expect("Error creating client");
    // Finally, start a single shard, and start listening to events.
    //
    // Shards will automatically attempt to reconnect, and will perform exponential backoff until
    // it reconnects.
    if let Err(why) = client.start().await {
        println!("Client error: {why:?}");
    }

    Ok(())
}

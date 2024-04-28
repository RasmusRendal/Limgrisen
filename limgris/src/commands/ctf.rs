use crate::lib::types::Ctf;
use serenity::builder::{CreateChannel, CreateCommand, CreateCommandOption};
use serenity::client::Context;
use serenity::model::{
    application::{CommandOptionType, ResolvedOption, ResolvedValue},
    id::{ChannelId, GuildId},
};
use sqlx::sqlite::SqlitePool;
use std::str::FromStr;

async fn handle_create(
    pool: &SqlitePool,
    ctx: &Context,
    guild_id: &Option<GuildId>,
    sub_cmd: &ResolvedValue<'_>,
) -> String {
    let ResolvedValue::SubCommand(options) = sub_cmd else {
        panic!("Should not happen")
    };
    let ResolvedValue::String(name) = options[0].value else {
        panic!("Shouldn't happen")
    };
    let Some(guild) = guild_id else {
        panic!("Guild ID is None")
    };

    let act_cat = sqlx::query!(
        r#"SELECT value FROM config WHERE option = 'Current CTFs'"#
    )
    .fetch_one(pool)
    .await
    .unwrap()
    .value
    .unwrap();

    let guild_channel = guild
        .create_channel(
            &ctx.http,
            CreateChannel::new(name.clone()).category(ChannelId::new(
                u64::from_str(&act_cat).expect("Can't convert string to u64"),
            )),
        )
        .await;

    match guild_channel {
        Ok(chan) => {
            let ctf = Ctf::create(pool, name.to_string(), chan.id).await;
            format!("Created CTF channel {}", name).to_string()
        }
        Err(err) => {
            println!("{:#?}", err);
            "Error occured during creation of Channel, please check the logs for more details".to_string()
        }
    }
}

pub async fn run(
    pool: &SqlitePool,
    ctx: &Context,
    guild_id: &Option<GuildId>,
    options: &[ResolvedOption<'_>],
) -> String {
    println!("{:?}", options);

    match options[0].name {
        "create" => {
            handle_create(pool, &ctx, &guild_id, &options[0].value).await
        }
        "archive" => "Archiving [NOT IMPLEMENTED]".to_string(),
        "export" => "Exporting [NOT IMPLEMENTED]".to_string(),
        _ => "Not implemented".to_string(),
    }
}

pub fn register() -> CreateCommand {
    CreateCommand::new("ctf")
        .description("Command for managing CTF Competitions")
        .set_options(vec![
            CreateCommandOption::new(
                CommandOptionType::SubCommand,
                "create",
                "Used to create a CTF",
            )
            .set_sub_options(vec![CreateCommandOption::new(
                CommandOptionType::String,
                "name",
                "Name of CTF to be created",
            )
            .required(true)]),
            CreateCommandOption::new(
                CommandOptionType::SubCommand,
                "archive",
                "Used to archive a CTF",
            )
            .set_sub_options(vec![CreateCommandOption::new(
                CommandOptionType::Channel,
                "channel",
                "Channel of the CTF to be archived",
            )]),
            CreateCommandOption::new(
                CommandOptionType::SubCommand,
                "export",
                "Used to export a CTF",
            ),
        ])
}

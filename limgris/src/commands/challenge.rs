use crate::lib::types::{Category, Challenge, Ctf};
use serenity::all::{
    CommandData, CommandInteraction, PartialChannel, User, UserId,
};
use serenity::builder::{
    CreateChannel, CreateCommand, CreateCommandOption, CreateMessage,
    EditChannel,
};
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
    channel_id: &ChannelId,
    sub_cmd: &ResolvedValue<'_>,
) -> String {
    if let Ok(ctf) = Ctf::fetch_by_snowflake(pool, channel_id).await {
        let ResolvedValue::SubCommand(options) = sub_cmd else {
            panic!("Should not happen")
        };

        let ResolvedValue::String(tmp_cat) = options[0].value else {
            panic!("Shouldn't happen")
        };

        let ResolvedValue::String(name) = options[1].value else {
            panic!("Shouldn't happen")
        };

        let category = match Category::from(tmp_cat.to_string()) {
            Category::Other(cat) => {
                if options.len() == 3 {
                    let ResolvedValue::String(other_type) = options[2].value
                    else {
                        panic!("Shouldn't happen")
                    };
                    Category::from(other_type.to_string())
                } else {
                    return "Option `other_type` is required for Category `Other`"
                    .to_string();
                }
            }
            default => default,
        };

        let Some(guild) = guild_id else {
            panic!("Guild ID is None")
        };

        let act_cat = sqlx::query!(
            r#"SELECT value FROM config WHERE option = 'Active Challenges'"#
        )
        .fetch_one(pool)
        .await
        .unwrap()
        .value
        .unwrap();

        let chan_name =
            format!("{}-{}-{}", &ctf.name, &category.to_string(), &name)
                .to_string();

        let guild_channel = guild
            .create_channel(
                &ctx.http,
                CreateChannel::new(chan_name).category(ChannelId::new(
                    u64::from_str(&act_cat)
                        .expect("Can't convert string to u64"),
                )),
            )
            .await;

        match guild_channel {
            Ok(chan) => {
                let challenge = Challenge::create(
                    pool,
                    name.to_string(),
                    category,
                    &ctf,
                    chan.id,
                )
                .await;
                format!("Created challenge channel {}", name).to_string()
            }
            Err(err) => {
                println!("{:#?}", err);
                "Error occured during creation of Channel, please check the logs for more details".to_string()
            }
        }
    } else {
        "Not a CTF channel".to_string()
    }
}

async fn handle_done(
    pool: &SqlitePool,
    ctx: &Context,
    guild_id: &Option<GuildId>,
    channel_id: &ChannelId,
    user: &User,
    sub_cmd: &ResolvedValue<'_>,
) -> String {
    let ResolvedValue::SubCommand(options) = sub_cmd else {
        panic!("Should not happen")
    };

    let completed_cat = sqlx::query!(
        r#"SELECT value FROM config WHERE option = 'Completed Challenges'"#
    )
    .fetch_one(pool);
    let challenge_res = Challenge::fetch_by_snowflake(pool, channel_id);

    let user_id = user.id;

    let mut credit: String = String::new();

    match challenge_res.await {
        Ok(challenge) => {
            if options.len() == 1 {
                if let ResolvedValue::String(tcredit) = options[0].value {
                    credit = format!(
                        "Challenge `{}` completed by: <@{}> {}",
                        &challenge.name, user_id, tcredit
                    );
                };
            } else {
                credit = format!("Challenge `{}` completed by: <@{}>", &challenge.name, user_id);
            }
            println!("{:?}", challenge);
            if let Some(chall_chan) = challenge.channel_id() {
                let completed_id = match ChannelId::from_str(
                    completed_cat.await.unwrap().value.unwrap().as_str(),
                ) {
                    Ok(res) => res,
                    Err(err) => {
                        println!("{:#?}", err);
                        return "Error occured".to_string();
                    }
                };
                let editor = EditChannel::new().category(completed_id);
                match chall_chan.edit(&ctx.http, editor).await {
                    Err(err) => {
                        println!("{:#?}", err);
                        return "Error occured".to_string();
                    }
                    Ok(_) => {}
                };
            }

            if let Some(ctf_channel) = challenge.ctf.channel_id() {
                match ctf_channel
                    .send_message(
                        &ctx.http,
                        CreateMessage::new().content(&credit),
                    )
                    .await
                {
                    Ok(_) => {}
                    Err(err) => {
                        println!("{:#?}", err);
                        return "Error occured".to_string();
                    }
                };
            }

            credit
        }
        Err(err) => {
            println!("{:#?}", err);
            "Error occured".to_string()
        }
    }
}

pub async fn run(
    pool: &SqlitePool,
    ctx: &Context,
    command: &CommandInteraction,
) -> String {
    match command.data.options()[0].name {
        "create" => {
            handle_create(
                &pool,
                &ctx,
                &command.guild_id,
                &command.channel_id,
                &command.data.options()[0].value,
            )
            .await
        }
        "done" => {
            handle_done(
                &pool,
                &ctx,
                &command.guild_id,
                &command.channel_id,
                &command.user,
                &command.data.options()[0].value,
            )
            .await
        }
        _ => "Not implemented".to_string(),
    }
}

pub fn register() -> CreateCommand {
    CreateCommand::new("challenge")
        .description("Command for handling CTF challenges")
        .set_options(vec![
            CreateCommandOption::new(
                CommandOptionType::SubCommand,
                "create",
                "Used to create a challenge",
            )
            .set_sub_options(vec![
                CreateCommandOption::new(
                    CommandOptionType::String,
                    "category",
                    "Challenge category",
                )
                .required(true)
                .add_string_choice("Web", Category::Web)
                .add_string_choice("Pwn", Category::Pwn)
                .add_string_choice("Crypto", Category::Crypto)
                .add_string_choice("Forensics", Category::Forensics)
                .add_string_choice("Misc", Category::Misc)
                .add_string_choice(
                    "Reverse Engineering",
                    Category::ReverseEngineering,
                )
                .add_string_choice(
                    "Other",
                    Category::Other("other".to_string()),
                ),
                CreateCommandOption::new(
                    CommandOptionType::String,
                    "name",
                    "Name of the challenge",
                )
                .required(true),
                CreateCommandOption::new(
                    CommandOptionType::String,
                    "other_type",
                    "Name of unexpected category",
                ),
            ]),
            CreateCommandOption::new(
                CommandOptionType::SubCommand,
                "done",
                "Used to mark a challenge as done",
            )
            .set_sub_options(vec![CreateCommandOption::new(
                CommandOptionType::String,
                "credit",
                "Channel of the CTF to be archived",
            )]),
        ])
}

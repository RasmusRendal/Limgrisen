pub mod types {
    use serenity::model::id::ChannelId;

    #[derive(Debug)]
    pub struct Ctf {
        id: u64,
        snowflake: ChannelId,
        pub name: String,
    }



    #[derive(Debug)]
    pub struct Challenge {
        id: u64,
        snowflake: ChannelId,
        pub name: String,
        pub category: Category,
    }

    #[derive(Debug)]
    pub enum Category {
        Web,
        Pwn,
        Crypto,
        Misc,
        Forensics,
        Other(String),
    }
}

let
  moz_overlay = import (builtins.fetchTarball https://github.com/mozilla/nixpkgs-mozilla/archive/master.tar.gz);
  pkgs = import <nixpkgs> {overlays = [moz_overlay];};
  rustChannel = pkgs.rustChannelOf {
    channel = "stable";
  };
  rust = (rustChannel.rust.override {
    extensions = ["rust-src" "rust-analysis"];
  });
  discordtoken = import ./discord_token.nix;
  guildid = import ./guild_id.nix;
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    cargo
    rustfmt
    clippy
    rust
    pkg-config
    sqlx-cli
  ];

  nativeBuildInputs = with pkgs; [
    openssl
  ];

  shellHook = ''
      export DISCORD_TOKEN=${discordtoken}
      export GUILD_ID=${guildid}
  '';
}

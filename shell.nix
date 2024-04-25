let
  moz_overlay = import (builtins.fetchTarball https://github.com/mozilla/nixpkgs-mozilla/archive/master.tar.gz);
  pkgs = import <nixpkgs> {overlays = [moz_overlay];};
  discordtoken = import ./discord_token.nix;
  guildid = import ./guild_id.nix;
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    cargo
    rustfmt
    clippy
    latest.rustChannels.nightly.rust
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

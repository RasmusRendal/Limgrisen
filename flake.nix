{
  description = "Flake for using Limgrisen";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable-small";
    import-cargo.url = "github:edolstra/import-cargo";
  };

  outputs = { self, nixpkgs, import-cargo }:
    let
      version = self.lastModifiedDate or self.lastModified or "19700101";
      # System types to support.
      supportedSystems = [ "x86_64-linux" ];
      # Helper function to generate an attrset '{ x86_64-linux = f "x86_64-linux"; ... }'.
      forAllSystems = f:
        nixpkgs.lib.genAttrs supportedSystems (system: f system);
      # Nixpkgs instantiated for supported system types.
      nixpkgsFor = forAllSystems (system:
        import nixpkgs {
          inherit system;
          overlays = [ self.overlay ];
        });
    in {
      overlay = final: prev: {
        limgrisen = with final;
          final.callPackage ({ inShell ? false }:
            stdenv.mkDerivation rec {
              name = "limgrisen-${version}";

              # In 'nix develop', we don't need a copy of the source tree
              # in the Nix store.
              src = if inShell then null else ./limgris;

              nativeBuildInputs = [
                openssl
              ];
              
              buildInputs = [
                rustc
                cargo
                pkg-config
                sqlx-cli
              ] ++ (if inShell then [
                # In 'nix develop', provide some developer tools.
                rustfmt
                clippy
              ] else
                [
                  (import-cargo.builders.importCargo {
                    lockFile = ./limgris/Cargo.lock;
                    inherit pkgs;
                  }).cargoHome
                ]);

              target = "--release";

              buildPhase = ''cargo build ${target} --frozen --offline'';

              doCheck = true;

              checkPhase = "cargo test ${target} --frozen --offline";

              installPhase = ''
                mkdir -p $out
                mkdir -p $out/lib
                cp -r ./migrations $out/lib
                cargo install --frozen --offline --path . --root $out
                rm $out/.crates.toml
              '';
            }) { };
      };
      packages =
        forAllSystems (system: { inherit (nixpkgsFor.${system}) limgrisen; });

      defaultPackage =
        forAllSystems (system: self.packages.${system}.limgrisen);
      devShell = forAllSystems
        (system: self.${system}.limgrisen.override { inShell = true; });
      nixosModules.limgrisen = 
        {config, lib, pkgs, ...}:
        with lib;
        let
          # FIX THIS SHIT
          limgris = self.packages.x86_64-linux.limgrisen;
          cfg = config.services.limgrisen;
        in
        {
          options.services.limgrisen = {
            enable = mkEnableOption "Limgris service";
            discordGuildId = mkOption {
              type = types.str;
            };
            discordToken = mkOption {
              type = types.str;
            };
            databaseUrl = mkOption {
              type = types.str;
            };
          };

          config = mkIf cfg.enable {
            systemd.services.limgrisen = {
              description = "Jutlandia Limgrisen service";
              after = [
                "network.target"
              ];
              wantedBy = [ "multi-user.target" ];
              environment = {
                GUILD_ID = cfg.discordGuildId;
                DISCORD_TOKEN = cfg.discordToken;
                DATABASE_URL = cfg.databaseUrl;
                LIMGRIS_LIB_DIR = "${limgris}/lib";
              };
              serviceConfig = {
                PermissionsStartOnly = true;
                LimitNPROC = 512;
                LimitNOFILE = 1048576;
                NoNewPrivileges = true;
                DynamicUser = true;
                ExecStart = ''${limgris}/bin/limgris'';
                Restart = "on-failure";
              };
            };
          };
      };
    };
}

let
  moz_overlay = import (builtins.fetchTarball https://github.com/mozilla/nixpkgs-mozilla/archive/master.tar.gz);
  pkgs = import <nixpkgs> {overlays = [moz_overlay];};
in
pkgs.mkShell {
  buildInputs = with pkgs; [
	  cargo
	  rustfmt
    clippy
    latest.rustChannels.nightly.rust
  ];
}

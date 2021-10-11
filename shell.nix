{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/f8a57ef0e16f1ce5c340b3ba55d35acfe2336869.tar.gz") {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs-16_x
  ];
}

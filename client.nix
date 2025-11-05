{ nixpkgs ? <nixpkgs>
, config ? {}
}:

let
  pkgs = import nixpkgs config;
in
pkgs.stdenvNoCC.mkDerivation {
  name = "imitation-game-client";
  src = ./.;
  nativeBuildInputs = [
    pkgs.bun
    pkgs.nodejs_24
  ];
  buildPhase = ''
    bun install
    patchShebangs node_modules/
    bun run build:client
  '';
  installPhase = ''
    mkdir "$out"
    cp -r packages/client/dist/* "$out"
  '';
}

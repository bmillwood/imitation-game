{ nixpkgs ? <nixpkgs>
, config ? {}
}:

let
  pkgs = import nixpkgs config;
  inherit (pkgs) lib stdenvNoCC;
in
stdenvNoCC.mkDerivation {
  name = "imitation-game-client";
  src = ./.;
  nativeBuildInputs = [
    pkgs.bun
    pkgs.nodejs_24
  ];
  bunDeps = stdenvNoCC.mkDerivation {
    name = "imitation-game-client-deps";
    src = ./.;
    nativeBuildInputs = [
      pkgs.bun
      pkgs.nodejs_24
    ];
    buildPhase = ''
      mkdir bun-cache
      bun install --frozen-lockfile --cache-dir=bun-cache
      while read -r -d $'\0' f; do
        # relativize symlinks
        target=$(readlink -f "$f")
        [[ "$target" == /build/* ]] || continue
        ln -nsrf "$target" "$f"
      done < <(find bun-cache -type l -print0)
      rmdir bun-cache/.tmp || true # I don't know why this exists sometimes
    '';
    installPhase = ''
      cp -r bun-cache $out/
    '';
    dontPatchShebangs = true;
    outputHash = "sha256-Zcf/kVP8m0Ina5Ky09SJeKyCF1IJpnn7HE7OABt8iic=";
    outputHashMode = "nar";
  };
  buildPhase = ''
    export BUN_TMPDIR=$(mktemp -d)
    export BUN_INSTALL_CACHE_DIR=$BUN_TMPDIR/bun-cache
    mkdir $BUN_INSTALL_CACHE_DIR
    cp -r $bunDeps/* $BUN_INSTALL_CACHE_DIR
    bun install --frozen-lockfile
    # work around https://github.com/NixOS/nixpkgs/issues/462298
    chmod -R go-w node_modules
    patchShebangs node_modules/
    bun run build:client --base=./
  '';
  installPhase = ''
    mkdir "$out"
    cp -r packages/client/dist/* "$out"
  '';
}

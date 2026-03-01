{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.bun
    pkgs.typescript
  ];

  packages = [
    (pkgs.python3.withPackages (pypkgs: with pypkgs; [
      datamodel-code-generator
      websockets
    ]))
  ];

  shellHook = ''
    echo "Chat app dev environment"
    echo "Bun version: $(bun --version)"
    echo ""
    echo "To get started:"
    echo "  bun install"
    echo "  bun run dev:server  # in one terminal"
    echo "  bun run dev:client  # in another terminal"
  '';
}

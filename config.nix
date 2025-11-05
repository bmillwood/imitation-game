{ config, lib, pkgs, ... }:
let
  cfg = config.services.imitation-game;
  inherit (lib) mkIf mkOption types;
  user = "imitation-game";
  home = "/var/lib/imitation-game";
  clientFiles = pkgs.callPackage ./client.nix {};
in
{
  options = {
    services.imitation-game = {
      enable = lib.mkEnableOption "imitation-game";

      virtualHost = mkOption {
        type = types.str;
      };
      path = mkOption {
        type = types.str;
        default = "/";
      };
      port = mkOption {
        type = types.port;
        default = 21900;
      };
      user = mkOption {
        type = types.str;
        default = "imitation-game";
      };
    };
  };
  config = mkIf cfg.enable {
    systemd.services.imitation-server = {
      wantedBy = [ "multi-user.target" ];
      path = [
        pkgs.bun
      ];
      script = ''
        rm -rf cwd
        cp -r ${./.} cwd
        cd cwd
        bun run start:server
      '';
      serviceConfig = {
        User = user;
        WorkingDirectory = home;
      };
      environment = {
        PORT = builtins.toString cfg.port;
      };
    };
    services.nginx = {
      enable = true;
      virtualHosts.${cfg.virtualHost} = {
        forceSSL = true;
        enableACME = true;
        locations.${cfg.path} = {
          root = "${clientFiles}";
          tryFiles = "$uri /index.html =404";
        };
        locations."${cfg.path}/ws" = {
          proxyPass = "http://127.0.0.1:${builtins.toString cfg.port}";
          recommendedProxySettings = true;
        };
      };
    };
    users.groups.${user} = {};
    users.users.${user} = {
      isSystemUser = true;
      group = user;
      home = home;
      createHome = true;
    };
  };
}

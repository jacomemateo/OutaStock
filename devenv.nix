{pkgs, ...}: {
  languages.go = {
    enable = true;
    package = pkgs.go;
    lsp.enable = true;
  };

  packages = with pkgs; [
    air
    pgformatter
    gotools
    gopls
    nodejs
  ];


  git-hooks.hooks.treefmt.enable = true;

  treefmt = {
    projectRootFile = "flake.nix"; # Tells treefmt where the root of your project is
    programs = {
      gofmt.enable = true;
      goimports.enable = true;
    };
  };

  enterShell = ''
    echo "Go devenv ready, and node too"
  '';

  # services.postgres = {
  #   enable = true;
  #   initialDatabases = [ { name = "app"; } ];
  # };
  #
  # processes = {
  #   app.exec = "air";
  # };
}

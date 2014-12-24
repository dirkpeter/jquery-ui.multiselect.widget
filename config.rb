# default to development if environment is not set.
saved = environment
if (environment.nil?)
  environment = :production
  css_dir = "dst"
else
  environment = :development
  css_dir = "src"
end

# folders and stuff
sass_dir = "sass"

# compass plugins
require 'sass-globbing'

# config
output_style = (environment == :production) ? :compressed : :nested
relative_assets = true

# Conditionally enable line comments when in development mode.
line_comments = (environment == :production) ? false : true

# Output debugging info in development mode.
sass_options = (environment == :production) ? {} : {sourcemap: true}

# Add the 'sass' directory itself as an import path to ease imports.
add_import_path 'sass'

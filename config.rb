# default to development if environment is not set.
saved = environment
if (environment.nil?)
  environment = :development
else
  environment = saved
end

# folders and stuff
css_dir = "src"
sass_dir = "sass"

# compass plugins
require 'sass-globbing'

# config
output_style = (environment == :production) ? :expanded : :nested
relative_assets = true

# Conditionally enable line comments when in development mode.
line_comments = (environment == :production) ? false : true

# Output debugging info in development mode.
sass_options = (environment == :production) ? {} : {sourcemap: true}

# Add the 'sass' directory itself as an import path to ease imports.
add_import_path 'sass'

source 'https://rubygems.org'

group :development do

  # Sass, Compass and extensions.
  gem 'sass', '~>3.4.5'                 # Sass.
  gem 'sass-globbing'                   # Import Sass files based on globbing pattern.
  gem 'compass'                         # Framework built on Sass.

  # Guard
  gem 'guard'                           # Guard event handler.
  gem 'guard-compass'                   # Compile on sass/scss change.
  gem 'guard-shell'                     # Run shell commands.
  gem 'guard-livereload', '~> 2.3.0'    # Browser reload.
  gem 'yajl-ruby'                       # Faster JSON with LiveReload in the browser.

  # Dependency to prevent polling. Setup for multiple OS environments.
  # Optionally remove the lines not specific to your OS.
  # https://github.com/guard/guard#efficient-filesystem-handling
  gem 'rb-inotify', '~> 0.9', :require => false      # Linux
  gem 'rb-fsevent', :require => false                # Mac OSX
  gem 'rb-fchange', :require => false                # Windows

end

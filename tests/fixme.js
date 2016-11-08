var fixme = require('fixme');

fixme({
  path:                 process.cwd(),
  ignored_directories:  ['node_modules/**', '.git/**', '.hg/**'],
  file_patterns:        ['**/*.js', '**/*.scss', '**/*.sh'],
  file_encoding:        'utf8',
  line_length_limit:    1000
});
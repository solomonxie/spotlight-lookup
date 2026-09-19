const path = require('path');

module.exports = {
  project: { ios: {} },
  dependencies: {
    'spotlight-index': { root: path.join(__dirname, 'modules/spotlight-index') },
    'text-file-picker': { root: path.join(__dirname, 'modules/text-file-picker') },
  },
};

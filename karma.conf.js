const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        { 
          pattern: 'test/**/*.test.js', 
          type: 'module' 
        },
      ],
      esm: {
        // if you are using 'bare module imports' you will need this option
        nodeResolve: true,
      }
    }),
  );
  return config;
};
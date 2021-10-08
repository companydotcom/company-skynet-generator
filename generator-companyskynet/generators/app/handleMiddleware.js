const { middleware } = require('@companydotcom/company-skynet-core');

module.exports.getAvailableMiddleware = () => {
  const middlewareNames = Object.keys(middleware);
  return middlewareNames;
}

const defaultMiddlewareSettings = `     {
      isBulk: [true, false],
      eventType: [\'fetch\', \'transition\', \'webhook\'],
    },
`

module.exports.generateMiddlewareIndex = (customMiddlewareNames, skynetMiddlewareInUse) => {
  const imports = ``;
  const exports = [];
  if (skynetMiddlewareInUse.length) {
    imports = imports.concat(`import { middleware } from '@companydotcom/company-skynet-core'\n`)
  }

  skynetMiddlewareInUse.forEach((name) => {
    exports = exports.concat(`  {
    middleware: middleware.${name},
    settings: ${defaultMiddlewareSettings}
  },
`);
  });

  customMiddlewareNames.forEach((name) => {
    imports = imports.concat(`import { ${name} } from './${name}'\n`);
  });

  customMiddlewareNames.forEach((name) => {
    exports.push({
      middleware: name,
      settings: defaultMiddlewareSettings,
    });
  });

  return {
    imports,
    exports,
  }
}
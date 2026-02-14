/**
 * Dependency Analyzer - analyzes external dependencies
 */

/**
 * Analyze dependencies from parsed files
 * @param {Array} parsedFiles - Array of parsed file objects
 * @returns {Array} List of dependencies with usage information
 */
function analyze(parsedFiles) {
  const dependencyMap = new Map();

  for (const file of parsedFiles) {
    if (!file.ast) continue;

    const ast = file.ast;

    // Process imports
    if (ast.imports) {
      for (const imp of ast.imports) {
        const source = imp.source;
        if (!source) continue;

        // Skip relative imports
        if (source.startsWith('.') || source.startsWith('/')) {
          continue;
        }

        // Extract package name
        const packageName = extractPackageName(source);

        if (dependencyMap.has(packageName)) {
          const dep = dependencyMap.get(packageName);
          dep.usageCount++;
          dep.usages.push({
            file: file.relativePath,
            statement: imp.statement
          });
        } else {
          dependencyMap.set(packageName, {
            name: packageName,
            version: null,
            usageCount: 1,
            type: imp.type,
            usages: [{
              file: file.relativePath,
              statement: imp.statement
            }]
          });
        }
      }
    }
  }

  // Try to get version from package.json
  const pkgJson = parsedFiles.find(f => f.path.endsWith('package.json'));
  if (pkgJson && pkgJson.ast && pkgJson.ast.data) {
    const pkg = pkgJson.ast.data;
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    for (const [name, version] of Object.entries(deps)) {
      if (dependencyMap.has(name)) {
        const dep = dependencyMap.get(name);
        dep.version = version;
      }
    }
  }

  return Array.from(dependencyMap.values())
    .sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * Extract package name from import source
 */
function extractPackageName(source) {
  // Handle scoped packages
  if (source.startsWith('@')) {
    const parts = source.split('/');
    return parts.slice(0, 2).join('/');
  }

  // Handle regular packages
  const parts = source.split('/');
  return parts[0];
}

/**
 * Categorize dependencies
 */
function categorize(dependencies) {
  const categories = {
    framework: [],
    library: [],
    dev: [],
    unknown: []
  };

  const frameworkPatterns = [
    'react', 'vue', 'angular', 'svelte', 'next', 'nuxt',
    'express', 'fastify', 'koa', 'hapi',
    'django', 'flask', 'fastapi', 'rails', 'laravel',
    'spring', 'nest'
  ];

  const devPatterns = [
    'jest', 'mocha', 'chai', 'eslint', 'prettier',
    'webpack', 'vite', 'rollup', 'parcel',
    'typescript', '@types', 'ts-node',
    'nodemon', 'tsc', 'babel'
  ];

  for (const dep of dependencies) {
    const name = dep.name.toLowerCase();

    if (frameworkPatterns.some(p => name.includes(p))) {
      categories.framework.push(dep);
    } else if (devPatterns.some(p => name.includes(p))) {
      categories.dev.push(dep);
    } else {
      categories.library.push(dep);
    }
  }

  return categories;
}

/**
 * Find potential migration blockers
 */
function findMigrationBlockers(dependencies, targetFramework) {
  const blockers = [];

  const compatibilityMap = {
    'fastify': {
      incompatible: ['express', 'koa', 'hapi'],
      replacement: {
        'express': 'fastify',
        'koa': 'fastify',
        'hapi': 'fastify'
      }
    },
    'react-functional': {
      incompatible: ['react-classes'],
      replacement: {}
    },
    'typescript': {
      incompatible: [],
      replacement: {}
    }
  };

  const compat = compatibilityMap[targetFramework];
  if (!compat) return blockers;

  for (const dep of dependencies) {
    const name = dep.name.toLowerCase();

    for (const incompatible of compat.incompatible) {
      if (name.includes(incompatible)) {
        blockers.push({
          dependency: dep.name,
          reason: `Incompatible with ${targetFramework}`,
          suggestion: compat.replacement[incompatible] || 'Find alternative'
        });
      }
    }
  }

  return blockers;
}

module.exports = {
  analyze,
  categorize,
  findMigrationBlockers,
  extractPackageName
};

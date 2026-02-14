/**
 * Migration Paths - defines available migration paths between frameworks/languages
 */

// Migration paths database
const MIGRATION_PATHS = {
  // JavaScript/TypeScript migrations
  'javascript-typescript': {
    source: 'JavaScript',
    target: 'TypeScript',
    type: 'language',
    difficulty: 'medium',
    description: 'Add static type annotations to JavaScript code',
    tools: ['typescript', 'tsc', '@typescript-eslint/eslint-plugin']
  },
  'typescript-javascript': {
    source: 'TypeScript',
    target: 'JavaScript',
    type: 'language',
    difficulty: 'easy',
    description: 'Remove type annotations from TypeScript code',
    tools: []
  },

  // React migrations
  'react-class-functional': {
    source: 'React',
    target: 'React Functional',
    type: 'pattern',
    difficulty: 'medium',
    description: 'Convert class components to functional components with hooks',
    tools: ['react-hooks']
  },
  'react-functional-class': {
    source: 'React Functional',
    target: 'React',
    type: 'pattern',
    difficulty: 'hard',
    description: 'Convert functional components to class components',
    tools: []
  },

  // Node.js framework migrations
  'express-fastify': {
    source: 'Express.js',
    target: 'Fastify',
    type: 'framework',
    difficulty: 'medium',
    description: 'Migrate from Express.js to Fastify for better performance',
    tools: ['fastify']
  },
  'express-koa': {
    source: 'Express.js',
    target: 'Koa',
    type: 'framework',
    difficulty: 'medium',
    description: 'Migrate from Express.js to Koa middleware-style framework',
    tools: ['koa', 'koa-router']
  },
  'fastify-express': {
    source: 'Fastify',
    target: 'Express.js',
    type: 'framework',
    difficulty: 'easy',
    description: 'Migrate from Fastify to Express.js',
    tools: []
  },

  // jQuery migrations
  'jquery-vanilla': {
    source: 'jQuery',
    target: 'Vanilla JavaScript',
    type: 'library',
    difficulty: 'hard',
    description: 'Replace jQuery with native DOM APIs',
    tools: []
  },
  'jquery-react': {
    source: 'jQuery',
    target: 'React',
    type: 'framework',
    difficulty: 'hard',
    description: 'Replace jQuery with React components',
    tools: ['react', 'react-dom']
  },

  // Python migrations
  'python2-python3': {
    source: 'Python 2',
    target: 'Python 3',
    type: 'language',
    difficulty: 'medium',
    description: 'Migrate Python 2 code to Python 3',
    tools: ['2to3', 'futurize']
  },
  'flask-fastapi': {
    source: 'Flask',
    target: 'FastAPI',
    type: 'framework',
    difficulty: 'medium',
    description: 'Migrate from Flask to FastAPI for async support',
    tools: ['fastapi', 'pydantic']
  },
  'django-flask': {
    source: 'Django',
    target: 'Flask',
    type: 'framework',
    difficulty: 'hard',
    description: 'Simplify from Django to Flask micro-framework',
    tools: ['flask']
  },

  // Vue migrations
  'vue2-vue3': {
    source: 'Vue 2',
    target: 'Vue 3',
    type: 'framework',
    difficulty: 'medium',
    description: 'Migrate Vue 2 application to Vue 3',
    tools: ['@vue/compat']
  },
  'vue-react': {
    source: 'Vue.js',
    target: 'React',
    type: 'framework',
    difficulty: 'hard',
    description: 'Convert Vue components to React',
    tools: ['react']
  },

  // Angular migrations
  'angular-react': {
    source: 'Angular',
    target: 'React',
    type: 'framework',
    difficulty: 'hard',
    description: 'Convert Angular application to React',
    tools: ['react']
  },
  'angular-vue': {
    source: 'Angular',
    target: 'Vue.js',
    type: 'framework',
    difficulty: 'hard',
    description: 'Convert Angular application to Vue.js',
    tools: ['vue']
  }
};

// Reverse mappings for bi-directional migrations
const REVERSE_PATHS = {};
for (const [key, path] of Object.entries(MIGRATION_PATHS)) {
  const reverseKey = `${path.target.toLowerCase()}-${path.source.toLowerCase()}`.replace(/\s+/g, '-');
  REVERSE_PATHS[reverseKey] = {
    ...path,
    source: path.target,
    target: path.source
  };
}

const ALL_PATHS = { ...MIGRATION_PATHS, ...REVERSE_PATHS };

/**
 * Find migration path between source and target
 */
function findPath(source, target) {
  const sourceLower = source.toLowerCase();
  const targetLower = target.toLowerCase();

  // Try direct match
  const key = `${sourceLower}-${targetLower}`;
  if (ALL_PATHS[key]) {
    return ALL_PATHS[key];
  }

  // Try alternate naming
  const altKey = findAlternateKey(sourceLower, targetLower);
  if (altKey && ALL_PATHS[altKey]) {
    return ALL_PATHS[altKey];
  }

  return null;
}

/**
 * Find migration path using alternate naming
 */
function findAlternateKey(source, target) {
  // Common framework aliases
  const aliases = {
    'react': ['react', 'reactjs'],
    'vue': ['vue', 'vue.js', 'vuejs'],
    'vue.js': ['vue', 'vuejs'],
    'angular': ['angular', 'angularjs', 'angular2'],
    'express': ['express', 'express.js'],
    'express.js': ['express'],
    'fastify': ['fastify'],
    'flask': ['flask'],
    'django': ['django'],
    'javascript': ['javascript', 'js'],
    'typescript': ['typescript', 'ts'],
    'python': ['python', 'py'],
    'python 2': ['python2', 'python-2', 'py2'],
    'python 3': ['python3', 'python-3', 'py3'],
    'jquery': ['jquery', 'jqueryjs'],
    'vanilla javascript': ['vanilla', 'vanilla-js', 'javascript']
  };

  for (const [canonical, variants] of Object.entries(aliases)) {
    if (variants.includes(source) || variants.includes(target)) {
      // Try to find a path with canonical names
      const key = `${canonical}-${canonical}`;
      if (ALL_PATHS[key]) {
        return key;
      }
    }
  }

  return null;
}

/**
 * Get all supported targets for a source
 */
function getTargetsForSource(source) {
  const sourceLower = source.toLowerCase();
  const targets = [];

  for (const [key, path] of Object.entries(ALL_PATHS)) {
    if (path.source.toLowerCase() === sourceLower) {
      targets.push({
        target: path.target,
        difficulty: path.difficulty,
        type: path.type
      });
    }
  }

  return targets;
}

/**
 * Get all supported targets
 */
function getSupportedTargets() {
  const targets = new Set();

  for (const path of Object.values(ALL_PATHS)) {
    targets.add(path.target);
  }

  return Array.from(targets);
}

/**
 * Get all supported sources
 */
function getSupportedSources() {
  const sources = new Set();

  for (const path of Object.values(ALL_PATHS)) {
    sources.add(path.source);
  }

  return Array.from(sources);
}

/**
 * Get migration info
 */
function getMigrationInfo(source, target) {
  const path = findPath(source, target);

  if (!path) {
    return {
      available: false,
      message: `No migration path available from ${source} to ${target}`
    };
  }

  return {
    available: true,
    ...path
  };
}

module.exports = {
  findPath,
  getTargetsForSource,
  getSupportedTargets,
  getSupportedSources,
  getMigrationInfo,
  MIGRATION_PATHS,
  ALL_PATHS
};

/**
 * Planner - generates step-by-step migration plans
 */

/**
 * Generate migration steps
 */
function generateSteps(analysis, target, path, risk) {
  const steps = [];
  const targetLower = target.toLowerCase();

  // Common preparation steps
  steps.push({
    priority: 'high',
    title: 'Backup and Version Control',
    description: 'Create a backup of your codebase and ensure all changes are committed to version control.',
    affectedFiles: 'All files',
    code: '# Ensure you have a clean git state\ngit add .\ngit commit -m "Pre-migration backup"'
  });

  steps.push({
    priority: 'high',
    title: 'Set Up Development Environment',
    description: 'Set up a separate development environment for the migration to avoid affecting production.',
    affectedFiles: 'Environment configuration',
    code: '# Create a new branch for migration\ngit checkout -b migration/' + targetLower.replace(/\s+/g, '-')
  });

  // TypeScript migration steps
  if (targetLower === 'typescript') {
    steps.push({
      priority: 'high',
      title: 'Install TypeScript',
      description: 'Add TypeScript as a dev dependency to your project.',
      affectedFiles: 'package.json',
      code: 'npm install --save-dev typescript @types/node\n# or\nyarn add --dev typescript @types/node'
    });

    steps.push({
      priority: 'high',
      title: 'Create tsconfig.json',
      description: 'Configure TypeScript compiler options for your project.',
      affectedFiles: 'tsconfig.json',
      code: JSON.stringify({
        "compilerOptions": {
          "target": "ES2020",
          "module": "commonjs",
          "strict": true,
          "esModuleInterop": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules"]
      }, null, 2)
    });

    steps.push({
      priority: 'medium',
      title: 'Rename Files to .ts',
      description: 'Gradually rename .js files to .ts and add type annotations.',
      affectedFiles: 'Source files (.js → .ts)'
    });

    steps.push({
      priority: 'medium',
      title: 'Add Type Annotations',
      description: 'Add type annotations to functions, variables, and return types.',
      affectedFiles: 'TypeScript files'
    });

    steps.push({
      priority: 'medium',
      title: 'Configure Type Checking',
      description: 'Enable strict type checking and fix type errors.',
      affectedFiles: 'tsconfig.json'
    });
  }

  // React Functional migration steps
  if (targetLower.includes('react') && targetLower.includes('functional')) {
    steps.push({
      priority: 'high',
      title: 'Install React Hooks',
      description: 'Ensure you have the latest React with hooks support.',
      affectedFiles: 'package.json',
      code: 'npm install react@^16.8.0 react-dom@^16.8.0'
    });

    steps.push({
      priority: 'high',
      title: 'Convert Lifecycle Methods',
      description: 'Map class component lifecycle methods to useEffect hooks.',
      affectedFiles: 'Component files',
      table: [
        { class: 'componentDidMount', hook: 'useEffect(() => {}, [])' },
        { class: 'componentDidUpdate', hook: 'useEffect(() => {}, [deps])' },
        { class: 'componentWillUnmount', hook: 'useEffect(() => { return () => {} }, [])' },
        { class: 'this.state', hook: 'useState' },
        { class: 'this.props', hook: 'props (directly)' }
      ]
    });

    steps.push({
      priority: 'medium',
      title: 'Convert State Management',
      description: 'Replace this.state and this.setState with useState hook.',
      affectedFiles: 'Stateful components'
    });

    steps.push({
      priority: 'medium',
      title: 'Convert Class Methods to Functions',
      description: 'Convert class methods to regular functions or useCallback where needed.',
      affectedFiles: 'Component methods'
    });

    steps.push({
      priority: 'low',
      title: 'Remove Class Syntax',
      description: 'Convert class components to function components.',
      affectedFiles: 'All React components'
    });
  }

  // Express to Fastify migration steps
  if (path.source.toLowerCase().includes('express') && targetLower.includes('fastify')) {
    steps.push({
      priority: 'high',
      title: 'Install Fastify',
      description: 'Replace Express with Fastify in your dependencies.',
      affectedFiles: 'package.json',
      code: 'npm install fastify\nnpm uninstall express'
    });

    steps.push({
      priority: 'high',
      title: 'Update App Initialization',
      description: 'Replace express() with fastify() initialization.',
      affectedFiles: 'app.js/index.js',
      code: '// Before (Express)\nconst app = express();\n\n// After (Fastify)\nconst fastify = require("fastify")({ logger: true });'
    });

    steps.push({
      priority: 'high',
      title: 'Convert Routes',
      description: 'Update route handlers to use Fastify\'s route syntax.',
      affectedFiles: 'Route files',
      code: '// Before (Express)\napp.get("/path", (req, res) => {});\n\n// After (Fastify)\nfastify.get("/path", async (request, reply) => {});'
    });

    steps.push({
      priority: 'medium',
      title: 'Convert Middleware',
      description: 'Rewrite Express middleware to Fastify plugins.',
      affectedFiles: 'Middleware files'
    });

    steps.push({
      priority: 'medium',
      title: 'Update Error Handling',
      description: 'Adapt error handling to Fastify\'s error handling schema.',
      affectedFiles: 'Error handlers'
    });
  }

  // jQuery to Vanilla JS migration steps
  if (path.source.toLowerCase().includes('jquery') && targetLower.includes('vanilla')) {
    steps.push({
      priority: 'high',
      title: 'Remove jQuery Dependency',
      description: 'Remove jQuery from your project dependencies.',
      affectedFiles: 'package.json'
    });

    steps.push({
      priority: 'high',
      title: 'Replace DOM Selectors',
      description: 'Replace jQuery selectors with native querySelector/querySelectorAll.',
      affectedFiles: 'Script files',
      code: '// Before (jQuery)\n$(".class")\n$("#id")\n\n// After (Vanilla JS)\ndocument.querySelectorAll(".class")\ndocument.querySelector("#id")'
    });

    steps.push({
      priority: 'medium',
      title: 'Replace DOM Manipulation',
      description: 'Replace jQuery DOM methods with native DOM APIs.',
      affectedFiles: 'DOM manipulation code',
      table: [
        { jquery: '$el.addClass()', vanilla: 'el.classList.add()' },
        { jquery: '$el.removeClass()', vanilla: 'el.classList.remove()' },
        { jquery: '$el.hide()', vanilla: 'el.style.display = "none"' },
        { jquery: '$el.show()', vanilla: 'el.style.display = ""' },
        { jquery: '$el.append()', vanilla: 'el.appendChild()' },
        { jquery: '$el.attr()', vanilla: 'el.setAttribute()' }
      ]
    });

    steps.push({
      priority: 'medium',
      title: 'Replace Event Handling',
      description: 'Convert jQuery event binding to native addEventListener.',
      affectedFiles: 'Event handling code',
      code: '// Before (jQuery)\n$el.on("click", handler);\n\n// After (Vanilla JS)\nel.addEventListener("click", handler);'
    });

    steps.push({
      priority: 'medium',
      title: 'Replace AJAX Calls',
      description: 'Replace $.ajax with fetch API.',
      affectedFiles: 'API calls',
      code: '// Before (jQuery)\n$.ajax({ url, method, success, error });\n\n// After (Vanilla JS)\nfetch(url, { method }).then().catch();'
    });
  }

  // Common testing step
  steps.push({
    priority: 'high',
    title: 'Run Tests',
    description: 'Run your test suite to ensure the migration hasn\'t broken functionality.',
    affectedFiles: 'Test files',
    code: 'npm test\n# or\nyarn test'
  });

  // Common final steps
  steps.push({
    priority: 'medium',
    title: 'Update Documentation',
    description: 'Update README and documentation to reflect the new technology.',
    affectedFiles: 'README.md, docs/'
  });

  steps.push({
    priority: 'low',
    title: 'Clean Up',
    description: 'Remove any unused files and dependencies from the old technology.',
    affectedFiles: 'Various'
  });

  return steps;
}

/**
 * Estimate migration time
 */
function estimateTime(steps, risk) {
  const baseHours = steps.length * 2; // 2 hours per step base
  
  const riskMultiplier = {
    'Low': 0.8,
    'Medium': 1.0,
    'High': 1.5
  };

  const estimated = baseHours * (riskMultiplier[risk.level] || 1.0);
  
  return {
    hours: Math.round(estimated),
    days: Math.round(estimated / 8),
    weeks: Math.round(estimated / 40)
  };
}

module.exports = {
  generateSteps,
  estimateTime
};

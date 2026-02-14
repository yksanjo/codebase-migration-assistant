/**
 * Transformation Patterns - defines code transformation patterns for different migrations
 */

// Simple type inference function
function inferType(value) {
  value = value.trim();
  if (value.startsWith("'") || value.startsWith('"')) return 'string';
  if (!isNaN(value) && value !== '') return 'number';
  if (value === 'true' || value === 'false') return 'boolean';
  if (value.startsWith('[')) return 'any[]';
  if (value.startsWith('{')) return 'object';
  if (value.includes('=>') || value.startsWith('function')) return 'Function';
  if (value === 'null' || value === 'undefined') return 'any';
  return 'any';
}

/**
 * Get transformation patterns for a specific migration
 */
function getPatterns(source, target) {
  // Try direct key
  let key = `${source}-${target}`;
  if (PATTERNS[key]) return PATTERNS[key];
  
  // Try normalized source (e.g., Express.js -> express)
  const normalizedSource = source.toLowerCase().replace('.js', '');
  key = `${normalizedSource}-${target.toLowerCase()}`;
  if (PATTERNS[key]) return PATTERNS[key];
  
  // Try normalized target
  const normalizedTarget = target.toLowerCase().replace('.js', '');
  key = `${source.toLowerCase()}-${normalizedTarget}`;
  if (PATTERNS[key]) return PATTERNS[key];
  
  // Try both normalized
  key = `${normalizedSource}-${normalizedTarget}`;
  if (PATTERNS[key]) return PATTERNS[key];
  
  return [];
}

/**
 * All transformation patterns
 */
const PATTERNS = {
  // JavaScript to TypeScript
  'javascript-typescript': [
    {
      name: 'Add function parameter types',
      pattern: /function\s+(\w+)\s*\(([^)]*)\)/g,
      transform: (match) => {
        const params = match[2].split(',').map(p => p.trim()).filter(p => p);
        const typedParams = params.map(p => {
          if (!p.includes(':')) {
            return `${p}: any`;
          }
          return p;
        }).join(', ');
        return `function ${match[1]}(${typedParams})`;
      },
      description: 'Add type annotations to function parameters'
    },
    {
      name: 'Add return type to functions',
      pattern: /function\s+(\w+)\s*\([^)]*\)\s*\{/g,
      transform: (match) => match[0].replace(/\{$/, ': any {'),
      description: 'Add return type annotations to functions'
    },
    {
      name: 'Add const/let type annotations',
      pattern: /(const|let)\s+(\w+)\s*=\s*([^;]+);/g,
      transform: (match) => {
        const type = inferType(match[3]);
        return `${match[1]} ${match[2]}: ${type} = ${match[3]};`;
      },
      description: 'Add type annotations to variable declarations'
    },
    {
      name: 'Convert require to import',
      pattern: /const\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      transform: (match) => {
        const isDefault = /^[A-Z]/.test(match[1]);
        if (isDefault) {
          return `import ${match[1]} from '${match[2]}';`;
        }
        return `import { ${match[1]} } from '${match[2]}';`;
      },
      description: 'Convert CommonJS require to ES6 import'
    }
  ],

  // React Class to Functional
  'react-react functional': [
    {
      name: 'Convert class to function',
      pattern: /class\s+(\w+)\s+extends\s+React\.Component\s*\{/g,
      transform: (match) => `function ${match[1]}(props) {`,
      description: 'Convert class component to function component'
    },
    {
      name: 'Convert state to useState',
      pattern: /this\.state\s*=\s*\{([^}]+)\}/g,
      transform: (match) => {
        const stateVars = match[1].split(',').map(s => {
          const [key, value] = s.split(':').map(x => x.trim());
          return `const [${key}, set${key.charAt(0).toUpperCase() + key.slice(1)}] = useState(${value || 'null'});`;
        }).join('\n  ');
        return stateVars;
      },
      description: 'Convert this.state to useState hooks'
    },
    {
      name: 'Convert componentDidMount to useEffect',
      pattern: /componentDidMount\s*\(\s*\)\s*\{([^}]+)\}/g,
      transform: (match) => `useEffect(() => {\n  ${match[1]}\n}, []);`,
      description: 'Convert componentDidMount lifecycle to useEffect'
    },
    {
      name: 'Convert this.setState to setter',
      pattern: /this\.setState\s*\(\s*\{([^}]+)\}\s*\)/g,
      transform: (match) => {
        const updates = match[1].split(',').map(s => {
          const [key, value] = s.split(':').map(x => x.trim());
          const setter = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
          return `${setter}(${value})`;
        }).join('\n  ');
        return updates;
      },
      description: 'Convert this.setState to individual setters'
    },
    {
      name: 'Convert this.props to props',
      pattern: /this\.props\.(\w+)/g,
      transform: (match) => `props.${match[1]}`,
      description: 'Convert this.props to props parameter'
    }
  ],

  // Express to Fastify
  'express-fastify': [
    {
      name: 'Convert app initialization',
      pattern: /const\s+app\s*=\s*express\s*\(\s*\)/g,
      transform: () => 'const fastify = require("fastify")({ logger: true });',
      description: 'Replace Express app with Fastify instance'
    },
    {
      name: 'Convert route handler (req, res)',
      pattern: /app\.\w+\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(?:\([^)]*\)|function)\s*\(\s*req\s*,\s*res\s*\)/g,
      transform: (match) => {
        return `fastify.${match[0].match(/app\.\w+/)[0].replace('app', '').toLowerCase()}("${match[1]}", async (request, reply) => {\n  // Migrate: request = request, res = reply\n})`;
      },
      description: 'Convert Express route handlers to Fastify async handlers'
    },
    {
      name: 'Convert res.send to reply.send',
      pattern: /res\.send\s*\(([^)]+)\)/g,
      transform: (match) => `reply.send(${match[1]})`,
      description: 'Convert res.send to reply.send'
    },
    {
      name: 'Convert res.json to reply.send',
      pattern: /res\.json\s*\(([^)]+)\)/g,
      transform: (match) => `reply.send(${match[1]})`,
      description: 'Convert res.json to reply.send'
    },
    {
      name: 'Convert req.params to request.params',
      pattern: /req\.params\.(\w+)/g,
      transform: (match) => `request.params.${match[1]}`,
      description: 'Convert req.params to request.params'
    },
    {
      name: 'Convert req.body to request.body',
      pattern: /req\.body/g,
      transform: () => `request.body`,
      description: 'Convert req.body to request.body'
    },
    {
      name: 'Convert app.use to fastify.register',
      pattern: /app\.use\s*\(\s*(?:require\s*\(\s*['"]([^'"]+)['"]\s*\)|([^,]+))\s*\)/g,
      transform: (match) => {
        const name = match[1] || match[2];
        return `fastify.register(require("${name}"))`;
      },
      description: 'Convert Express middleware to Fastify plugins'
    }
  ],

  // jQuery to Vanilla JS
  'jquery-vanilla': [
    {
      name: 'Convert $(".class") to querySelectorAll',
      pattern: /\$\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      transform: (match) => {
        const selector = match[1];
        if (selector.startsWith('.')) {
          return `document.querySelectorAll("${selector}")`;
        } else if (selector.startsWith('#')) {
          return `document.querySelector("${selector}")`;
        }
        return `document.querySelectorAll("${selector}")`;
      },
      description: 'Convert jQuery selectors to native DOM selectors'
    },
    {
      name: 'Convert .addClass to classList.add',
      pattern: /\.addClass\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      transform: (match) => `.classList.add("${match[1]}")`,
      description: 'Convert jQuery addClass to classList.add'
    },
    {
      name: 'Convert .removeClass to classList.remove',
      pattern: /\.removeClass\s*\(\s*(?:['"`]([^'"`]+)['"`])?\s*\)/g,
      transform: (match) => match[1] ? `.classList.remove("${match[1]}")` : `.className = ""`,
      description: 'Convert jQuery removeClass to classList.remove'
    },
    {
      name: 'Convert .hide to style.display = "none"',
      pattern: /\.hide\s*\(\s*\)/g,
      transform: () => `.style.display = "none"`,
      description: 'Convert jQuery hide to CSS display'
    },
    {
      name: 'Convert .show to style.display = ""',
      pattern: /\.show\s*\(\s*\)/g,
      transform: () => `.style.display = ""`,
      description: 'Convert jQuery show to CSS display'
    },
    {
      name: 'Convert .text() to .textContent',
      pattern: /\.text\s*\(\s*\)/g,
      transform: () => `.textContent`,
      description: 'Convert jQuery text() getter to textContent'
    },
    {
      name: 'Convert .text(value) to .textContent = value',
      pattern: /\.text\s*\(\s*([^)]+)\s*\)/g,
      transform: (match) => `.textContent = ${match[1]}`,
      description: 'Convert jQuery text() setter to textContent'
    },
    {
      name: 'Convert .html() to .innerHTML',
      pattern: /\.html\s*\(\s*([^)]*)\s*\)/g,
      transform: (match) => `.innerHTML = ${match[1] || ''}`,
      description: 'Convert jQuery html() to innerHTML'
    },
    {
      name: 'Convert .on("click", handler) to addEventListener',
      pattern: /\.on\s*\(\s*['"`]click['"`]\s*,\s*(\w+)\s*\)/g,
      transform: (match) => `.addEventListener("click", ${match[1]})`,
      description: 'Convert jQuery on() to addEventListener'
    },
    {
      name: 'Convert $.ajax to fetch',
      pattern: /\$\.ajax\s*\(\s*\{([^}]+)\}\s*\)/g,
      transform: (match) => {
        const options = match[1];
        const url = options.match(/url\s*:\s*([^,]+)/)?.[1] || '""';
        const method = options.match(/method\s*:\s*['"`]([^'"`]+)['"`]/)?.[1] || 'GET';
        const success = options.match(/success\s*:\s*(\w+)/)?.[1];
        
        let fetchCode = `fetch(${url}, { method: "${method}" })`;
        if (success) {
          fetchCode += `\n  .then(response => response.json())\n  .then(${success});`;
        } else {
          fetchCode += '\n  .then(response => response.json());';
        }
        
        return fetchCode;
      },
      description: 'Convert jQuery $.ajax to Fetch API'
    },
    {
      name: 'Convert $ to querySelector',
      pattern: /\$\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\.([^;(]+)/g,
      transform: (match) => {
        const selector = match[1];
        const method = match[2];
        const nativeSelector = selector.startsWith('#') 
          ? `document.querySelector("${selector}")`
          : `document.querySelectorAll("${selector}")`;
        return `${nativeSelector}.${method}`;
      },
      description: 'Convert jQuery $() to document.querySelector'
    }
  ]
};

module.exports = {
  getPatterns,
  PATTERNS
};

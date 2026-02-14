/**
 * Logger utility
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.silent = options.silent || false;
  }

  debug(message, ...args) {
    if (!this.silent && this.level === 'debug') {
      console.log(`${colors.gray}[DEBUG]${colors.reset} ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (!this.silent && (this.level === 'debug' || this.level === 'info')) {
      console.log(`${colors.blue}[INFO]${colors.reset} ${message}`, ...args);
    }
  }

  success(message, ...args) {
    if (!this.silent) {
      console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (!this.silent) {
      console.warn(`${colors.yellow}[WARN]${colors.reset} ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (!this.silent) {
      console.error(`${colors.red}[ERROR]${colors.reset} ${message}`, ...args);
    }
  }

  section(title) {
    if (!this.silent) {
      console.log(`\n${colors.cyan}${colors.bright}${title}${colors.reset}\n`);
    }
  }

  header(text) {
    if (!this.silent) {
      console.log(`${colors.cyan}${text}${colors.reset}`);
    }
  }

  subHeader(text) {
    if (!this.silent) {
      console.log(`${colors.gray}${text}${colors.reset}`);
    }
  }

  table(data) {
    if (!this.silent) {
      console.table(data);
    }
  }

  divider() {
    if (!this.silent) {
      console.log(colors.gray + '─'.repeat(60) + colors.reset);
    }
  }
}

module.exports = new Logger();
module.exports.Logger = Logger;
module.exports.colors = colors;

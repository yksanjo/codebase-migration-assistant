#!/usr/bin/env node

/**
 * Codebase Migration Assistant - CLI
 * Main entry point for the CLI tool
 */

const path = require('path');
const fs = require('fs');

// Import modules
const CodeAnalyzer = require('../analyzer');
const StrategyGenerator = require('../strategy');
const Transformer = require('../transformer');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Display help
function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          CODEBASE MIGRATION ASSISTANT v1.0.0                 ║
║  Analyzes code, suggests migration strategies, and transforms ║
╚═══════════════════════════════════════════════════════════════╝

USAGE:
  migrate <command> [options]

COMMANDS:

  analyze <path>              Analyze a codebase
    Options:
      --format <console|json|markdown>  Output format (default: console)
      --output <file>           Write output to file

  suggest <path> --to <target>  Generate migration strategy
    Options:
      --format <console|json|markdown>  Output format (default: console)
      --to <target>             Target framework/language

  transform <path> --to <target>  Transform code
    Options:
      --to <target>             Target framework/language
      --output <dir>           Output directory for transformed files
      --dry-run                Show changes without writing files

  list                        List supported migrations

  help                         Show this help message

EXAMPLES:

  # Analyze a project
  migrate analyze ./my-project

  # Generate migration strategy
  migrate suggest ./my-project --to TypeScript

  # Transform code
  migrate transform ./my-project --to TypeScript

  # List supported migrations
  migrate list

SUPPORTED MIGRATIONS:

  JavaScript → TypeScript
  React Class → React Functional
  Express.js → Fastify
  jQuery → Vanilla JavaScript
  Python 2 → Python 3
  Flask → FastAPI
  Vue 2 → Vue 3

`.trim());
}

// List supported migrations
function listMigrations() {
  console.log(`
SUPPORTED MIGRATIONS:

  ┌─────────────────────────┬────────────────────┬────────────┐
  │ Source                  │ Target             │ Difficulty │
  ├─────────────────────────┼────────────────────┼────────────┤
  │ JavaScript              │ TypeScript         │ Medium     │
  │ TypeScript              │ JavaScript         │ Easy       │
  │ React (Class)           │ React (Functional) │ Medium     │
  │ Express.js             │ Fastify            │ Medium     │
  │ Express.js             │ Koa                │ Medium     │
  │ jQuery                  │ Vanilla JavaScript │ Hard       │
  │ jQuery                  │ React              │ Hard       │
  │ Python 2                │ Python 3           │ Medium     │
  │ Flask                   │ FastAPI            │ Medium     │
  │ Django                  │ Flask              │ Hard       │
  │ Vue 2                   │ Vue 3              │ Medium     │
  │ Angular                 │ React              │ Hard       │
  │ Angular                 │ Vue.js             │ Hard       │
  └─────────────────────────┴────────────────────┴────────────┘
`.trim());
}

// Analyze command
async function analyzeCommand(targetPath, options) {
  console.log('\n🔬 Starting codebase analysis...\n');

  const analyzer = new CodeAnalyzer();
  
  try {
    const results = await analyzer.analyze(targetPath);
    const report = analyzer.generateReport(options.format || 'console');
    
    console.log(report);

    // Write to file if specified
    if (options.output) {
      fs.writeFileSync(options.output, report, 'utf-8');
      console.log(`\n📄 Report saved to: ${options.output}`);
    }
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Suggest command
async function suggestCommand(targetPath, target, options) {
  console.log('\n🎯 Generating migration strategy...\n');

  try {
    // First analyze the codebase
    const analyzer = new CodeAnalyzer();
    const analysisResults = await analyzer.analyze(targetPath);

    // Then generate strategy
    const strategyGenerator = new StrategyGenerator(analysisResults);
    strategyGenerator.generate(target);

    const report = strategyGenerator.generateReport(options.format || 'console');
    console.log(report);

    // Write to file if specified
    if (options.output) {
      fs.writeFileSync(options.output, report, 'utf-8');
      console.log(`\n📄 Strategy saved to: ${options.output}`);
    }
  } catch (error) {
    console.error('❌ Strategy generation failed:', error.message);
    process.exit(1);
  }
}

// Transform command
async function transformCommand(targetPath, target, options) {
  console.log('\n🔄 Transforming code...\n');

  try {
    // First analyze the codebase
    const analyzer = new CodeAnalyzer();
    const analysisResults = await analyzer.analyze(targetPath);

    // Then transform
    const transformer = new Transformer();
    const results = await transformer.transformFiles(
      analysisResults.structure || [],
      analysisResults.frameworks?.[0] || 'JavaScript',
      target
    );

    const report = transformer.generateReport(results, options.format || 'console');
    console.log(report);

    // Write transformed files if not dry-run
    if (!options.dryRun && options.output) {
      const outputDir = options.output;
      
      // Create output directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      for (const result of results) {
        if (result.success && result.transformedContent !== result.originalContent) {
          const outputPath = path.join(outputDir, result.relativePath);
          const dir = path.dirname(outputPath);
          
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(outputPath, result.transformedContent, 'utf-8');
        }
      }
      
      console.log(`\n📄 Transformed files saved to: ${outputDir}`);
    } else if (options.dryRun) {
      console.log('\n⚠️  Dry run - no files written');
    }

    // Write report if specified
    if (options.output && !options.dryRun) {
      const reportPath = path.join(options.output, 'transformation-report.txt');
      fs.writeFileSync(reportPath, report, 'utf-8');
      console.log(`📄 Report saved to: ${reportPath}`);
    }
  } catch (error) {
    console.error('❌ Transformation failed:', error.message);
    process.exit(1);
  }
}

// Parse options
function parseOptions(args) {
  const options = {};
  const remainingArgs = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else if (!arg.startsWith('-')) {
      remainingArgs.push(arg);
    }
  }

  return { options, remainingArgs };
}

// Main function
async function main() {
  if (!command || command === 'help') {
    showHelp();
    return;
  }

  if (command === 'list') {
    listMigrations();
    return;
  }

  const { options, remainingArgs } = parseOptions(args.slice(1));
  const targetPath = remainingArgs[0] || '.';

  switch (command) {
    case 'analyze':
      await analyzeCommand(targetPath, options);
      break;
      
    case 'suggest':
      if (!options.to) {
        console.error('❌ Error: --to <target> is required for suggest command');
        console.log('Run "migrate help" for usage information');
        process.exit(1);
      }
      await suggestCommand(targetPath, options.to, options);
      break;
      
    case 'transform':
      if (!options.to) {
        console.error('❌ Error: --to <target> is required for transform command');
        console.log('Run "migrate help" for usage information');
        process.exit(1);
      }
      await transformCommand(targetPath, options.to, options);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run "migrate help" for usage information');
      process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

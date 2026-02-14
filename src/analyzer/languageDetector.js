/**
 * Language Detector - identifies programming languages from files
 */

const LANGUAGE_PATTERNS = {
  javascript: {
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    keywords: ['const', 'let', 'var', 'function', '=>', 'async', 'await', 'import', 'export', 'require'],
    shebang: ['node', 'bun', 'deno']
  },
  typescript: {
    extensions: ['.ts', '.tsx', '.mts', '.cts'],
    keywords: ['interface', 'type', 'enum', 'namespace', 'declare', 'abstract', 'implements', 'readonly'],
    patterns: [': string', ': number', ': boolean',': void', ': any', 'interface ', 'type ']
  },
  python: {
    extensions: ['.py', '.pyw', '.pyi'],
    keywords: ['def ', 'class ', 'import ', 'from ', 'if __name__', 'elif ', 'self.', 'print('],
    shebang: ['python', 'python3']
  },
  ruby: {
    extensions: ['.rb', '.erb', '.rake'],
    keywords: ['def ', 'class ', 'end', 'require ', 'module ', 'attr_', 'puts ', 'do |'],
    shebang: ['ruby']
  },
  java: {
    extensions: ['.java'],
    keywords: ['public class', 'private ', 'protected ', 'void ', 'static ', 'public static void main', 'import java', 'package '],
    patterns: ['System.out', '@Override', 'extends ', 'implements ']
  },
  go: {
    extensions: ['.go'],
    keywords: ['package ', 'func ', 'import (', 'type ', 'struct {', 'interface {', 'go func', 'defer '],
    patterns: ['func main()', ':=', 'go func', 'chan ']
  },
  rust: {
    extensions: ['.rs'],
    keywords: ['fn ', 'let mut', 'impl ', 'pub fn', 'struct ', 'enum ', 'use ', 'mod ', 'pub struct'],
    patterns: ['-> ', '::', '&mut ', 'Option<', 'Result<', 'println!']
  },
  cpp: {
    extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
    keywords: ['#include', 'std::', 'cout', 'cin', 'endl', 'namespace ', 'template<', 'virtual '],
    patterns: ['#ifndef', '#define', '#endif', '::', '->']
  },
  csharp: {
    extensions: ['.cs'],
    keywords: ['using ', 'namespace ', 'public class', 'private ', 'protected ', 'void ', 'async Task', 'Console.WriteLine'],
    patterns: ['[Attribute]', '=> ', '?.', '??']
  },
  php: {
    extensions: ['.php'],
    keywords: ['<?php', '<?=', 'function ', 'class ', 'public ', 'private ', 'protected ', 'echo ', 'var '],
    patterns: ['$', '->', '::', 'namespace ']
  },
  swift: {
    extensions: ['.swift'],
    keywords: ['func ', 'var ', 'let ', 'class ', 'struct ', 'enum ', 'protocol ', 'import ', 'guard ', 'if let'],
    patterns: ['-> ', '@IBOutlet', '@IBAction', 'override func']
  },
  kotlin: {
    extensions: ['.kt', '.kts'],
    keywords: ['fun ', 'val ', 'var ', 'class ', 'object ', 'interface ', 'package ', 'import ', 'companion object'],
    patterns: ['-> ', '?:', '::', 'suspend ']
  },
  html: {
    extensions: ['.html', '.htm'],
    patterns: ['<!DOCTYPE', '<html', '<head', '<body', '<div', '<span', '<script', '<style']
  },
  css: {
    extensions: ['.css', '.scss', '.sass', '.less'],
    patterns: ['{', '}', 'color:', 'background:', 'margin:', 'padding:', 'font-', '@media', '@import']
  },
  vue: {
    extensions: ['.vue'],
    patterns: ['<template', '<script', '<style', 'v-if', 'v-for', 'v-bind', 'v-on', '{{ ']
  },
  svelte: {
    extensions: ['.svelte'],
    patterns: ['<script', '<style', '{#if', '{#each', '{#await}', '<slot', 'on:']
  },
  json: {
    extensions: ['.json'],
    patterns: [/^\s*\{[\s\S]*\}\s*$/, /^\s*\[[\s\S]*\]\s*$/]
  },
  yaml: {
    extensions: ['.yaml', '.yml'],
    patterns: [/^[a-zA-Z_]+:/m, /^  - /m, /^---$/m]
  },
  markdown: {
    extensions: ['.md', '.mdx'],
    patterns: ['# ', '## ', '### ', '```', '[', '](', '**', '__']
  },
  sql: {
    extensions: ['.sql'],
    keywords: ['SELECT ', 'FROM ', 'WHERE ', 'INSERT ', 'UPDATE ', 'DELETE ', 'CREATE TABLE', 'ALTER TABLE', 'JOIN '],
    patterns: ['SELECT', 'INSERT INTO', 'UPDATE ', 'DELETE FROM']
  },
  shell: {
    extensions: ['.sh', '.bash', '.zsh'],
    keywords: ['#!/bin/bash', '#!/bin/sh', '#!/usr/bin/env bash', 'echo ', 'if [', 'for ', 'while '],
    shebang: ['bash', 'sh', 'zsh']
  }
};

/**
 * Detect languages from a list of files
 * @param {Array} files - Array of file objects
 * @returns {Array} Detected languages
 */
function detect(files) {
  const languageCounts = {};

  for (const file of files) {
    const lang = detectLanguage(file);
    if (lang) {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    }
  }

  // Sort by count and return unique languages
  const sorted = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang);

  return sorted;
}

/**
 * Detect language for a single file
 */
function detectLanguage(file) {
  const ext = file.extension.toLowerCase();
  
  // Check extension first
  for (const [lang, config] of Object.entries(LANGUAGE_PATTERNS)) {
    if (config.extensions && config.extensions.includes(ext)) {
      // For extensions that could be multiple languages, check content
      if (['.js', '.ts', '.h'].includes(ext)) {
        return detectByContent(file.content, lang);
      }
      return lang;
    }
  }

  // Fall back to content-based detection
  return detectByContent(file.content);
}

/**
 * Detect language by content analysis
 */
function detectByContent(content, preferredLang = null) {
  if (preferredLang && LANGUAGE_PATTERNS[preferredLang]) {
    const config = LANGUAGE_PATTERNS[preferredLang];
    const score = calculateMatchScore(content, config);
    if (score > 2) {
      return preferredLang;
    }
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const [lang, config] of Object.entries(LANGUAGE_PATTERNS)) {
    const score = calculateMatchScore(content, config);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = lang;
    }
  }

  return bestScore > 0 ? bestMatch : 'unknown';
}

/**
 * Calculate how well content matches a language
 */
function calculateMatchScore(content, config) {
  let score = 0;

  // Check keywords
  if (config.keywords) {
    for (const keyword of config.keywords) {
      if (content.includes(keyword)) {
        score += 1;
      }
    }
  }

  // Check patterns
  if (config.patterns) {
    for (const pattern of config.patterns) {
      if (typeof pattern === 'string') {
        if (content.includes(pattern)) {
          score += 2;
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(content)) {
          score += 2;
        }
      }
    }
  }

  // Check shebang
  if (config.shebang) {
    const firstLine = content.split('\n')[0];
    for (const shebang of config.shebang) {
      if (firstLine.includes(shebang)) {
        score += 3;
      }
    }
  }

  return score;
}

/**
 * Get language display name
 */
function getLanguageName(langCode) {
  const names = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    ruby: 'Ruby',
    java: 'Java',
    go: 'Go',
    rust: 'Rust',
    cpp: 'C++',
    csharp: 'C#',
    php: 'PHP',
    swift: 'Swift',
    kotlin: 'Kotlin',
    html: 'HTML',
    css: 'CSS',
    vue: 'Vue.js',
    svelte: 'Svelte',
    json: 'JSON',
    yaml: 'YAML',
    markdown: 'Markdown',
    sql: 'SQL',
    shell: 'Shell/Bash'
  };
  return names[langCode] || langCode;
}

/**
 * Get file extension for a language
 */
function getExtension(langCode) {
  const config = LANGUAGE_PATTERNS[langCode];
  return config ? config.extensions[0] : null;
}

module.exports = {
  detect,
  detectLanguage,
  detectByContent,
  getLanguageName,
  getExtension,
  LANGUAGE_PATTERNS
};

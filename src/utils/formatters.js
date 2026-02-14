/**
 * Formatters utility - various formatting functions
 */

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format number with thousands separator
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format duration in milliseconds to human readable
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Format percentage
 */
function formatPercent(value, total) {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

/**
 * Truncate string with ellipsis
 */
function truncate(str, maxLength = 50) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Pad string to fixed width
 */
function pad(str, width, char = ' ') {
  str = String(str);
  if (str.length >= width) return str;
  return char.repeat(width - str.length) + str;
}

/**
 * Create a table row
 */
function tableRow(columns, widths) {
  return columns.map((col, i) => pad(String(col), widths[i])).join(' | ');
}

/**
 * Create a table separator
 */
function tableSeparator(widths) {
  return widths.map(w => '-'.repeat(w)).join('-+-');
}

/**
 * Format file size summary
 */
function formatFileSizeSummary(files) {
  const total = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const byType = {};
  
  for (const file of files) {
    const ext = file.extension || 'unknown';
    byType[ext] = (byType[ext] || 0) + 1;
  }
  
  return {
    total: formatBytes(total),
    count: files.length,
    byType
  };
}

/**
 * Format dependency list
 */
function formatDependencies(dependencies, maxItems = 20) {
  const sorted = [...dependencies].sort((a, b) => b.usageCount - a.usageCount);
  const top = sorted.slice(0, maxItems);
  
  return {
    total: dependencies.length,
    top,
    others: sorted.slice(maxItems).map(d => d.name)
  };
}

/**
 * Format risk level with color
 */
function formatRiskLevel(level) {
  const colors = {
    'Low': '🟢',
    'Medium': '🟡',
    'High': '🔴'
  };
  
  return `${colors[level] || '⚪'} ${level}`;
}

/**
 * Format difficulty
 */
function formatDifficulty(difficulty) {
  const icons = {
    'easy': '✅',
    'medium': '⚠️',
    'hard': '❌'
  };
  
  return `${icons[difficulty] || '⚪'} ${difficulty}`;
}

/**
 * Format code snippet with line numbers
 */
function formatCodeSnippet(code, startLine = 1) {
  const lines = code.split('\n');
  const maxLineNum = String(startLine + lines.length - 1).length;
  
  return lines.map((line, i) => {
    const lineNum = String(startLine + i).padStart(maxLineNum, ' ');
    return `${lineNum} | ${line}`;
  }).join('\n');
}

/**
 * Format JSON with indentation
 */
function formatJSON(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}

/**
 * Format list as bullet points
 */
function formatList(items, bullet = '•') {
  return items.map(item => `  ${bullet} ${item}`).join('\n');
}

/**
 * Format key-value pairs
 */
function formatKeyValue(data, indent = 0) {
  const prefix = ' '.repeat(indent);
  return Object.entries(data)
    .map(([key, value]) => `${prefix}${key}: ${value}`)
    .join('\n');
}

module.exports = {
  formatBytes,
  formatNumber,
  formatDuration,
  formatPercent,
  truncate,
  pad,
  tableRow,
  tableSeparator,
  formatFileSizeSummary,
  formatDependencies,
  formatRiskLevel,
  formatDifficulty,
  formatCodeSnippet,
  formatJSON,
  formatList,
  formatKeyValue
};

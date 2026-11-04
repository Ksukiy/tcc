var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

var envFile = path.join(__dirname, '..', '.env');
var schemaFile = path.join(__dirname, '..', 'mysql_schema.sql');
var mysql = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe';

function readEnv() {
  var values = {};
  fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(function(line) {
    var value = line.trim();
    if (!value || value.charAt(0) === '#') {
      return;
    }
    var separator = value.indexOf('=');
    if (separator >= 0) {
      values[value.slice(0, separator).trim()] = value.slice(separator + 1).trim().replace(/^"(.*)"$/, '$1');
    }
  });
  return values;
}

var config = readEnv();

function sqlValue(value) {
  if (value === undefined || value === null) {
    return 'NULL';
  }
  if (typeof value === 'number' && isFinite(value)) {
    return String(value);
  }
  if (value === '') {
    return "CAST('' AS CHAR CHARACTER SET utf8mb4)";
  }
  return "CONVERT(0x" + Buffer.from(String(value), 'utf8').toString('hex') + " USING utf8mb4)";
}

function execute(sql, returnRows) {
  var args = [
    '--protocol=TCP',
    '--host=' + (config.DB_HOST || '127.0.0.1').replace(/^localhost$/, '127.0.0.1'),
    '--port=' + (config.DB_PORT || '3306'),
    '--user=' + (config.DB_USER || 'root'),
    '--database=' + (config.DB_NAME || 'tcc_estoque'),
    '--default-character-set=utf8mb4',
    '--batch',
    '--raw',
    '--skip-column-names',
    '--execute=' + sql
  ];
  var result = childProcess.spawnSync(mysql, args, {
    env: Object.assign({}, process.env, { MYSQL_PWD: config.DB_PASSWORD || '' }),
    encoding: 'utf8',
    windowsHide: true
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error((result.stderr || 'Falha ao executar comando MySQL.').trim());
  }
  if (!returnRows) {
    return [];
  }
  return result.stdout.trim() ? result.stdout.trim().split(/\r?\n/).map(function(line) {
    return line.split('\t').map(function(value) {
      return value === '\\N' ? null : value;
    });
  }) : [];
}

function query(sql) {
  return execute(sql, true);
}

function run(sql) {
  execute(sql, false);
}

function ensureSchema() {
  var schema = fs.readFileSync(schemaFile, 'utf8');
  var result = childProcess.spawnSync(mysql, [
    '--protocol=TCP',
    '--host=' + (config.DB_HOST || '127.0.0.1').replace(/^localhost$/, '127.0.0.1'),
    '--port=' + (config.DB_PORT || '3306'),
    '--user=' + (config.DB_USER || 'root'),
    '--default-character-set=utf8mb4'
  ], {
    input: schema,
    env: Object.assign({}, process.env, { MYSQL_PWD: config.DB_PASSWORD || '' }),
    encoding: 'utf8',
    windowsHide: true
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || 'Não foi possível aplicar o schema MySQL.').trim());
  }
  execute('ALTER TABLE usuarios MODIFY data_nascimento DATE NULL', false);
}

module.exports = {
  query: query,
  run: run,
  sqlValue: sqlValue,
  ensureSchema: ensureSchema
};

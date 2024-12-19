const { createLogger, transports, format } = require('winston');
// require('winston-daily-rotate-file');

const customFormat = format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.printf((info) => {
  return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`
}))

// const generalLogs = new transports.DailyRotateFile({
//   filename: './src/logs/%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   zippedArchive: false,
//   maxFiles: '15d',
//   level: 'silly'
// })

const logger = createLogger({
  format: customFormat,
  transports: [
    new transports.Console({ level: 'silly' })
  ]
});

module.exports = logger;

// const levels = {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// };
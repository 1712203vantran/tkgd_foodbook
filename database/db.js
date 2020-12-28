const mongoose = require('mongoose');
const readLine = require('readline');

let dbURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME}/${process.env.DB_NAME}?authSource=admin&replicaSet=atlas-zw0z0h-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`;

const connect = () => {
  setTimeout(() => mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }), 1000);
}
mongoose.connection.on('connected', () => {
  console.log('connected');
});

mongoose.connection.on('error', err => {
  console.log('error: ' + err);
  return connect();
});

mongoose.connection.on('disconnected', () => {
  console.log('disconnected');
});

if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on ('SIGINT', () => {
    process.emit("SIGINT");
  });
}

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close( () => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});


connect();

require('./mongoose_schema');

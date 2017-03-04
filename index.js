#!/usr/bin/env node
var argv = require('yargs')
    .usage('Usage: $0 -h [host]')
    .demandOption(['h'])
    .argv
;
const Vorpal = require('vorpal');
const mqtt = require('mqtt');
const vorpal = new Vorpal();

const client = mqtt.connect(argv.h);

client.on('error', e => vorpal.log('ERROR ', e));
client.on('offline', () => vorpal.log('OFFLINE'));
client.on('close', () => vorpal.log('Connection closed'));
client.on('connect', () => vorpal.log('connection established'));

client.on('message', (topic, message) =>
  vorpal.log(`Message received on ${topic}: ${message.toString()}`))
;

vorpal.delimiter('quark-up~$').show();

vorpal
  .command('sub', 'subscribe to a topic.')
  .option('-t --topic <topic>', 'The topic to subscribe to.')
  .validate(({ options }) => {
    if(!options.topic) return `You need a topic to subscribe to`
  })
  .action(function({ options: { topic } }, callback) {
    client.subscribe(topic);
    vorpal.log(`Subscribed to ${topic}`)
    callback();
  })
;

vorpal
  .command('pub', 'publish to a topic.')
  .option('-t --topic <topic>', 'The topic to publish to.')
  .option('-m --message <message>', 'The message to send.')
  .validate(({ options }) => {
    if(!options.topic) return `You need a topic to publish to`
    if(!options.message) return `You need a message to publish`
  })
  .action(function({ options: { topic, message } }, callback) {
    client.publish(topic, message);
    vorpal.log(`Published to ${topic}: ${message}`)
    callback();
  })
;

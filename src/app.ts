import { program } from 'commander';
import net from 'net';

program
  .option('-h, --host <host>', 'Key Value Store Server Host', '127.0.0.1')
  .option('-p, --port <port>', 'Key Value Store Server Port', '11211');

const options = program.opts();
console.log(options);
program
  .command('get <key>')
  .description('Get the value for a given key')
  .action((key) => {
    const client = net.createConnection({ host: options.host, port: Number(options.port) }, () => {
      client.write(`get ${key}\r\n`);
    });
    client.on('data', (data) => {
      const message = data.toString();
      if (message.startsWith('VALUE')) {
        const value = message.split('\r\n')[1];
        console.log(value);
      } else if (message === 'END\r\n') {
        client.end();
      } else {
        console.error(`Error: ${message}`);
        client.end();
      }
    });
  });

program
  .command('set <key> <value>')
  .description('Set the value for a given key')
  .action((key, value) => {
    const client = net.createConnection({ host: options.host, port: Number(options.port) }, () => {
      client.write(`set ${key} 0 0 ${value.length}\r\n${value}\r\n`);
    });
    client.on('data', (data) => {
      const message = data.toString();
      if (message === 'STORED\r\n') {
        console.log(`Value for key ${key} set successfully`);
        client.end();
      } else {
        console.error(`Error: ${message}`);
        client.end();
      }
    });
  });

program
  .command('delete <key>')
  .description('Delete the value for a given key')
  .action((key) => {
    const client = net.createConnection({ host: options.host, port: Number(options.port) }, () => {
      client.write(`delete ${key}\r\n`);
    });
    client.on('data', (data) => {
      const message = data.toString();
      if (message === 'DELETED\r\n') {
        console.log(`Value for key ${key} deleted successfully`);
        client.end();
      } else {
        console.error(`Error: ${message}`);
        client.end();
      }
    });
  });

program.parse(process.argv);
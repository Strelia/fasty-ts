import fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import assset from "@fastify/static";
import formbody from '@fastify/formbody';
import { Server, IncomingMessage, ServerResponse } from 'http';

import fs from 'fs';
import util from 'util';
import path from 'path';
import { pipeline } from 'stream';
import crypto from 'crypto';
import { unzip } from './util';

const pump = util.promisify(pipeline);
const form = getPath('view', 'form.html');

function getPath(...names: string[]) {
  return path.join(__dirname, ...names);
}

const server: FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
> = fastify({ logger: true });


server.register(assset, {
  root: getPath('..', 'unzip'),
  prefix: '/unzip/', // optional: default '/'
})

server.register(multipart);
server.register(formbody);

function build() {
  server.get('/', async (req, reply) => {
    reply.type('text/html').send(fs.readFileSync(form));
  });

  server.post('/upload/files', async (req, reply) => {
    // stores files to tmp dir and return paths
    const files = req.files();
    server.log.debug(files);

    const names:{name: string, dir: string}[] = [];
    for await (const file of files) {
      await pump(file.file, fs.createWriteStream(file.filename));
      const dir = crypto.randomUUID();

      try {
        await unzip(file.filename, getPath('..', 'unzip', dir));
        fs.readdirSync(getPath('..', 'unzip', dir)).forEach((fileName) => {
          names.push({
            dir: '/unzip/' + dir + '/' + fileName,
            name: fileName,
          });
        });
        fs.unlinkSync(file.filename)
      } catch (err) {
        server.log.error(err)
      }
    }
    // tmp files cleaned up automatically
    reply.type('text/html').send(names.map((img) => `<img src="${img.dir}" title="${img.name}" />`).join(''));
  });

  server.get('/ping', async (require, reply) => {
    return 'pong\n';
  });
  return server;
}

export default build;

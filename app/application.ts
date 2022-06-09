import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

import fs from 'fs';
import util from 'util';
import path from 'path';
import { pipeline } from 'stream';

const pump = util.promisify(pipeline);
const form = path.join(__dirname, '..', 'view/form.html');

const server: FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
> = fastify({ logger: true });

function build() {
  server.get('/', async (req, reply) => {
    reply.type('text/html').send(fs.createReadStream(form));
  });
  server.get('/ping', async (require, reply) => {
    return 'pong\n';
  });
  return server;
}

export default build;

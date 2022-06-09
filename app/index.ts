import application from './application';

const PORT = process.env.PORT ?? 3000;

const fastify = application();

(() => {
  fastify.listen({ port: +PORT })
    .catch((err) => {
      fastify.log.error(err);
      process.exit(1);
    });
})();

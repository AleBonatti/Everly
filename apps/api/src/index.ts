import { buildApp } from './app.js';

const app = buildApp();

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});

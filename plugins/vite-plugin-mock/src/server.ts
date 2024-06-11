import Mock from "@rr-utils/mock";
import fastifyCors from "@fastify/cors";
import { Request } from ".";
import Fastify from "fastify";

async function createServer(options: Array<Request>, mock: Mock) {
  const fastify = Fastify({ logger: false });
  fastify.register(fastifyCors, {
    origin: "*", // 允许所有来源
    methods: ["GET", "POST"], // 允许的 HTTP 方法
    allowedHeaders: ["Content-Type", "Authorization"], // 允许的请求头
    credentials: true, // 是否允许携带凭证
  });
  options.forEach(({ url, name, method, response, option }) => {
    fastify.route({
      method,
      url,
      handler: async (_request, reply) => {
        const data = mock.generate(name, option);
        const result = await response(data);
        reply.send(result);
      },
    });
  });
  fastify.get("/", async (_request, _reply) => {
    return { pong: "it worked!", message: "mock 插件生效" };
  });
  fastify.listen({ port: 3333, host: "0.0.0.0" }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Server listening at http://localhost:3333`);
  });
  return fastify;
}

export { createServer };

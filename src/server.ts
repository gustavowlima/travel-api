import { fastify } from "fastify";
import { generateSuggestionsRoute } from "./routes/generate-suggestions";
import { fastifyCors } from "@fastify/cors";

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(generateSuggestionsRoute);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server started on port 3333");
  });

import { FastifyInstance } from "fastify";
import { z } from "zod";
import { openai } from "../lib/openai";

export const generateSuggestionsRoute = async (app: FastifyInstance) => {
  app.post("/suggestions", async (req, reply) => {
    const bodySchema = z.object({
      climate: z.string(),
      region: z.string(),
      attraction: z.array(z.string()),
    });

    const { climate, region, attraction } = bodySchema.parse(req.body);

    const prompt = `
    Viagem: ''' ${climate}, ${region}, ${attraction.join(", ")} '''.
    
    Retorne APENAS uma lista de melhores cidades turísticas baseadas nos parâmetros citados acima, no formato abaixo:
    
    '''
    - Cidade, Estado (IATA CODE)
    '''
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const output = response.choices[0]?.message?.content || "";
    const cityList = output
      .split("\n")
      .map((line) => {
        const match = line.match(/- (.+), (.+) \((.+)\)/);
        if (match) {
          const [, city, state, iata] = match;
          return {
            city: city.trim(),
            state: state.trim(),
            iata: iata.trim(),
          };
        }
        return null;
      })
      .filter(Boolean);

    return cityList
  });
};

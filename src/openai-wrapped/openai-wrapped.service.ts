import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { ChatCompletionStream, ChatCompletionStreamParams } from "openai/lib/ChatCompletionStream";

@Injectable()
export class OpenAIWrappedService {
  constructor(private configService: ConfigService) {}

  async generateCompletion(systemMessage: string, userMessage: string, temperature: number): Promise<string> {
    const completionsModel: string = this.configService.get("openai.completionsModelName")!;
    const openAIKey: string = this.configService.get("openai.APIKey")!;

    const openai = new OpenAI({
      apiKey: openAIKey,
    });

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: temperature / 10,
      n: 1,
      model: completionsModel,
    };

    const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params).catch((e) => {
      if (e instanceof Error) {
        throw new Error(`Error from openAI: ${e.message}`);
      }

      throw new Error("unhandled error from OpenAI");
    });

    if (!response.choices[0]) {
      throw new Error("Could not complete openAI API request - no response choices returned");
    }

    if (!response.choices[0].message.content) {
      throw new Error("OpenAI returned a null response in the message content");
    }

    return response.choices[0].message.content;
  }

  getChatStream(systemMessage: string, userMessage: string, temperature: number): ChatCompletionStream {
    const completionsModel: string = this.configService.get("openai.completionsModelName")!;
    const openAIKey: string = this.configService.get("openai.APIKey")!;

    const openai = new OpenAI({
      apiKey: openAIKey,
    });

    const params: ChatCompletionStreamParams = {
      stream: true,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: temperature / 10,
      n: 1,
      model: completionsModel,
    };

    return openai.beta.chat.completions.stream(params);
  }

  async generateEmbedding(input: string): Promise<number[]> {
    const embeddingModel: string = this.configService.get("openai.embeddingsModelName")!;
    const embeddingDimensions: number = parseInt(this.configService.get("openai.embeddingsModelDimensions")!);
    const openAIKey: string = this.configService.get("openai.APIKey")!;

    const openai = new OpenAI({
      apiKey: openAIKey,
    });

    const params: OpenAI.Embeddings.EmbeddingCreateParams = {
      model: embeddingModel,
      dimensions: embeddingDimensions,
      input,
    };

    const response: OpenAI.Embeddings.CreateEmbeddingResponse = await openai.embeddings.create(params).catch((e) => {
      if (e instanceof Error) {
        throw new Error(`Could not complete openAI API request: ${e.message}`);
      }

      throw new Error("unhandled error from OpenAI");
    });

    if (response.data.length === 0) {
      throw new Error("Data embeddings from OpenAI empty");
    }

    return response.data[0].embedding;
  }
}

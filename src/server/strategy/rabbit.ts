import { Message } from "@common/message";
import {Provider, Providers} from "@common/provider";

export class Rabbit implements Provider {
  canHandle(name: string): boolean {
    return name === Providers.Rabbit;
  }

  run(): void {
    console.log("Método run da Rbbit");
  }

  publish(topic: string, message: Message): void {
    throw new Error("Method not implemented.");
  }
  
  subscribe(topic: string, listener: (message: Message) => void): void {
    throw new Error("Method not implemented.");
  }
}
import {Message} from "./message";

export interface Provider {
  canHandle(name: string): boolean;
  run(): void;
  publish(topic: string, message: Message): void;
  subscribe(topic: string, listener: (message: Message) => void): void;
}

export const enum Providers {
  Default = "default",
  Rabbit = "rabbit"
}
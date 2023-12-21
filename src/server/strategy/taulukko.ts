import {EventEmitter} from 'events';
import {Provider, Providers} from "@common/provider";
import {Message} from '@common/message';

export class Taulukko implements Provider {
  private eventEmitter: EventEmitter;

  canHandle(name: string): boolean {
    return name === Providers.Default;
  }

  run(): void {
    this.eventEmitter = new EventEmitter();
  }

  publish(topic: string, message: Message): void {
    this.eventEmitter.emit(topic, message);
  }

  subscribe(topic: string, listener: (message: Message) => void): void {
    this.eventEmitter.on(topic, listener);
  }
}
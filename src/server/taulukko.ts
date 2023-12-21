 
import {Provider} from "../common/provider"; 
import { ServerData } from './server-data';

export class TaulukkoProvider implements Provider {
  constructor(options:any){}

  open() {
    throw new Error('Method not implemented.');
  }
  close() {
    throw new Error('Method not implemented.');
  }
  forceClose() {
    throw new Error('Method not implemented.');
  }
  data(): ServerData {
    throw new Error('Method not implemented.');
  }
  publishers(): any[] {
    throw new Error('Method not implemented.');
  }
  subscribers(): any[] {
    throw new Error('Method not implemented.');
  }
  sendAll(topic: string, data: any) {
    throw new Error('Method not implemented.');
  } 
}
 
import {  ServerProvider } from "./server-provider";
import { ClientData } from "../client-data"; 
import { ServerData } from '../server-data';
import {serviceStatus} from "../names"; 
import { logerNames,protocolNames,clientTypes} from "../names"; 
import { loggerFactory } from "../../common/logger";
import { WSServer, WSServerOptions, WebSocket  } from "../../ws/"; 
import { ClientOnlineDTO } from "../server-protocols-dtos";
import { Message } from "src/common/message";


const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultServerProvider implements ServerProvider {
  options:TaulukkoProviderOptions;
  status:string;
  wsServer:WSServer;
  private publisherList:Array<ClientData> = new Array();
  private subscriberList:Array<ClientData> = new Array();
 

  constructor(options:any){
    const defaults = { port: 7777, defaultMessage:"Taulukko Message Server is Running" ,showDefaultMessage:true};
    options = Object.assign({}, defaults, options);
    this.options = options as TaulukkoProviderOptions;
    this.options.onConnection = this.onWSSocketConnection;
    this.options.onDisconnect = this.onWSDisconect;
    this.wsServer = WSServer.create(options);
    this.status = serviceStatus.STARTING;
  }

  private onWSSocketConnection(socket:WebSocket){
    logger.info("Taulukko Server Provider new Connection : " , socket);
    socket.emit(protocolNames.CONNECTION_OK,{client:socket.client, server:socket.server});
  }

  private onWSDisconect(socket:WebSocket){
    logger.info("Taulukko Server Provider ends Connection : " , socket);
  }

  private onClientOnline = (socket:WebSocket, data:ClientOnlineDTO)=>{

    let list:Array<ClientData> = this.publisherList;

    if(data.type!=clientTypes.PUBLISHER){
      list=this.subscriberList;
    }
 
    logger.trace(`Taulukko Server Provider receive a ${data.type} connection : ` ,socket,data);
    const clientData:ClientData  = {id:data.id,topics:data.topics,socket} ;
    list.push(clientData);

    socket.emit(protocolNames.REGISTERED,{client:socket.client, server:socket.server});    
  };

  private onNewMessage = (socket:WebSocket, message:Message)=>{
    console.log("Server:onNewMessage");

    let list:Array<ClientData> = this.publisherList;

    const publisherId = socket.client.id;
    if(this.publisherList.map(clientData=>clientData.id).filter(id=>id==publisherId).length == 0){
      logger.error(`A non publisher send a message {publisherId,Message}` ,publisherId,message);
    }

    if(this.publisherList.filter(clientData=>clientData.id==publisherId
       && clientData.topics.filter(topic=>topic==message.topic)).length == 0){
      logger.error(`Topic not found for this publisher {publisherId,Message}` ,publisherId, message);
    }

    this.subscriberList.filter(
      subscriber=>subscriber.topics.filter(
        topic=>topic==message.topic).length==1)
        .forEach(subscriber=>subscriber.socket.emit(protocolNames.NEW_MESSAGE,message) );
  };

  async open() {
    logger.info("Taulukko Server Provider starting with options : " , this.options);
    await  this.wsServer.open();

    await this.wsServer.on(protocolNames.CLIENT_ONLINE,this.onClientOnline); 

    await this.wsServer.on(protocolNames.NEW_MESSAGE,this.onNewMessage); 

    this.status = serviceStatus.ONLINE;
  }

  async close() {
    await this.wsServer.close();
    this.status = serviceStatus.STOPED;
    logger.trace("Taulukko Server Provider ends ");
  }
  async forceClose() {
    try{
      await this.close();
    }
    catch{
      //TODO:LOG
      this.status = serviceStatus.STOPED;
    }
    logger.trace("Taulukko Server Provider ends (forced) ");
  }
  get data(): ServerData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE};
      logger.trace("get data ", ret);
      return ret;
  }
  get publishers():Array<ClientData>{
    return this.publisherList;
  }
  get subscribers(): Array<ClientData>{
    return this.subscriberList;
  }
  async sendAll(topic: string, data: any) {
    throw new Error('Method not implemented.');
  } 
}

interface TaulukkoProviderOptions extends WSServerOptions{
}
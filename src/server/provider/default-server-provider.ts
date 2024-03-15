 
import {  ServerProvider } from "./server-provider";
import { ClientData } from "../client-data"; 
import { ServerData } from '../server-data';
import {serviceStatus, systemTopics} from "../../common/names"; 
import { logerNames,protocolNames,clientTypes} from "../../common/names"; 
import { loggerFactory } from "../../common/log/logger";
import { WSServer, WSServerOptions, WebSocket  } from "../../ws/"; 
import { ClientOffLineDTO, ClientOnLineDTO } from "../server-protocols-dtos";
import { Message } from "../../common/message";
import { AuthProvider } from "../../auth/auth-provider";


const logger = loggerFactory.get(logerNames.LOGGER_DEFAULT);

export class DefaultServerProvider implements ServerProvider {
  options:TaulukkoProviderOptions;
  status:string;
  wsServer:WSServer;
  private publisherList:Array<ClientData> = new Array();
  private subscriberList:Array<ClientData> = new Array();
  private auth:AuthProvider ;
 

  constructor(options:any){
    const defaults = { port: 7777, defaultMessage:"Taulukko Message Server is Running" ,showDefaultMessage:true};
    options = Object.assign({}, defaults, options);
    this.options = options as TaulukkoProviderOptions;
    this.options.onConnection = this.onWSSocketConnection;
    this.options.onDisconnect = this.onWSDisconect;
    this.wsServer = WSServer.create(options);
    this.status = serviceStatus.STARTING;
    this.auth = this.options.auth;
  }

  private onWSSocketConnection(socket:WebSocket){
    logger.log7("Taulukko Server Provider new Connection : " , socket);
    logger.log5("Taulukko Server Provider new Connection : " );
    socket.emit(protocolNames.CONNECTION_OK,{client:socket.client, server:socket.server});
  }

  private onWSDisconect(socket:WebSocket){
    logger.log7("Taulukko Server Provider ends Connection : " , socket);
  }

  private onClientOnline = (socket:WebSocket, data:ClientOnLineDTO)=>{
    logger.log5("onClientOnline ",1 );
    if(this.auth)
    {
      if(!this.auth.validateOnClienteOnline(socket,data))
      {
        logger.log5("onClientOnline " ,2);
        socket.emit(protocolNames.UNREGISTERED);
        return;
      }
    }
    logger.log5("onClientOnline " ,3);

    let list:Array<ClientData> = this.publisherList;

    if(data.type!=clientTypes.PUBLISHER){
      list=this.subscriberList;
    }
 
    logger.log7(`Taulukko Server Provider receive a ${data.type} connection : ` ,socket,data);
    const clientData:ClientData  = {id:data.id,topics:data.topics,socket} ;
    list.push(clientData);

    socket.emit(protocolNames.REGISTERED,{client:socket.client, server:socket.server});    
  };


  private onClientOffline = (socket:WebSocket, data:ClientOffLineDTO)=>{
 
    logger.log7(`Taulukko Server Provider receive a close ${data.type} connection : ` ,socket,data); 
    
    if(data.type==clientTypes.PUBLISHER){
      this.publisherList = this.publisherList.filter((item)=>item.id!=data.id);
    }
    else
    {
      this.subscriberList = this.subscriberList.filter((item)=>item.id!=data.id);
    }
    socket.emit(protocolNames.UNREGISTERED);
  };
 
  private onNewMessage = (socket:WebSocket, message:Message)=>{
    const isSystemTopic:boolean = socket==null;
    const publisherId:string = (socket==null)?null:socket.client.id;
    
    if(!isSystemTopic && this.publisherList.map(clientData=>clientData.id).filter(id=>id==publisherId).length == 0){
      logger.error(`A non publisher send a message {publisherId,Message}` ,publisherId,message);
    }
    
    if(!isSystemTopic &&  this.publisherList.filter(clientData=>clientData.id==publisherId
       && clientData.topics.filter(topic=>topic==message.topic)).length == 0){
      logger.error(`Topic not found for this publisher {publisherId,Message}` ,publisherId, message);
    }

    const subscriberForthisTopic = this.subscriberList.filter(
      subscriber=>isSystemTopic || subscriber.topics.filter(
          topic=>topic==message.topic).length==1);

    subscriberForthisTopic.forEach(item=> item.socket.emit(protocolNames.NEW_MESSAGE,message));

  };

  async open() {
    logger.log5("Taulukko Server Provider starting with port : " , this.options.port);
    logger.log7("Taulukko Server Provider starting with options : " , this.options);
    await  this.wsServer.open();

    await this.wsServer.on(protocolNames.CLIENT_ONLINE,this.onClientOnline); 

    await this.wsServer.on(protocolNames.CLIENT_OFFLINE,this.onClientOffline);

    await this.wsServer.on(protocolNames.NEW_MESSAGE,this.onNewMessage); 

    this.status = serviceStatus.ONLINE;
  }

  async close() {
    await this.wsServer.close();
    this.status = serviceStatus.STOPED;
    logger.log5("Taulukko Server Provider is closed ");
  }
  async forceClose() {
    try{
      await this.close();
    }
    catch{
      //TODO:LOG
      this.status = serviceStatus.STOPED;
    }
    logger.log7("Taulukko Server Provider ends (forced) ");
  }
  get data(): ServerData {
    const ret = {port:this.options.port, status: this.status ,
      online:this.status==serviceStatus.ONLINE,
      offline:this.status!=serviceStatus.ONLINE};
      logger.log7("get data ", ret);
      return ret;
  }
  get publishers():Array<ClientData>{
    return this.publisherList;
  }
  get subscribers(): Array<ClientData>{
    return this.subscriberList;
  }d
  async sendAll( data: any) {
    const message:Message = Message.create({topic:systemTopics.BROADCAST,data});
    this.onNewMessage(null,message);
  }
}

interface TaulukkoProviderOptions extends WSServerOptions{
  auth:AuthProvider
}
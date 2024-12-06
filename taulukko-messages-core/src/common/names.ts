export var logerNames={LOGGER_DEFAULT:"default"};

export var systemTopics={BROADCAST:"broadcast"};

export var serviceStatus = {STARTING : "STARTING",ONLINE:"ONLINE",FAIL:"FAIL",RESTARTING:"RESTARTING",
STOPED:"STOPED"} ;

// Follow the RFC5424 https://datatracker.ietf.org/doc/html/rfc5424#autoid-67
  

export enum  LogLevel{
    DEBUG=7,
    INFO=6,
    NOTICE=5,
    WARNING=4,
    ERROR=3,
    CRITICAL=2,
    ALERT=1,
    EMERGENCY=0 
  }

  
export var protocolNames = {
  CONNECTION_OK: "taulukko.connectionOK",
  CLIENT_ONLINE: "taulukko.clientOnline",
  REGISTERED:"taulukko.clientRegistered",
  UNREGISTERED:"taulukko.clientUnRegister",
  NEW_MESSAGE:"taulukko.newMessage",
  CLIENT_OFFLINE:"taulukko.clientOffline"
} ;
export var clientTypes = {PUBLISHER: "Publisher",SUBSCRIBER: "Subscriber"} ;
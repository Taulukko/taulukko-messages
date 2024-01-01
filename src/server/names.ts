export var logerNames={LOGGER_DEFAULT:"default"};

export var serviceStatus = {STARTING : "STARTING",ONLINE:"ONLINE",FAIL:"FAIL",RESTARTING:"RESTARTING",
STOPED:"STOPED"} ;

export enum  LogLevel{
    TRACE=5,
    DEBUG=4,
    INFO=3,
    ERROR=2,
    CRITICAL=1 
  }

  
export var protocolNames = {CONNECTION_OK: "taulukko.connectionOK",CLIENT_ONLINE: "taulukko.clientOnline",REGISTERED:"taulukko.clientRegistered"} ;
export var clientTypes = {PUBLISHER: "Publisher",SUBSCRIBER: "Subscriber"} ;
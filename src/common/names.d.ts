export declare var logerNames: {
    LOGGER_DEFAULT: string;
};
export declare var systemTopics: {
    BROADCAST: string;
};
export declare var serviceStatus: {
    STARTING: string;
    ONLINE: string;
    FAIL: string;
    RESTARTING: string;
    STOPED: string;
};
export declare enum LogLevel {
    DEBUG = 7,
    INFO = 6,
    NOTICE = 5,
    WARNING = 4,
    ERROR = 3,
    CRITICAL = 2,
    ALERT = 1,
    EMERGENCY = 0
}
export declare var protocolNames: {
    CONNECTION_OK: string;
    CLIENT_ONLINE: string;
    REGISTERED: string;
    UNREGISTERED: string;
    NEW_MESSAGE: string;
    CLIENT_OFFLINE: string;
};
export declare var clientTypes: {
    PUBLISHER: string;
    SUBSCRIBER: string;
};

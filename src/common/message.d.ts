export declare class Message implements MessageDTO {
    private options;
    id: string;
    topic: string;
    data: any;
    private constructor();
    static create(options: MessageOptions): Message;
    get struct(): MessageDTO;
}
export interface MessageOptions {
    id?: string;
    topic: string;
    data: any;
}
export interface MessageDTO {
    id: string;
    topic: string;
    data: any;
}

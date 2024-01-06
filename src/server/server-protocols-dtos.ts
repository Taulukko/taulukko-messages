import { ClientData } from "./client-data";

export interface ClientOnLineDTO extends ClientData{
  type:string;
}


export interface ClientOffLineDTO {
  type:string;
  id:string;
}

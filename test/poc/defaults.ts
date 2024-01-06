
function defaults1(options:any)
{
    let defaults = {id:"a1234", port: 7777 ,topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    console.log("defaults1:options",options);
    console.log("defaults1:this.options",this.options);
}

interface DTO{
    id?:string;
    port:number;
    topics: Array<string>;
}


function defaults2(options:DTO)
{
    let defaults = {id:"a1234", port: 7777 ,topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    console.log("defaults2:options",options);
    console.log("defaults2:this.options",this.options);
}

defaults1({port:1234,topics:["topic1"]});
defaults1({id:undefined,port:1234,topics:["topic1"]});
defaults2( {port:1234,topics:["topic1"]});
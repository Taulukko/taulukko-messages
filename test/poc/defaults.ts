
function defaults1(options:any)
{
    let defaults = {id:"a1234", port: 7777 ,topics:new Array()};
    this.options = Object.assign({}, defaults, options); 
    console.log("options",options);
    console.log("this.options",this.options);
}

defaults1({port:1234,topics:["topic1"]});
defaults1({id:undefined,port:1234,topics:["topic1"]});
defaults1({id:"b1234",port:1234,topics:["topic1"]});

function args1(...args:any)
{
    console.log("args",args);
    console.log("args",...args);
}

args1(1,2,3);
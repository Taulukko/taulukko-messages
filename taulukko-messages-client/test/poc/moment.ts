import * as moment from "moment"; 

var data = moment(new Date()).format('DD/MM/YYYY');

console.log(data);
 
data = moment(new Date()).format('(DD/MM/YYYY) - [LOGLEVEL] - ');

console.log(data);
 
fs = require('fs');

function readFileAsync(input) {
	return new Promise(
		(resolve,reject)=>{
			fs.readFile(input, 'utf8', function (err,data) {
				if(err){
					reject(err)
				}
				// console.log(data);
				resolve(data);
			});
		} );
}

var keySignifier = '##';
var arraySignifier = '#*';

readFileAsync('assets/items/testitem.md').then((data)=>{

	data = data.split(keySignifier);

	data.forEach((item,index)=>{
		var obj = {};
		if(data[index]){
			data[index] = data[index].trim();

			firstLine = /^(.*)\n/;
			keyAndValue = data[index].split(firstLine);

			//Index [0] is an empty string = ''
			key = keyAndValue[1].toLowerCase();
			value = keyAndValue[2].trim();

			if(value.indexOf(arraySignifier)>-1){
				//if it's supposed to be an array, convert to array.
				//filter for empty array elements
				value = value.split(arraySignifier).filter(function(el){return el.length != 0});
				//call trim() on each member
				value = value.map(Function.prototype.call, String.prototype.trim);
			}
			//assign key and value to file object
			obj[key] = value;
			console.log(JSON.stringify(obj,null,3));
		}
	});


});
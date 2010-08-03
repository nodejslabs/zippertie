var path = require("path")
  , fs = require("fs")

exports.getMain=function getMain(folder) {
	var pack=JSON.parse(fs.readFileSync(path.join(folder,"package.json")))
	return pack.main || (pack.scripts?pack.scripts.lib:false) || "."
}

exports.getName=function getMain(folder) {
	var pack=JSON.parse(fs.readFileSync(path.join(folder,"package.json")))
	return pack.name || path.basename(folder)
}

exports.getFiles=function getFiles(folder) {
	var file,files=[]
	//recursively add all .node/.js
	var edges=[folder]
	while(file=edges.shift()) {
		var stat = fs.statSync(file)
		if(edges.indexOf(stat.ino)!=-1)
			continue
		if(stat.isDirectory()) {
			var file_names = fs.readdirSync(file)
			file_names.forEach(function(fd){edges.push(path.join(file,fd))})
		}
		else if(file.slice(-3)==".js") {
			var buff=fs.readFileSync(file).toString()
			buff=JSON.stringify(buff)
			files.push([file,buff])
		}
		else if(file.slice(-5)==".node") {
			var buff=fs.readFileSync(file,'binary').toString()
			var arr=[]
			for(var i=0;i<buff.length;i++) {
				arr[i]=buff.charCodeAt(i)
			}
			files.push([file,JSON.stringify(arr)+".map(function(c){return String.fromCharCode(c)}).join('')"])
		}
	}
	return files
}

var folder=process.argv[2] || "."
function ziptie(folder) {
	var files = exports.getFiles(folder)
	var fd = fs.openSync(exports.getName(folder)+'.js','w')
	var buff=fs.readFileSync(path.join(path.dirname(__filename),"./faux_require.js")).toString()
	fs.writeSync(fd,buff)
	fs.writeSync(fd,";\n")
	//add the files to the statics
	files.forEach(function(pair){
		fs.writeSync(fd,';static_scripts["'+pair[0].slice(path.join(folder,'.').length)+'"] = ')
		var buff=pair[1]
		//Here is the buffer...seems to go berserk?
		fs.writeSync(fd,buff)
		fs.writeSync(fd,';\n')
	})
	fs.writeSync(fd,";module.exports = require('"+exports.getMain(folder)+"');\n")
	//fs.writeFileSync("output.js",output,"utf8")
}
ziptie(folder)
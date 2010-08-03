var ziptie=require("../ziptie")
var fs = require("fs")
var path = require("path")
console.log("OUTPUT")
var folder="./module"
var files = ziptie.getFiles(folder)
var output = ""
console.log(output+=(fs.readFileSync("../faux_require.js")+";\n"))
Object.keys(files).forEach(function(pathname){
	console.log(output+=(';static_scripts["'+
		pathname.slice(path.join(folder,'.').length)+'"] = '+files[pathname]+";\n"))
})
console.log(output+=(";module.exports = require('/"+ziptie.getMain(folder)+"');\n"))
fs.writeFileSync("output.js",output)
var a=require("./output")
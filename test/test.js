var static_scripts = {}
  , require
;(function(){
var _require = require
var path = _require("path")
var Script = process.binding("evals").Script
var path_chain = ['.']
require = function(script_path) {
 	var file = path.join(path.dirname(path_chain[path_chain.length-1]),script_path)
 	function evaluate() {
 		path_chain.push(script_path)
 		var module = {exports:{}}
 		//console.log(static_scripts[script])
 		Script.runInNewContext(static_scripts[file],{
 			"require":require
 			, "global": global
 			, "__filename": file
 			, "__dirname": path.dirname(file)
 			, "console": console
 			, "process": process
 			, "module": module
 			, "exports": module.exports
 		},file)
 		path_chain.pop()
 		return module.exports
 	}
 	//test .js
 	if(file in static_scripts) {
 		script_path = path.join(script_path)
 		return evaluate()
 	}
 	if(file+".js" in static_scripts) {
 		file = file+".js"
 		script_path = path.join(script_path+".js")
 		return evaluate()
 	}
 	if(file+".node" in static_scripts) {
 		file = file+".node"
 		script_path = path.join(script_path+".node")
 		return evaluate()
 	}
 	if(file+"/index.js" in static_scripts) {
 		file = file+"/index.js"
 		script_path = path.join(script_path+"/index.js")
 		return evaluate()
 	}
 	if(file+"/index.node" in static_scripts) {
 		file = file+"/index.node"
 		script_path = path.join(script_path+"/index.node")
 		return evaluate()
 	}
 	return _require(script_path)
 }
 require.paths = _require.paths
})()
var stats = ";console.log('filename:'+__filename);console.log('dirname:'+__dirname)"
static_scripts['main.js'] = "console.log(require('./lib'))"+stats
static_scripts['lib/blah.js'] = "console.log('in blah');module.exports = 'blah return exports'"+stats
static_scripts['lib/index.js'] = "module.exports = require('./blah')"+stats
module.exports = require("main")
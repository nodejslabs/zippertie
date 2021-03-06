var static_scripts = {}
  , require

;(function(){
var _require = require
var fs = require("fs")
var path = _require("path")
var Script = process.binding("evals").Script
var path_chain = ['/']
require = function require(script_path) {

 	//test .js
 	//var check={'.':true,'$':true,'/':true,'~':true}
 	//console.log("script_path :"+path_chain)
 	//if(check[script_path.charAt(0)]) {
 	var mod
	 	path_chain.concat(_require.paths).forEach(function(dir) {if(mod)return
	 	//console.log("D"+dir)
		var file = path.join(dir,script_path)
		//console.log("F"+file)
 		//if(path_chain.length<2) file='/'+file
		function evaluate() {
			path_chain.push(path.dirname(file))
			var module = {exports:{}}
			//console.log(static_scripts[script])
			var subrequire = (function(){
				var old=path_chain.concat();
				return function(){
					var saved = path_chain
					//console.log("SAVED"+saved)
					path_chain=old
					//console.log("old"+old)
					//console.log(arguments[0])
					var mod=require.apply(this,arguments);
					path_chain = saved
					return mod
				}
			})()
			subrequire.paths = require.paths
			Script.runInNewContext(static_scripts[file],{
				"require":subrequire
				, "global": global
				, "__filename": file
				, "__dirname": path.dirname(file)
				, "console": console
				, "process": process
				, "module": module
				, "exports": module.exports
			},file)
			path_chain.pop()
			return mod=module.exports
		}
		function native_evaluate() {
			path_chain.push(file)
			var tmpfd=path.basename(file)
			fs.writeFileSync(tmpfd,static_scripts[file],'binary')
			var module = {exports:{}}
			//console.log(static_scripts[script])
			Script.runInNewContext('process.dlopen("'+tmpfd+'",exports)',{
				"require":require
				, "global": global
				, "__filename": file
				, "__dirname": path.dirname(file)
				, "console": console
				, "process": process
				, "module": module
				, "exports": module.exports
			},file)
			fs.unlink(tmpfd)
			path_chain.pop()
			return mod=module.exports
		}
		//console.log(script_path)
		if(file in static_scripts) {
			script_path = path.join(script_path)
			return mod=evaluate()
		}
		if(file+".js" in static_scripts) {
			file = file+".js"
			script_path = path.join(script_path+".js")
			return mod=evaluate()
		}
		if(file+".node" in static_scripts) {
			file = file+".node"
			script_path = path.join(script_path+".node")
			return mod=native_evaluate()
		}
		if(file+"/index.js" in static_scripts) {
			file = file+"/index.js"
			script_path = path.join(script_path+"/index.js")
			return mod=evaluate()
		}
		if(file+"/index.node" in static_scripts) {
			file = file+"/index.node"
			script_path = path.join(script_path+"/index.node")
			return mod=native_evaluate()
		}
 	})
 	if(mod) return mod
 	//}
 	//console.log("script_path :"+script_path+': '+(script_path.charAt(0)=='.'))
 	try{
 	return _require(script_path)
 	}
 	catch(e){
		throw e
 	}
 }
 require.paths = path_chain
})();
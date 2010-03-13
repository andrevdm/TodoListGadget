//http://weblogs.asp.net/dwahlin/archive/2009/05/03/using-jquery-with-client-side-data-binding-templates.aspx
$.fn.parseTemplate = function(data)
{
	 var str = (this).html();
	 var _tmplCache = {}
	 var err = "";
	 try
	 {
		  var func = _tmplCache[str];
		  if (!func)
		  {
				var strFunc =
				"var p=[],print=function(){p.push.apply(p,arguments);};" +
								"with(obj){p.push('" +
				str.replace(/[\r\t\n]/g, " ")
					.replace(/'(?=[^#]*#>)/g, "\t")
					.split("'").join("\\'")
					.split("\t").join("'")
					.replace(/<#=(.+?)#>/g, "',$1,'")
					.split("<#").join("');")
					.split("#>").join("p.push('")
					+ "');}return p.join('');";

				func = new Function("obj", strFunc);
				_tmplCache[str] = func;
		  }
		  return func(data);
	 } catch (e) { err = e.message; }
	 return "< # ERROR: " + err.toString() + " # >";
}			
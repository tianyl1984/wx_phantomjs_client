var webPage = require("webpage");
var page = webPage.create();

page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:48.0) Gecko/20100101 Firefox/48.0";
page.viewportSize = {width:1024,height:800};

page.onAlert = function(msg){
	console.log("alert:" + msg);
};

page.onConsoleMessage = function(msg){
	console.log(msg);
};

page.onResourceError = function(re){
	console.log(re.url + ":" + re.errorString);
}

page.onError = function(msg,trace){
	var msgStack = ["ERROR:" + msg];
	if(trace && trace.length){
		msgStack.push("Trace:");
		trace.forEach(function(t) {
      		msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    	});
	}
	console.log(msgStack.join("\n"));
};

page.open("https://wx.qq.com",function(status){
	if(status != "success"){
		console.log("open error:" + status)
		return;
	}

	var title = page.evaluate(function(s){
		return document.querySelector(s).innerText;
	},"title");

	console.log(title);
});

var webserver = require("webserver");
var server = webserver.create();
var service = server.listen(8083, function(request,response){
	response.statusCode = 200;
	var url = request.url;
	var action = url.substring(1);
	var fun = actions[action];
	var msg = "";
	if(fun){
		msg = fun();
	}else{
		msg = "error action";
	}
	if(!(typeof msg === "string")){
		msg = JSON.stringify(msg);
	}
	response.write("<html><body>" + msg + "</body></html>");
	response.close();
});

var actions = {
	"screenshot":function(){
		var base64 = page.renderBase64("PNG");
		return "<img src='data:image/png;base64," + base64 + "'><script>setTimeout('window.location.reload()',4000)</script>";
	},
	"selectChat":function(){
		page.sendEvent("click",150,190);
		return "ok";
	},
	"getData":function(){
		var pos = page.evaluate(function(){
			var pos = null;
			$(".nickname_text").each(function(){
				var name = $(this).text();
				if(name == "sender"){
					pos = $(this).offset();
				}
			});
			if(pos == null){
				return null;
			}
			return {"left":pos.left+1,"top":pos.top+1};
		});
		if(pos == null){
			return null;
		}
		page.sendEvent("click",pos.left+1,pos.top+1);
		return page.evaluate(function(){
			var json = [];
			$("#chatArea a[class=app]").each(function(){
				var title = $(this).find("h4").text();
				var orgUrl = $(this).attr("href");
				var url = decodeURIComponent(orgUrl.substring(orgUrl.indexOf("equrl=")+6));
				url = url.substring(0,url.indexOf("#rd"));
				json.push({title:title,url:url});
			});
			return json;
		});
	},
	"":function(){
		return "no action";
	}
};





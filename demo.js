var webPage = require("webpage");
var page = webPage.create();

page.onConsoleMessage = function(msg){
	console.log(msg);
};

page.onResourceReceived = function(resp){
	console.log(JSON.stringify(resp));
};

page.open("https://www.baidu.com",function(status){
	if(status != "success"){
		console.log("open error:" + status)
		return;
	}

	console.log("ok");
});


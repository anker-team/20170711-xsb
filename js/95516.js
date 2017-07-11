(function() {
	if (navigator.userAgent.match(/Html5Plus/i)) {
			var plusReady = function(callback) {
				if (window.plus) {
						callback();
				 
				} else {
					document.addEventListener("plusready", function() {
						callback();
					}, false);
				}
			}
			plusReady(function () { 
				var webview  = plus.webview.currentWebview();
				var backid = document.getElementById("payback");
				if(backid)
					webview.close();
			});
		}
	
})();
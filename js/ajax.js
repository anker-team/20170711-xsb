
var new_element=document.createElement("script");
new_element.setAttribute("type","text/javascript");
new_element.setAttribute("src","../js/md5.js");// 在这里引入了a.js
document.body.appendChild(new_element);

var load_element=document.createElement("script");
load_element.setAttribute("type","text/javascript");
load_element.setAttribute("src","../js/load.js");// 在这里引入了a.js
document.body.appendChild(load_element);


	//var httpUrl = "http://www.xjcdma.com/yigouWeb/";
	var httpUrl = 'http://61.128.122.87:9692/';
//	var httpUrl = "http://172.26.59.23:8082/yigouWeb2/";
//	var zghdHttpUrl = "http://192.168.253.1:8088/gydata/";
	var zghdHttpUrl ="http://www.xjcdma.com/sett/";
	var app_key = "9e304d4e8df1b74cfa009913198428ab";
	var v = "v1.0";
	var sign_method = "md5";
	var signConstant = "4f4f8dd219bbdde0ae6bbe02be217c3a";
	session_key = localStorage.getItem('session_key');
	
	//获取当前时间戳
	function getTimestamp(){
		return (Date.parse(new Date())/1000).toString();
	}
	//获取sign签名
	function getSign(keyOptions){
		var sign = signConstant;
		var isFirst = false;
		for (var  key in keyOptions) {
			if (!isFirst) {
				sign = sign +key+'='+keyOptions[key];
				isFirst = true;
			}else {
				sign = sign + '&';
				sign = sign +key+'='+ keyOptions[key];
			}
		}
		sign = sign + signConstant;
		return sign;
	}
	//合并要发送的数据
	 function getdata(options,apiName){
		var timestamp = getTimestamp();
		var sign = hex_md5(getSign(options));
		var data = {
			app_key:app_key,
			method:apiName,
			timestamp:timestamp,
			v:'v1.0',
			sign_method:'md5',
			session_key:session_key,
			sign:sign,
		};
		
		for (var key in options) {
			data[key] = options[key];
		}
		return data;
	}
	 
	function logData(data){
		console.log(JSON.stringify(data));
	}
	 
(function(w){
	//获取sessionKey
	w.ajax_get_SessionKey = function(){
		mui.ajax(httpUrl+'OpenApi_search.action',{
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				localStorage.setItem('session_key',data.session_key);
				//关闭启动页面
				closeStartScreent();
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	};
	
	/**
	 * 设置应用本地配置
	 **/
	w.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}
	
		/**
	 * 获取应用本地配置
	 **/
	w.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}
	
	//本地登录——————————————————————————————————————————————————————————————————————————
		w.local_login = function(loginInfo, callback) {
			callback = callback || $.noop;//空操作
			loginInfo = loginInfo || {};
			loginInfo.account = loginInfo.account || '';
			loginInfo.password = loginInfo.password || '';
			if (loginInfo.account.length < 5) {
				return callback('账号最短为 5 个字符');
			}
			if (loginInfo.password.length < 6) {
				return callback('密码最短为 6 个字符');
			}
			var users = JSON.parse(localStorage.getItem('$users') || '[]');
	//		for(var i in users){
	//			console.log(users[i].account);
	//		}
			var authed = users.some(function(user) {
				return loginInfo.account == user.account && loginInfo.password == user.password;
			});
			if (authed) {
				return w.createState(loginInfo.account, callback);
			} else {
				return callback('用户名或密码错误');
			}
		};

	w.createState = function(name, callback) {
		var state = w.getState();
		state.account = name;
		state.token = "token123456789";
		w.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	w.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		plus.nativeUI.showWaiting();
		mui.ajax(httpUrl+"OpenApi_reg.action",
			{
			data:regInfo,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	};

	/**
	 * 获取当前状态
	 **/
	w.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	w.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = w.getSettings();
		//settings.gestures = '';
		//w.setSettings(settings);
	};
//——————————————————————————————————————————————————————————————
	
	//用户注册
	w.ajax_register = function(options){
		var data = getdata(options,'com.huihoo.user.register');
		mui.ajax(httpUrl,{
			data:data,
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				registerSeccess(data);
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	
	
	//用户登陆
	w.ajax_login = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback||$noop;
		//var data = getdata(options,'com.huihoo.user.login');
		mui.ajax(httpUrl+"OpenApi_login.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				data.account = options.account;
				data.password= options.password;
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	
	//修改密码
	w.ajax_change_pwd = function(options){
		//var data = getdata(options,'com.huihoo.user.change_pwd');
		mui.ajax(httpUrl+"OpenApi_savePwd.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				changePwdSuccess(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//修改密码
	w.ajax_login_change_pwd = function(options){
		//var data = getdata(options,'com.huihoo.user.change_pwd');
		mui.ajax(httpUrl+"OpenApi_changePwd.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'post',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				changePwdSuccess(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//退出登录
	w.ajax_logout = function(options){
		var data = getdata(options,'com.huihoo.user.loginout');
		mui.ajax(httpUrl,{
			data:data,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				logoutSuccess(data);
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	
	//获取分类第一级
	w.ajax_get_first_category = function(options) {
		startLoad();
		var data = getdata(options,'com.huihoo.category.first_category');
		mui.ajax(httpUrl,{
			data:data,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){				
				logData(data);
				setTimeout(function(){
					endLoad();
					categoryStairSuccess(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	
	//获取分类第二级
	w.ajax_get_sub_category = function(options){
		startLoad();
		var data = getdata(options,'com.huihoo.category.sub_category');
		mui.ajax(httpUrl,{
			data:data,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					categoryMoversSuccess(options.parent_category_id,data);
				},500);
				
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	
	//获取分类产品
	w.ajax_get_product_list = function(options){
		startLoad();
		var data = getdata(options,'com.huihoo.product.product_list');
		mui.ajax(httpUrl,{
			data:data,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					productlistSuccess(data);
				},500);
				
				
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	
	//查询用户喜欢的商品
	w.ajax_get_likelist = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.user.collect_list');
		mui.ajax(httpUrl+"OpenApi_getCategoryList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					likelistSuccess(data);
				},500);
				
				
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	
	//删除喜欢的商品
	w.ajax_delete_likeItem = function(options){
		startLoad();
		var data = getdata(options,'com.huihoo.user.delete_collect');
		mui.ajax(httpUrl,{
			data:data,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:10000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				data.id = options.product_id;
				setTimeout(function(){
					endLoad();
					deleteItemSuccess(data);
				},500);
				
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
		
	}
	
	//商品详情
	w.ajax_get_product_detail = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		//console.log(httpUrl+"OpenApi_phoneDetail.action");
		mui.ajax(httpUrl+"OpenApi_phoneDetail.action",
			{
			data:{pid:options.product_id},
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				data.id = options.product_id;
				setTimeout(function(){
					endLoad();
					productDetailSuccess(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('服务器连接出错');
			}
		});
	}
	
	//获取首页跑马灯
	w.ajax_get_Marquee = function(options){
		var data = getdata(options,'com.huihoo.content.paomadeng');
		mui.ajax(httpUrl,{
			data:data,
			dataType:'json',
			type:'get',
			timeout:10000,
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getMarqueeSuccess(data);
				},500);
				
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	//获取推荐商品
	w.ajax_get_Recommend = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.get_hot_products');
		mui.ajax(httpUrl+"OpenApi_indexPhones.action",
			{
			data:options,
			dataType:'json',
			type:'get',
			timeout:10000,
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getRecommendSuccess(data);
				},500);
				
				
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	
	//购物车商品保存在本地
	w.ajax_save_cart = function(phoneInfo){
		var carts = JSON.parse(localStorage.getItem('$cart') || '[]');
		var flag = true;
		//if(carts){//购物车非空
			for(var i in carts){
				if(phoneInfo.prdsellid==carts[i].prdsellid && phoneInfo.color == carts[i].color){//同一机型有不同颜色
					phoneInfo.num = ""+(parseInt(carts[i].num)+1);
					carts.splice(i,1,phoneInfo); //splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目。
					flag = false;
				}				
			}
			if(flag){
				carts.push(phoneInfo);
			}
			
				
			localStorage.setItem('$cart', JSON.stringify(carts));
			console.log(localStorage.getItem('$cart') );
		//}
	}
	
	//获取购物车商品信息
	w.ajax_get_cart = function(){
		startLoad();
		var carts = JSON.parse(localStorage.getItem('$cart') || '[]');
		for(var i in users){
			console.log(users[i].account);
		}
	}
	
	//获取物流信息
	w.ajax_get_logis_detail = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		//console.log(httpUrl+"OpenApi_phoneDetail.action");
		mui.ajax(httpUrl+"OpenApi_logistics.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					logisticsListSuccess(data);
				},500);
				
				
			},
			error:function(xhr,type,errorThrown){
				
			}
		});
	}
	
	//保存订单信息到数据库
	w.ajax_save_order = function(orderInfo,callback){
		callback = callback ||$.noop;
		console.log(JSON.stringify(orderInfo));
		mui.ajax(httpUrl+"OpenApi_saveOrder.action",
			{
			data:{sparams:JSON.stringify(orderInfo)},
			dataType:'json',//服务器返回json格式数据
			//contentType:'application/json',
			type:'post',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('服务器连接出错');
			}
		});
	}
	
	//获取支付接口页面
	w.ajax_get_order_interface = function(options){
		//startLoad();
		mui.ajax(httpUrl+"OpenApi_wappay.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			//timeout:100000,//超时时间设置为10秒；
			success:function(data){
				console.log(JSON.stringify(data));
				if(data.state =='404'){ //未生成订单，给予提示
					plus.nativeUI.toast(data.errmsg);
					return;
				}
				var web = plus.webview.create('', "beecloudPay");
				web.setJsFile('_www/js/95516.js');
				web.addEventListener('loaded', function() {
					if (!web.isVisible()) {
						web.show();
					}
				});
				web.loadData(data.html);
			},
			
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('服务器连接出错');
			}
		});
	}
	
	//获取靓号接口页面
	w.ajax_get_phone_number_interface = function(options){
		//startLoad();
		mui.ajax(httpUrl+"Member_wapexchange.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			//timeout:100000,//超时时间设置为10秒；
			success:function(data){
				console.log(JSON.stringify(data));
				if(data.state =='404'){ //未生成订单，给予提示
					plus.nativeUI.toast(data.errmsg);
					return;
				}
				var web = plus.webview.create('', "lianghao");
				web.addEventListener('loaded', function() {
					if (!web.isVisible()) {
						web.show();
					}
				});
				web.loadData(data.html);
			},
			
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//查询用户默认选择的收货地址
	w.ajax_get_selected_adress = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		//console.log(httpUrl+"OpenApi_phoneDetail.action");
		mui.ajax(httpUrl+"OpenApi_getAdress.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getSeletedAdress(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//查询用户所有的收货地址信息
	w.ajax_get_address = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		//console.log(httpUrl+"OpenApi_phoneDetail.action");
		mui.ajax(httpUrl+"OpenApi_getAdressList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getAdressList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_address_detail = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		//console.log(httpUrl+"OpenApi_phoneDetail.action");
		mui.ajax(httpUrl+"OpenApi_getDetailAdress.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getDetailAdress(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//提交保存详细地址 信息
	w.ajax_post_detail_address_info = function(options,callback){
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_saveDetailAdress.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			//contentType:'application/json',
			type:'post',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_delete_selected_address = function(options,callback){
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_deleteAddress.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			//contentType:'application/json',
			type:'post',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_myorder_list = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getOrderList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				endLoad();
			}
		});
	}
	
	w.ajax_get_barcode_order_list = function(options){
		plus.nativeUI.showWaiting();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getCodeOrderList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_barcode_order_code_list = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getOrderCodeList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_post_sign_order = function(options,callback){
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_postOrderSign.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			//contentType:'application/json',
			type:'post',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_current_commission_info = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getCommissionSum1.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
		
	}
		
	w.ajax_get_commission_detail_list = function(options){
		plus.nativeUI.showWaiting();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getCommissionList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getComOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_commission_menu_order_list = function(options){
		plus.nativeUI.showWaiting();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getCommissionOrderList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getComOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_commission_order_detail = function(options,callback){
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getCommissionOrderDetail.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_barcode_info = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getBarCode.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	//
	w.ajax_get_commission_index_detail_list = function(options){
		plus.nativeUI.showWaiting();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getCommissionSumList1.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					getComIndexList(data);
					plus.nativeUI.closeWaiting();
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
		
	}
	
	//获取佣金分类的相关信息，二级页面
	w.ajax_get_commission_classification = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getCommissionClassification.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//获取服务器时间
	w.ajax_get_server_time = function(options,callback){
		callback = callback ||$.noop;
		startLoad();		
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getServerTime.action",
			{
			data:options,
			dataType:'text',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			 
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_area_commission = function(options,callback){
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getCommissionNetList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			//contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_package_commission = function(options,callback){
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getCommissionPackageList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			//contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//打开软键盘
	w.openSoftKeyboard = function() {
		if (mui.os.ios) {
			var webView = plus.webview.currentWebview().nativeInstanceObject();
			webView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		} else {
			var webview = plus.android.currentWebview();
			plus.android.importClass(webview);
			webview.requestFocus();
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
		}
	};
	
	w.ajax_get_reportList = function(options,callback){
		callback = callback ||$.noop;
		startLoad();		
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_search.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_report_sale = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_reportSale.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_vcode = function(options,callback){
		callback = callback ||$.noop;
		plus.nativeUI.showWaiting();
		mui.ajax(httpUrl+"OpenApi_getVcode.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	w.ajax_get_login_code = function(options,callback){
		callback = callback ||$.noop;
		startLoad();
		mui.ajax(httpUrl+"OpenApi_getLogincode.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_bind_phone = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_bindPhone.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_unbind_phone = function(options,callback){
		callback = callback ||$.noop;
		startLoad();		
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_unbindPhone.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_bind_yigou = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_bindYiGou.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_unbind_yigou = function(options,callback){
		callback = callback ||$.noop;
		startLoad();		
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_unbindYiGou.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_bind_sale = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_bindSale.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_forget_phone = function(options,callback){
		callback = callback ||$.noop;
		startLoad();		
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_loginPhone.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_photo = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getPhoto.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_delete_salenum = function(options,callback){
		callback = callback ||$.noop;
		startLoad();		
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_deleteSalenum.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_good_phonenum_list = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_wapexchange.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getComOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				endLoad();
			}
		});
	}
	
	w.ajax_get_good_phonenum_query = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getGoodPhoneNumQuery.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	w.ajax_post_good_phonenum = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_wapbfcardinfo.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	/**
	 * 关闭等待框
	 */
	w.closeWaiting=function(){
		waiting&&waiting.close();
		waiting=null;
	}

	// 处理点击事件
	var openw=null,waiting=null;
	/**
	 * 打开新窗口
	 * @param {URIString} id : 要打开页面url
	 * @param {boolean} wa : 是否显示等待框
	 * @param {boolean} ns : 是否不自动显示
	 * @param {JSON} ws : Webview窗口属性
	 */
	w.clicked=function(id,wa,ns,ws){
		if(openw){//避免多次打开同一个页面
			return null;
		}
		if(w.plus){
			wa&&(waiting=plus.nativeUI.showWaiting());
			ws=ws||{};
			ws.scrollIndicator||(ws.scrollIndicator='none');
			ws.scalable||(ws.scalable=false);
			var pre='';//'http://192.168.1.178:8080/h5/';
			openw=plus.webview.create(pre+id,id,ws);
			ns||openw.addEventListener('loaded',function(){//页面加载完成后才显示
	//		setTimeout(function(){//延后显示可避免低端机上动画时白屏
				openw.show(as);
				closeWaiting();
	//		},200);
			},false);
			openw.addEventListener('close',function(){//页面关闭后可再次打开
				openw=null;
			},false);
			return openw;
		}else{
			w.open(id);
		}
		return null;
	};
	
	w.ajax_get_commission_menu_detail_list = function(options){
		startLoad();
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_getCommissionMenuList.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					endLoad();
					getComOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				endLoad();
			}
		});
	}
	
	w.ajax_get_percent_query = function(options){
		plus.nativeUI.showWaiting();
		mui.ajax(httpUrl+"OpenApi_getPercentQuery.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getDetailData(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_report_register = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		//var data = getdata(options,'com.huihoo.product.product_detail');
		mui.ajax(httpUrl+"OpenApi_reportRegister.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//异网客商生成二维码
	w.ajax_get_barcode = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_setBarCode.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	//异网客商生成采购订单
	w.ajax_cart_save = function(orderInfo,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		console.log(JSON.stringify(orderInfo));
		mui.ajax(httpUrl+"OpenApi_saveCart.action",
			{
			data:{sparams:JSON.stringify(orderInfo)},
			dataType:'json',//服务器返回json格式数据
			/*contentType:'application/json',*/
			type:'post',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	w.ajax_get_network_user_detail = function(options){
		plus.nativeUI.showWaiting();
		mui.ajax(httpUrl+"OpenApi_getNetworkUser.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getNetworkUserList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_network_barcode_info = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getNetworkBarCode.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	w.ajax_network_save = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_saveNetworkMoney.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				plus.nativeUI.closeWaiting();
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
				plus.nativeUI.closeWaiting();
			}
		});
	}
	
	w.ajax_get_network_user_bill = function(options){
		plus.nativeUI.showWaiting();
		mui.ajax(httpUrl+"OpenApi_getNetworkUserBill.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getNetworkUserList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_network_bill = function(options){
		plus.nativeUI.showWaiting();
		mui.ajax(httpUrl+"OpenApi_getNetworkUserBill.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getNetworkUserList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	//
	w.ajax_get_network_money_index = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getNetworkUserIndex.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_network_index = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		mui.ajax(httpUrl+"OpenApi_getNetworkIndex.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_network_money_detail = function(options){
		plus.nativeUI.showWaiting();
		mui.ajax(httpUrl+"OpenApi_getNetworkMoneyByMonth.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				plus.nativeUI.closeWaiting();
				getNetworkUserList(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	
	w.ajax_get_network_money_user_detail = function(options){
		plus.nativeUI.showWaiting();
		mui.ajax(httpUrl+"OpenApi_getNetworkMoneyUserByMonth.action",
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				plus.nativeUI.closeWaiting();
				getNetworkUserList(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_index = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		var th =zghdHttpUrl+"appIndex";
		console.log(th);
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_jl = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		var th =zghdHttpUrl+"appIndexJl";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_jl_list = function(options){
		plus.nativeUI.showWaiting();
		var th =zghdHttpUrl+"appIndexJlList";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getComOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_pay_list = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		var th =zghdHttpUrl+"appIndexPayList";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_vcode = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		var th =zghdHttpUrl+"getValidateCode";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_post_zghd_payment = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		var th =zghdHttpUrl+"saveAppIndexOrder";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_ling_list = function(options){
		plus.nativeUI.showWaiting();
		var th =zghdHttpUrl+"appIndexLingList";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getComOrderList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_jl_list_detail = function(options,callback){
		callback = callback ||$.noop;
		var th =zghdHttpUrl+"appIndexJlDetail";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			contentType:'application/json',
			type:'get',//HTTP请求类型
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data); 
				return callback(data);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_list = function(options){
		plus.nativeUI.showWaiting();
		var th =zghdHttpUrl+"appIndexList";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getActivityList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_detail = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		var th =zghdHttpUrl+"appIndexListDetail";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_detail_rule = function(options,callback){
		plus.nativeUI.showWaiting();
		callback = callback ||$.noop;
		var th =zghdHttpUrl+"appIndexListDetailRule";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					return callback(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
	w.ajax_get_zghd_phone = function(options){
		plus.nativeUI.showWaiting();
		var th =zghdHttpUrl+"appIndexListDetailPhone";
		mui.ajax(th,
			{
			data:options,
			dataType:'json',//服务器返回json格式数据
			type:'get',//HTTP请求类型
			contentType:'application/json',
			timeout:100000,//超时时间设置为10秒；
			success:function(data){
				logData(data);
				setTimeout(function(){
					plus.nativeUI.closeWaiting();
					getPhoneList(data);
				},500);
			},
			error:function(xhr,type,errorThrown){
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('请求失败，请检查网络');
			}
		});
	}
})(window);

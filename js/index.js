$('body').bind('touchmove', function(e) { 

   // console.log($(this).scrollTop()); // 计算你的屏幕高度
    var bannerHeight = $("#productSlider").height();
    var header = $('.own-main-background-color');
    //var headerHeight = bannerHeight-header.height()
    if($(this).scrollTop() > bannerHeight){
    	header.css('background','white')
    }
    else if($(this).scrollTop()<bannerHeight){
    	header.css('background','rgba(255,255,255,0.5)')
    }
});

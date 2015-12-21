var visual = {
	init:function(){
		if (!Modernizr.csstransitions || !Modernizr.cssanimations) {
			$.fn.transition=$.fn.animate;
			$.fn.transitionStop=$.fn.stop;
		}
	}
}
var share = {
	init:function(){

	},
	sendPoint:function(_n,_network){
		var network 	= _network;
		//шлем ajax на создание картинки
		var data = {};
	 	var url = 'share.php?point='+_n
        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            async: false,
            beforeSend: function() {

            },  
            complete: function() {
        		
            },
            success: function(obj) {
                console.log(obj);
                if(obj['success']){
                	var purl 		= obj['share_url'];
					var ptitle 		= obj['share_title'];
					var pimg 		= obj['share_image'];
					var text 		= obj['share_description'];
	            	share.share(network,purl, ptitle, pimg, text);
                    
                }else{
                   console.log('не удалось расшарить');
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText  + "\r\n" +xhr);
            } 
        });
		
	},
	popup: function(url) {
		window.open(url,'','toolbar=0,status=0,width=626,height=436');
	},
	share:function(network,purl, ptitle, pimg, text){

	if ( network == "vk") {
	  url  = 'http://vkontakte.ru/share.php?';
	  url += 'url='          + encodeURIComponent(purl);
	  url += '&title='       + encodeURIComponent(ptitle);
	  url += '&description=' + encodeURIComponent(text);
	  url += '&image='       + encodeURIComponent(pimg);
	  url += '&noparse=true';
	  share.popup(url);
	} 
	if ( network == "fb" ) {
	  url  = 'http://www.facebook.com/sharer.php?s=100';
	  url += '&p[title]='     + encodeURIComponent(ptitle);
	  url += '&p[summary]='   + encodeURIComponent(text);
	  url += '&p[url]='       + encodeURIComponent(purl);
	  url += '&p[images][0]=' + encodeURIComponent(pimg);
	  share.popup(url);
	}
	if ( network == "twitter") {
	  url  = 'http://twitter.com/share?';
	    url += 'text='      + encodeURIComponent(ptitle);
	    url += '&url='      + encodeURIComponent(purl);
	    url += '&counturl=' + encodeURIComponent(purl);
	  	share.popup(url);
	}
	if ( network == "ok") {
	  url  = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
	  url += '&st.comments=' + encodeURIComponent(text);
	  url += '&st._surl='    + encodeURIComponent(purl);
	  share.popup(url);
	} 
	if ( network == "mailru" ) {
	  url  = 'http://connect.mail.ru/share?';
	  url += 'url='          + encodeURIComponent(purl);
	  url += '&title='       + encodeURIComponent(ptitle);
	  url += '&description=' + encodeURIComponent(text);
	  url += '&imageurl='    + encodeURIComponent(pimg);
	  share.popup(url)
	}
	}
};
var gameisready = false;
var glassSound = document.getElementById("glassSound");
var pickSound = document.getElementById("pickSound");

function initHTMLDOM(){
	gameisready = true;
}
function changeVolume(value){		
	pickSound.volume = value;
	glassSound.volume = value;		 
}
function shareScores(value, n){			
	share.sendPoint(value, n) 		 
}

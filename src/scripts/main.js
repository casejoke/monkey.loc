var headWidth, headMarginLeft;
headWidth = document.documentElement.clientWidth;
headMarginLeft = -(headWidth - 960)/2;
$('#head').css({"width":headWidth,"margin-left":headMarginLeft});

$(document).ready(function(){
	init();
	function init(){
		if ( gameisready == false ) {
			setTimeout(init,60);
			return;
		}
		
		var redBox;
		var canvas;
		var elements = [];
	    elements[0] = $('#head');
	    elements[1] = $('#red-box');
	    elements[2] = $('#box1');
	    elements[3] = $('#box2');
	    elements[4] = $('#box3');
	    elements[5] = $('#box4');
	    elements[6] = $('#box5');
	    elements[7] = $('#menu');

	    for ( var i = 0; i < elements.length; i++ ) {
	        if (i == 1) {
	            elements[i].delay(500+100*i).transition({x:0,y:0,scale:1}, 500, invalidate);
	        } else {
	            elements[i].delay(500+0*i).transition({x:0,y:0}, 500);
	        }
	    }
		function invalidate(){		
			redBox = window.document.getElementById("red-box");
			canvas = $("canvas");		
			window.document.body.onresize = function (){
				updatePos(); 
			}		
			updatePos();
			canvas.css({visibility:"visible"});
			$('#red-box').transition({opacity:0}, function(){			
				this.css({visibility:"hidden"});
			});
		}
		function updatePos(){		
			var pos = getPos(redBox);
			canvas.css({position: "absolute", left:pos.x, top:pos.y});
		}
		function getPos(el) {
	    for (var lx=0, ly=0;
	         el != null;
	         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
	    return {x: lx,y: ly};
		}
	}

	visual.init(); 
});
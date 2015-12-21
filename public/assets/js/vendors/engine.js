(function () { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var Ball = function() {
	this.last_position = 0;
	this.active_id = 0;
	this.spawn = [{ x : 504, y : 330},{ x : 752, y : 319},{ x : 273, y : 324},{ x : 386, y : 290},{ x : 643, y : 300},{ x : 278, y : 243},{ x : 514, y : 253},{ x : 736, y : 238},{ x : 633, y : 218},{ x : 396, y : 218},{ x : 339, y : 163},{ x : 519, y : 173},{ x : 663, y : 173},{ x : 578, y : 109},{ x : 432, y : 104},{ x : 499, y : 39}];
	PIXI.Container.call(this);
	this.scale.x = 0;
	this.scale.y = 0;
	this.ballTextures = new Array();
	var texture;
	var _g = 1;
	while(_g < 8) {
		var i = _g++;
		texture = PIXI.Texture.fromFrame("ball" + i + ".png");
		this.ballTextures.push(texture);
	}
	this.crashed1Textures = new Array();
	this.crashed2Textures = new Array();
	this.crashed3Textures = new Array();
	this.crashed4Textures = new Array();
	this.crashed5Textures = new Array();
	this.crashed6Textures = new Array();
	this.crashed7Textures = new Array();
	var _g1 = 1;
	while(_g1 < 6) {
		var i1 = _g1++;
		this.crashed1Textures.push(PIXI.Texture.fromFrame("ball1_crash000" + i1 + ".png"));
		this.crashed2Textures.push(PIXI.Texture.fromFrame("ball2_crash000" + i1 + ".png"));
		this.crashed3Textures.push(PIXI.Texture.fromFrame("ball3_crash000" + i1 + ".png"));
		this.crashed4Textures.push(PIXI.Texture.fromFrame("ball4_crash000" + i1 + ".png"));
		this.crashed5Textures.push(PIXI.Texture.fromFrame("ball5_crash000" + i1 + ".png"));
		this.crashed6Textures.push(PIXI.Texture.fromFrame("ball6_crash000" + i1 + ".png"));
		this.crashed7Textures.push(PIXI.Texture.fromFrame("ball7_crash000" + i1 + ".png"));
	}
	this.normalBall = new PIXI.extras.MovieClip(this.ballTextures);
	this.addChild(this.normalBall);
	this.normalBall.x = -this.normalBall.width / 2;
	this.normalBall.y = -this.normalBall.height / 2;
	this.brokenBall = new PIXI.extras.MovieClip(this.crashed1Textures);
	this.brokenBall.x = this.normalBall.x - 21;
	this.brokenBall.y = this.normalBall.y;
	this.brokenBall.loop = false;
	this.brokenBall.animationSpeed = 0.5;
	this.addChild(this.brokenBall);
	this.brokenBall.visible = false;
};
Ball.__super__ = PIXI.Container;
Ball.prototype = $extend(PIXI.Container.prototype,{
	respawn: function(fixed) {
		this.scale.x = 0;
		this.scale.y = 0;
		var tmp_new = Std.random(7);
		while(tmp_new == this.active_id) tmp_new = Std.random(7);
		this.active_id = tmp_new;
		if(this.active_id == 0) this.brokenBall.textures = this.crashed1Textures; else if(this.active_id == 1) this.brokenBall.textures = this.crashed2Textures; else if(this.active_id == 2) this.brokenBall.textures = this.crashed3Textures; else if(this.active_id == 3) this.brokenBall.textures = this.crashed4Textures; else if(this.active_id == 4) this.brokenBall.textures = this.crashed5Textures; else if(this.active_id == 5) this.brokenBall.textures = this.crashed6Textures; else this.brokenBall.textures = this.crashed7Textures;
		this.brokenBall.gotoAndStop(0);
		this.normalBall.gotoAndStop(this.active_id);
		var pos = this.spawn.shift();
		this.spawn.push(pos);
		if(fixed == true) {
			this.x = 300;
			this.y = 300;
		} else {
			this.x = pos.x;
			this.y = pos.y;
		}
		this.brokenBall.visible = false;
		this.normalBall.visible = true;
		utils.Ticker.add($bind(this,this.increaseSize));
	}
	,crash: function() {
		this.brokenBall.visible = true;
		this.normalBall.visible = false;
		this.brokenBall.gotoAndPlay(0);
	}
	,increaseSize: function() {
		this.scale.x += 0.1;
		this.scale.y += 0.1;
		if(this.scale.x >= 1) {
			this.scale.set(1,1);
			utils.Ticker.remove($bind(this,this.increaseSize));
		}
	}
});
var BallController = function(monkey,background,layer) {
	this.scores = 0;
	this.ignorePick = false;
	this.ballDropped = false;
	this.dir = -1;
	this.speed = 3;
	this.defSpeed = 3;
	this.max = 712;
	this.min = 148;
	this.velocityY = 0;
	this._friction = 0.95;
	this._gravity = 2;
	this.ball = new Ball();
	layer.addChildAt(this.ball,layer.children.length - 3);
	this.stage = layer;
	this.mon = monkey;
	this.bg = background;
	this.hitZone = new PIXI.Rectangle(0,0,60,20);
	this.ballZone = new PIXI.Rectangle(0,0,40,40);
};
BallController.prototype = {
	execute: function() {
		this.scores = 0;
		this.ball.respawn(true);
		this.stage.serviceName.display(this.ball.active_id,this.ball.x,this.ball.y);
		this.mon.play();
		this.bg.interactive = true;
		this.bg.on("mouseup",$bind(this,this.dropBall));
		this.bg.on("touchend",$bind(this,this.dropBall));
		utils.Ticker.add($bind(this,this.ENTER_FRAME));
	}
	,lost: function() {
		utils.Ticker.remove($bind(this,this.ENTER_FRAME));
		window.glassSound.play();
		this.bg.interactive = false;
		this.bg.off("mouseup",$bind(this,this.dropBall));
		this.bg.off("touchend",$bind(this,this.dropBall));
		this.mon.stop();
		this.ballDropped = false;
		this.speed = this.defSpeed;
		this.velocityY = 0;
		this.mon.animationSpeed = 1;
		this.ball.crash();
		this.stage.yourResult.show(this.scores);
		this.stage.ingamescore.hide();
		this.stage.allowReplay();
	}
	,pick: function() {
		window.pickSound.play();
		this.scores++;
		this.stage.ingamescore.updateValue(this.scores);
		this.velocityY = 0;
		this.speed += 0.28;
		this.mon.animationSpeed += 0.1;
		this.ballDropped = false;
		this.ball.respawn(false);
		this.stage.serviceName.display(this.ball.active_id,this.ball.x,this.ball.y);
	}
	,ENTER_FRAME: function() {
		this.hitZone.x = this.mon.x + 32;
		this.hitZone.y = this.mon.y + 83;
		this.ballZone.x = this.ball.x - 20;
		this.ballZone.y = this.ball.y - 20;
		if(this.hitTest(this.hitZone,this.ballZone)) {
			if(this.ignorePick == false) this.pick();
		}
		if(this.ballDropped) {
			this.velocityY *= this._friction;
			this.velocityY += this._gravity;
			this.ball.y += this.velocityY;
			if(this.ball.x > this.mon.x && this.ball.x < this.mon.x) this.lost();
			if(this.ball.y > 500) {
				this.ignorePick = true;
				this.lost();
			}
		}
		this.mon.x -= this.speed * this.dir;
		if(this.mon.x < this.min) this.dir *= -1;
		if(this.mon.x > this.max) this.dir *= -1;
	}
	,dropBall: function() {
		if(!this.ballDropped) {
			this.stage.serviceName.hide();
			this.velocityY = -15;
			this.ballDropped = true;
			this.ignorePick = false;
			this.stage.firstPlayInited();
		}
	}
	,hitTest: function(rect1,rect2) {
		if(rect1.x + rect1.width > rect2.x) {
			if(rect1.x < rect2.x + rect2.width) {
				if(rect1.y + rect1.height > rect2.y) {
					if(rect1.y < rect2.y + rect2.height) return true;
				}
			}
		}
		return false;
	}
};
var Decor = function() {
	this.lightsCoords = [{ x : 967, y : 602, r : -3.0682888250060314},{ x : 881, y : 613, r : -2.6197392072434886},{ x : 809, y : 604, r : 2.73318560862312},{ x : 723, y : 627, r : -2.9897490086662866},{ x : 655, y : 606, r : -0.5323254218582705},{ x : 572, y : 621, r : 2.7960174616949156},{ x : -20, y : 612, r : -0.26005405854715513},{ x : 50, y : 627, r : -3.080506129769992},{ x : 131, y : 629, r : 2.792526803190927},{ x : 214, y : 596, r : -2.6598817800393584},{ x : 270, y : 624, r : 2.7523842303950574},{ x : 345, y : 594, r : 2.813470754214859},{ x : 415, y : 627, r : -2.6302111827554544},{ x : 495, y : 598, r : 0.7853981633974483}];
	PIXI.Container.call(this);
	this.decorTextures = new Array();
	this.decorTextures[0] = PIXI.Texture.fromFrame("Light1");
	this.decorTextures[1] = PIXI.Texture.fromFrame("Light2");
	this.decorTextures[2] = PIXI.Texture.fromFrame("Light3");
	var _g1 = 0;
	var _g = this.lightsCoords.length;
	while(_g1 < _g) {
		var i = _g1++;
		var bulb = new PIXI.extras.MovieClip(this.decorTextures);
		bulb.anchor.set(0.5,0.5);
		bulb.x = this.lightsCoords[i].x;
		bulb.y = this.lightsCoords[i].y;
		bulb.rotation = this.lightsCoords[i].r;
		bulb.gotoAndStop(i % 3);
		bulb.animationSpeed = 0.025;
		bulb.play();
		this.addChild(bulb);
	}
};
Decor.__super__ = PIXI.Container;
Decor.prototype = $extend(PIXI.Container.prototype,{
});
var HxOverrides = function() { };
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
var InGameScore = function() {
	PIXI.Container.call(this);
	this.scoreField = new PIXI.Sprite(Main.Assets.score);
	this.x = 10;
	this.y = 10;
	this.addChild(this.scoreField);
	this.text_field = new PIXI.extras.BitmapText("0",{ font : "50px Baveuse"});
	this.text_field.align = "left";
	this.text_field.x = 125;
	this.text_field.y = 3;
	this.addChild(this.text_field);
	this.hide();
};
InGameScore.__super__ = PIXI.Container;
InGameScore.prototype = $extend(PIXI.Container.prototype,{
	updateValue: function(value) {
		this.text_field.text = value;
	}
	,show: function() {
		this.text_field.text = "0";
		utils.Ticker.add($bind(this,this.fadein));
	}
	,hide: function() {
		this.alpha = 0;
		this.text_field.text = "0";
	}
	,fadein: function() {
		this.alpha += 0.1;
		if(this.alpha >= 1) {
			this.alpha = 1;
			utils.Ticker.remove($bind(this,this.fadein));
		}
	}
});
var Main = function() {
	utils.Ticker.init();
	var options = { };
	options.backgroundColor = 0;
	options.resolution = 1;
	options.autoResize = true;
	this.renderer = PIXI.autoDetectRenderer(960,640,options);
	this.preloader = new PIXI.loaders.Loader();
	this.preloader.add("MonkeyJSON","assets/Monkey.json");
	this.preloader.add("MonkeyATLAS","assets/Monkey.png");
	this.preloader.add("StarJSON","assets/star.json");
	this.preloader.add("StarATLAS","assets/star.png");
	this.preloader.add("crashAnimationATLAS","assets/crashAnimation.png");
	this.preloader.add("crashAnimationJSON","assets/crashAnimation.json");
	this.preloader.add("DimmingDecorJSON","assets/DimmingDecor.json");
	this.preloader.add("DimmingDecorPNG","assets/DimmingDecor.png");
	this.preloader.add("BallsSheetJSON","assets/BallsSheet.json");
	this.preloader.add("BallsSheetPNG","assets/BallsSheet.png");
	this.preloader.add("title","assets/title.png");
	this.preloader.add("background","assets/background.png");
	this.preloader.add("buttonsPNG","assets/buttons.png");
	this.preloader.add("buttonsJSON","assets/buttons.json");
	this.preloader.add("shareTooltip","assets/shareTooltip.png");
	this.preloader.add("score","assets/score.png");
	this.preloader.add("yourResult","assets/yourResult.png");
	this.preloader.add("numbers_font_xml","assets/numbers.fnt");
	this.preloader.add("numbers_font","assets/numbers.png");
	this.preloader.add("itemsPNG","assets/items.png");
	this.preloader.add("itemsJSON","assets/items.json");
	this.preloader.add("treeDecorPNG","assets/treeDecor.png");
	this.preloader.add("treeDecorJSON","assets/treeDecor.json");
	this.preloader.load($bind(this,this.preloaded));
};
Main.main = function() {
	new Main();
};
Main.prototype = {
	preloaded: function() {
		Main.Assets = { numbers_font : this.preloader.resources.numbers_font.texture, numbers_font_xml : this.preloader.resources.numbers_font_xml.texture, DimmingDecorJSON : this.preloader.resources.DimmingDecorJSON.texture, DimmingDecorPNG : this.preloader.resources.DimmingDecorPNG.texture, crashAnimationATLAS : this.preloader.resources.crashAnimationATLAS.texture, crashAnimationJSON : this.preloader.resources.crashAnimationJSON.texture, StarJSON : this.preloader.resources.StarJSON.texture, StarATLAS : this.preloader.resources.StarATLAS.texture, BallsSheetJSON : this.preloader.resources.BallsSheetJSON.texture, BallsSheetPNG : this.preloader.resources.BallsSheetPNG.texture, title : this.preloader.resources.title.texture, background : this.preloader.resources.background.texture, score : this.preloader.resources.score.texture, yourResult : this.preloader.resources.yourResult.texture, itemsPNG : this.preloader.resources.itemsPNG.texture, itemsJSON : this.preloader.resources.itemsJSON.texture, shareTooltip : this.preloader.resources.shareTooltip.texture};
		this.stage = new Stage();
		window.document.body.appendChild(this.renderer.view);
		window.requestAnimationFrame($bind(this,this.update));
		initHTMLDOM();
	}
	,update: function() {
		window.requestAnimationFrame($bind(this,this.update));
		utils.Ticker.update();
		this.renderer.render(this.stage);
	}
};
var ServiceName = function() {
	this.serviceTextures = new Array();
	var texture;
	var _g = 1;
	while(_g < 8) {
		var i = _g++;
		texture = PIXI.Texture.fromFrame("item" + i + ".png");
		this.serviceTextures.push(texture);
	}
	PIXI.extras.MovieClip.call(this,this.serviceTextures);
	this.alpha = 0;
};
ServiceName.__super__ = PIXI.extras.MovieClip;
ServiceName.prototype = $extend(PIXI.extras.MovieClip.prototype,{
	display: function(id,x,y) {
		this.gotoAndStop(id);
		this.x = x + 40;
		this.y = y - this.height / 2;
		if(this.x + (this.width + 40) > 960) this.x = x - (this.width + 40);
		utils.Ticker.add($bind(this,this.fadeIn));
	}
	,fadeIn: function() {
		this.alpha += 0.1;
		if(this.alpha >= 1) {
			utils.Ticker.remove($bind(this,this.fadeIn));
			this.alpha = 1;
		}
	}
	,hide: function() {
		this.alpha = 0;
	}
});
var SimpleButton = function(upTexture,downTexture) {
	this.wasPressed = false;
	PIXI.Sprite.call(this,upTexture);
	this.up_texture = upTexture;
	this.down_texture = downTexture;
	this.interactive = true;
	this.on("mousedown",$bind(this,this.onButtonDown));
	this.on("touchstart",$bind(this,this.onButtonDown));
	this.on("mouseup",$bind(this,this.onButtonUp));
	this.on("touchend",$bind(this,this.onButtonUp));
	this.on("mouseupoutside",$bind(this,this.onButtonUp));
	this.on("touchendoutside",$bind(this,this.onButtonUp));
};
SimpleButton.__super__ = PIXI.Sprite;
SimpleButton.prototype = $extend(PIXI.Sprite.prototype,{
	set: function(x,y) {
		this.x = x;
		this.y = y;
	}
	,onButtonDown: function() {
		this.texture = this.down_texture;
	}
	,onButtonUp: function() {
		this.texture = this.up_texture;
		if(this.onRelease != null) this.onRelease(this);
	}
});
var Stage = function() {
	this.tutorComplete = false;
	this.steps = -1;
	PIXI.Container.call(this);
	var bg = new PIXI.Sprite(Main.Assets.background);
	this.addChild(bg);
	this.treeDecor = new TreeDecor();
	bg.addChild(this.treeDecor);
	this.ingamescore = new InGameScore();
	this.addChild(this.ingamescore);
	var decor = new Decor();
	this.addChild(decor);
	var stars = new StarField();
	this.addChild(stars);
	this.monkey = new characters.Monkey();
	this.addChild(this.monkey);
	this.play = new SimpleButton(PIXI.Texture.fromFrame("btn_play_up.png"),PIXI.Texture.fromFrame("btn_play_down.png"));
	this.play.set(415,255);
	this.vk_button = new SimpleButton(PIXI.Texture.fromFrame("share_vk_up.png"),PIXI.Texture.fromFrame("share_vk_down.png"));
	this.ok_button = new SimpleButton(PIXI.Texture.fromFrame("share_ok_up.png"),PIXI.Texture.fromFrame("share_ok_down.png"));
	this.fb_button = new SimpleButton(PIXI.Texture.fromFrame("share_fb_up.png"),PIXI.Texture.fromFrame("share_fb_down.png"));
	this.vk_button.position.set(359,557);
	this.ok_button.position.set(443,557);
	this.fb_button.position.set(527,557);
	this.addChild(this.vk_button);
	this.addChild(this.ok_button);
	this.addChild(this.fb_button);
	this.vk_button.onRelease = $bind(this,this.shareVK);
	this.ok_button.onRelease = $bind(this,this.shareOK);
	this.fb_button.onRelease = $bind(this,this.shareFB);
	var mute = new SwitcherButton(PIXI.Texture.fromFrame("btn_sound_on.png"),PIXI.Texture.fromFrame("btn_sound_off.png"));
	mute.set(876,557);
	this.addChild(mute);
	this.ballCont = new BallController(this.monkey,bg,this);
	this.serviceName = new ServiceName();
	this.addChild(this.serviceName);
	this.yourResult = new YourResult();
	this.addChild(this.yourResult);
	this.addChild(this.play);
	this.play.onRelease = $bind(this,this.onPlayRelease);
	mute.onSwitch = $bind(this,this.onSwitch);
	this.finger = new PIXI.Sprite(PIXI.Texture.fromFrame("finger.png"));
	this.finger.alpha = 0;
	this.finger.x = 437;
	this.finger.y = 156;
	this.title = new PIXI.Sprite(Main.Assets.title);
	this.title.x = 184;
	this.title.y = 85;
	this.addChild(this.title);
	this.addChild(this.finger);
};
Stage.__super__ = PIXI.Container;
Stage.prototype = $extend(PIXI.Container.prototype,{
	shareVK: function(target) {
		shareScores(this.ballCont.scores,"vk");
	}
	,shareOK: function(target) {
		shareScores(this.ballCont.scores,"ok");
	}
	,shareFB: function(target) {
		shareScores(this.ballCont.scores,"fb");
	}
	,onSwitch: function(target) {
		window.changeVolume(target.active?1:0);
	}
	,onPlayRelease: function(target) {
		if(this.yourResult.alpha > 0) this.yourResult.hide();
		target.interactive = false;
		utils.Ticker.add($bind(this,this.fadeOutPlay));
		if(this.steps == -1) {
			this.treeDecor.disable();
			utils.Ticker.add($bind(this,this.blinkFinger));
			utils.Ticker.add($bind(this,this.fadeOutTitle));
		}
		this.ingamescore.show();
	}
	,fadeOutTitle: function() {
		this.title.alpha -= 0.1;
		if(this.title.alpha <= 0) {
			utils.Ticker.remove($bind(this,this.fadeOutTitle));
			this.title.visible = false;
		}
	}
	,blinkFinger: function() {
		this.steps += 1;
		this.finger.alpha = Math.abs(Math.sin(this.steps / 15));
	}
	,firstPlayInited: function() {
		if(this.tutorComplete == false) {
			this.tutorComplete = true;
			utils.Ticker.remove($bind(this,this.blinkFinger));
			this.finger.alpha = 0;
			this.removeChild(this.finger);
		}
	}
	,allowReplay: function() {
		utils.Ticker.add($bind(this,this.fadeInPlay));
	}
	,fadeInPlay: function() {
		this.play.alpha += 0.05;
		if(this.play.alpha >= 1) {
			this.play.alpha = 1;
			utils.Ticker.remove($bind(this,this.fadeInPlay));
			this.play.interactive = true;
		}
	}
	,fadeOutPlay: function() {
		this.play.alpha -= 0.1;
		if(this.play.alpha <= 0) {
			utils.Ticker.remove($bind(this,this.fadeOutPlay));
			this.ballCont.execute();
		}
	}
});
var Star = function() {
	this.starTextures = new Array();
	var texture;
	var _g = 0;
	while(_g < 20) {
		var i = _g++;
		texture = PIXI.Texture.fromFrame("star" + i);
		this.starTextures.push(texture);
	}
	PIXI.extras.MovieClip.call(this,this.starTextures);
	this.gotoAndPlay(Std.random(20));
	this.animationSpeed = 0.5;
};
Star.__super__ = PIXI.extras.MovieClip;
Star.prototype = $extend(PIXI.extras.MovieClip.prototype,{
	set: function(x,y) {
		this.x = x;
		this.y = y;
	}
});
var StarField = function() {
	this.positions = [{ x : 1209, y : 47},{ x : 1649, y : 137},{ x : 1639, y : 247},{ x : 1627, y : 385},{ x : 19, y : 367},{ x : 1480, y : 406},{ x : 24, y : 582},{ x : 186, y : 567},{ x : 1410, y : 323},{ x : 1585, y : 476},{ x : 1559, y : 67},{ x : 1239, y : 167},{ x : 389, y : 107},{ x : 359, y : 237},{ x : 289, y : 77},{ x : 189, y : 197},{ x : 589, y : 97},{ x : 1399, y : 27},{ x : 1489, y : 237},{ x : 259, y : 267},{ x : 1369, y : 197},{ x : 329, y : 375},{ x : 179, y : 486},{ x : 479, y : 167},{ x : 29, y : 217},{ x : 189, y : 397},{ x : 69, y : 471},{ x : 109, y : 287}];
	PIXI.Container.call(this);
	var _g1 = 0;
	var _g = this.positions.length;
	while(_g1 < _g) {
		var i = _g1++;
		var star = new Star();
		star.set(this.positions[i].x,this.positions[i].y);
		this.addChild(star);
	}
	this.x = 0;
	this.y = 0;
	this.scale.x = 0.564545;
	this.scale.y = 0.564545;
};
StarField.__super__ = PIXI.Container;
StarField.prototype = $extend(PIXI.Container.prototype,{
});
var Std = function() { };
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.random = function(x) {
	if(x <= 0) return 0; else return Math.floor(Math.random() * x);
};
var SwitcherButton = function(onTexture,offTexture) {
	this.active = true;
	PIXI.Sprite.call(this,onTexture);
	this.on_texture = onTexture;
	this.off_texture = offTexture;
	this.interactive = true;
	this.on("mouseup",$bind(this,this.onButtonUpdateState));
	this.on("touchend",$bind(this,this.onButtonUpdateState));
	this.on("mouseupoutside",$bind(this,this.onButtonUpdateState));
	this.on("touchendoutside",$bind(this,this.onButtonUpdateState));
};
SwitcherButton.__super__ = PIXI.Sprite;
SwitcherButton.prototype = $extend(PIXI.Sprite.prototype,{
	set: function(x,y) {
		this.x = x;
		this.y = y;
	}
	,onButtonUpdateState: function() {
		if(this.active) this.active = false; else this.active = true;
		if(this.active) this.texture = this.on_texture; else this.texture = this.off_texture;
		this.onSwitch(this);
	}
});
var TreeDecor = function() {
	this.lights_coords = [{ x : 628, y : 90, r : -0.8028514559173916},{ x : 537, y : 97, r : -3.0665434957540367},{ x : 392, y : 117, r : 0.747000919853573},{ x : 336, y : 166, r : -2.3928464044842257},{ x : 413, y : 200, r : -1.8308503853420517},{ x : 534, y : 192, r : 1.0053096491487339},{ x : 741, y : 180, r : -1.673770752662562},{ x : 711, y : 273, r : -0.5131268000863328},{ x : 559, y : 306, r : 0.14835298641951802},{ x : 521, y : 268, r : 0.47472955654245763},{ x : 422, y : 297, r : -0.8325220532012952},{ x : 239, y : 280, r : 0.26005405854715513}];
	this.ball_coords = [{ x : 642, y : 168},{ x : 731, y : 209},{ x : 525, y : 96},{ x : 182, y : 320},{ x : 591, y : 304},{ x : 462, y : 7},{ x : 419, y : 188}];
	PIXI.Container.call(this);
	var line1 = new PIXI.Sprite(PIXI.Texture.fromFrame("Line1"));
	var line2 = new PIXI.Sprite(PIXI.Texture.fromFrame("Line2"));
	var line3 = new PIXI.Sprite(PIXI.Texture.fromFrame("Line3"));
	line3.position.set(239,243);
	line2.position.set(317,162);
	line1.position.set(387,80);
	this.addChild(line1);
	this.addChild(line2);
	this.addChild(line3);
	this.decorTextures = new Array();
	this.decorTextures[0] = PIXI.Texture.fromFrame("Light1");
	this.decorTextures[1] = PIXI.Texture.fromFrame("Light2");
	this.decorTextures[2] = PIXI.Texture.fromFrame("Light3");
	this.lights = new Array();
	var _g1 = 0;
	var _g = this.lights_coords.length;
	while(_g1 < _g) {
		var i = _g1++;
		var bulb = new PIXI.extras.MovieClip(this.decorTextures);
		bulb.anchor.set(0.5,0.5);
		bulb.x = this.lights_coords[i].x;
		bulb.y = this.lights_coords[i].y;
		bulb.rotation = this.lights_coords[i].r;
		bulb.gotoAndStop(i % 3);
		bulb.animationSpeed = 0.025;
		bulb.scale.set(0.75,0.75);
		bulb.play();
		this.addChild(bulb);
		this.lights.push(bulb);
	}
	var _g11 = 0;
	var _g2 = this.ball_coords.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var ball = new PIXI.Sprite(PIXI.Texture.fromFrame("ball" + (i1 + 1) + ".png"));
		ball.position.set(this.ball_coords[i1].x,this.ball_coords[i1].y);
		this.addChild(ball);
	}
};
TreeDecor.__super__ = PIXI.Container;
TreeDecor.prototype = $extend(PIXI.Container.prototype,{
	disable: function() {
		var _g1 = 0;
		var _g = this.lights.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.lights[i].stop();
		}
		while(this.children.length > 0) this.removeChildAt(0);
	}
});
var YourResult = function() {
	PIXI.Container.call(this);
	this.alpha = 0;
	this.title = new PIXI.Sprite(Main.Assets.yourResult);
	this.addChild(this.title);
	this.title.x = 219;
	this.title.y = 30;
	this.visible = false;
	this.shareTooltip = new PIXI.Sprite(Main.Assets.shareTooltip);
	this.shareTooltip.position.set(335,469);
	this.addChild(this.shareTooltip);
	this.currentScoreTF = new PIXI.extras.BitmapText("0",{ font : "68px Baveuse"});
	this.currentScoreTF.align = "left";
	this.currentScoreTF.position.set(219,160);
	this.addChild(this.currentScoreTF);
	this.bestScoreTF = new PIXI.extras.BitmapText("0",{ font : "68px Baveuse"});
	this.bestScoreTF.align = "left";
	this.bestScoreTF.position.set(219,160);
	this.addChild(this.bestScoreTF);
};
YourResult.__super__ = PIXI.Container;
YourResult.prototype = $extend(PIXI.Container.prototype,{
	show: function(scores) {
		this.currentScoreTF.text = scores;
		this.currentScoreTF.x = 345.5;
		if(js.Browser.getLocalStorage().getItem("bestScore") == null) {
			js.Browser.getLocalStorage().setItem("bestScore",scores);
			this.bestScoreTF.text = scores;
		} else if(Std.parseInt(js.Browser.getLocalStorage().getItem("bestScore")) < scores) {
			this.bestScoreTF.text = scores;
			js.Browser.getLocalStorage().setItem("bestScore",scores);
		} else this.bestScoreTF.text = js.Browser.getLocalStorage().getItem("bestScore");
		this.bestScoreTF.x = 598.5;
		this.visible = true;
		utils.Ticker.add($bind(this,this.alphaIncrease));
	}
	,hide: function() {
		this.visible = false;
		this.alpha = 0;
	}
	,alphaIncrease: function() {
		this.alpha += 0.05;
		if(this.alpha >= 1) {
			this.alpha = 1;
			utils.Ticker.remove($bind(this,this.alphaIncrease));
		}
	}
});
var characters = {};
characters.Monkey = function() {
	this.monkeyTextures = new Array();
	var texture;
	var _g = 1;
	while(_g < 17) {
		var i = _g++;
		texture = PIXI.Texture.fromFrame("monkey" + i + ".png");
		this.monkeyTextures.push(texture);
	}
	PIXI.extras.MovieClip.call(this,this.monkeyTextures);
	this.x = 592;
	this.y = 365;
};
characters.Monkey.__super__ = PIXI.extras.MovieClip;
characters.Monkey.prototype = $extend(PIXI.extras.MovieClip.prototype,{
	startRunning: function() {
		this.play();
	}
	,stopRunning: function() {
		this.stop();
	}
});
var js = {};
js.Browser = function() { };
js.Browser.getLocalStorage = function() {
	try {
		var s = window.localStorage;
		s.getItem("");
		return s;
	} catch( e ) {
		return null;
	}
};
var utils = {};
utils.Ticker = function() { };
utils.Ticker.init = function() {
	utils.Ticker._tickers = new Array();
};
utils.Ticker.add = function(f) {
	utils.Ticker._tickers.push(f);
};
utils.Ticker.remove = function(f) {
	var _g1 = 0;
	var _g = utils.Ticker._tickers.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(utils.Ticker._tickers[i] == f) {
			utils.Ticker._tickers.splice(i,1);
			break;
		}
	}
};
utils.Ticker.update = function() {
	var _g1 = 0;
	var _g = utils.Ticker._tickers.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(utils.Ticker._tickers[i] != null) utils.Ticker._tickers[i]();
	}
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
Main.main();
})();

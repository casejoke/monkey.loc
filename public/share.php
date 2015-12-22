<?php 
// Version
define('VERSION', '0.0.1');
// Configuration
require('config.php');
// 
require('system/startup.php');
// Request
$request = new Request();
// Response
$response = new Response();
$response->addHeader('Content-Type: text/html; charset=utf-8');
$response->setCompression(0);


if (($request->server['REQUEST_METHOD'] == 'POST')) {
	$json = array();
	
	$code = sha1(uniqid(mt_rand(), true));
	//`name` = '" . $db->escape($name) . "', 
	//`filename` = '" . $db->escape($filename) . "', 

	//выбираем исходник для картинки
	if((int)$request->get['point'] > 10){
		$_template = '3.jpg';
		$x = 450;
		$y = 232;
		$text = $request->get['point']. ' ' . getNumEnding((int)$request->get['point'],  array('услугу', 'услуги', 'услуг'));
		$json['share_title'] = 'Я собрал '. $request->get['point'] . ' ' . getNumEnding((int)$request->get['point'],  array('услугу', 'услуги', 'услуг'));
		$json['share_description'] = 'А ты сможешь лучше?';
		
	}elseif ( (int)$request->get['point'] < 10  && (int)$request->get['point'] >= 5 ) {
		$_template = '2.jpg';
		$x = 450;
		$y = 232;
		$text = $request->get['point']. ' ' . getNumEnding((int)$request->get['point'],  array('услугу', 'услуги', 'услуг'));
		$json['share_title'] = 'Я собрал '. $request->get['point'] . ' ' . getNumEnding((int)$request->get['point'],  array('услугу', 'услуги', 'услуг'));
		$json['share_description'] = 'А ты сможешь лучше?';
	}else{
		$_template = '1.jpg';
		$x = 420;
		$y = 273;
		$text = $request->get['point']. ' ' . getNumEnding((int)$request->get['point'],  array('услугу', 'услуги', 'услуг'));
		$json['share_title'] = 'Я собрал ' . $request->get['point'] . ' ' . getNumEnding((int)$request->get['point'],  array('услугу', 'услуги', 'услуг'));
		$json['share_description'] = 'А ты сможешь лучше?';
	}
	


	//путь до геенреруемой картинки
	$new_image = $code.'.jpg';
	if (!is_file(DIR_IMAGE.$_template)) {
		return;
	}
	if (!is_file(DIR_IMAGE . $new_image) || (filectime(DIR_IMAGE . $_template) > filectime(DIR_IMAGE . $new_image)) ) {
		//
		$path = '';

		$directories = explode('/', dirname(str_replace('../', '', $new_image)));

		foreach ($directories as $directory) {
			$path = $path . '/' . $directory;

			if (!is_dir(DIR_IMAGE . $path)) {
				@mkdir(DIR_IMAGE . $path, 0777);
			}
		}
		
		//для шаблона рейтинга топ-5
		$image = new Image(DIR_IMAGE . $_template);
		$font_size = 34;
		$font_path = DIR_APPLICATION.'Pribambas.ttf';
		
		$image->addText($text,$font_size, $x,$y,'FFFFFF',$font_path,0);

		$image->save(DIR_IMAGE . $new_image);
	}

	if($code){
		$json['success'] = 1;
		$json['share_image'] = HTTP_SERVER.'share/'.$code.'.jpg';
		$json['share_url'] = HTTP_SERVER.'/share.php?share_id='.$code.'&point='.(int)$request->get['point'] ;
	}else{
		$json['error'] = 'ERROR DB';
	}
	
	$response->addHeader('Content-Type: application/json');
	$response->setOutput(json_encode($json));
} else {
	$share_id  = $request->get['share_id'];
	$point  = $request->get['point'];
	$template = new Template();
	$template->base 			= HTTP_SERVER;
	$template->image 			= 'share/'.$share_id.'.jpg';
	$template->share_url 			= HTTP_SERVER.'share.php?share_id='.$share_id.'&point='.$point ;

	if((int)$point > 10){
		$template->title  = 'Я собрал '. $point . ' ' . getNumEnding($point,  array('услугу', 'услуги', 'услуг'));
		$template->description  = 'А ты сможешь лучше?';
		
	}elseif ( (int)$point < 10  && (int)$point >= 5 ) {
		$template->title  = 'Я собрал '. $point .  ' ' . getNumEnding($point,  array('услугу', 'услуги', 'услуг'));
		$template->description  = 'А ты сможешь лучше?';
		
	}else{
		$template->title  = 'Я собрал '. $point . ' ' . getNumEnding($point,  array('услугу', 'услуги', 'услуг'));
		$template->description  = 'А ты сможешь лучше?';
	}
	$out = $template->render(DIR_APPLICATION.'/template/share.tpl');
	$response->setOutput($out);
}
$response->output();
<?php
class Image {
	private $file;
	private $image;
	private $info;

	public function __construct($file) {
		if (file_exists($file)) {
			$this->file = $file;

			$info = getimagesize($file);

			$this->info = array(
				'width'  => $info[0],
				'height' => $info[1],
				'bits'   => isset($info['bits']) ? $info['bits'] : '',
				'mime'   => isset($info['mime']) ? $info['mime'] : ''
			);

			$this->image = $this->create($file);
		} else {
			exit('Error: Could not load image ' . $file . '!');
		}
	}

	private function create($image) {
		$mime = $this->info['mime'];

		if ($mime == 'image/gif') {
			return imagecreatefromgif ($image);
		} elseif ($mime == 'image/png') {
			return imagecreatefrompng($image);
		} elseif ($mime == 'image/jpeg') {
			return imagecreatefromjpeg($image);
		}
	}

	public function save($file, $quality = 100) {
		$info = pathinfo($file);

		$extension = strtolower($info['extension']);

		if (is_resource($this->image)) {
			if ($extension == 'jpeg' || $extension == 'jpg') {
				imagejpeg($this->image, $file, $quality);
			} elseif ($extension == 'png') {
				imagepng($this->image, $file);
			} elseif ($extension == 'gif') {
				imagegif ($this->image, $file);
			}

			imagedestroy($this->image);
		}
	}

	public function resize($width = 0, $height = 0, $default = '') {
		if (!$this->info['width'] || !$this->info['height']) {
			return;
		}

		$xpos = 0;
		$ypos = 0;
		$scale = 1;

		$scale_w = $width / $this->info['width'];
		$scale_h = $height / $this->info['height'];

		if ($default == 'w') {
			$scale = $scale_w;
		} elseif ($default == 'h') {
			$scale = $scale_h;
		} else {
			$scale = min($scale_w, $scale_h);
		}

		if ($scale == 1 && $scale_h == $scale_w && $this->info['mime'] != 'image/png') {
			return;
		}

		$new_width = (int)($this->info['width'] * $scale);
		$new_height = (int)($this->info['height'] * $scale);
		$xpos = (int)(($width - $new_width) / 2);
		$ypos = (int)(($height - $new_height) / 2);

		$image_old = $this->image;
		$this->image = imagecreatetruecolor($width, $height);

		if (isset($this->info['mime']) && $this->info['mime'] == 'image/png') {
			imagealphablending($this->image, false);
			imagesavealpha($this->image, true);
			$background = imagecolorallocatealpha($this->image, 255, 255, 255, 127);
			imagecolortransparent($this->image, $background);
		} else {
			$background = imagecolorallocate($this->image, 255, 255, 255);
		}

		imagefilledrectangle($this->image, 0, 0, $width, $height, $background);

		imagecopyresampled($this->image, $image_old, $xpos, $ypos, 0, 0, $new_width, $new_height, $this->info['width'], $this->info['height']);
		imagedestroy($image_old);

		$this->info['width']  = $width;
		$this->info['height'] = $height;
	}
	public function addText($text,$font_size, $x,$y,$color,$font,$offset_right){
		$rgb = $this->html2rgb($color);
		$color = imagecolorallocate($this->image, $rgb[0], $rgb[1], $rgb[2]);
		
		if($offset_right != 0){
			$dimensions = imagettfbbox($font_size, 0, $font, $text);
			$textWidth = abs($dimensions[4] - $dimensions[6]);
			$x = (imagesx($this->image) - $textWidth)-$offset_right;
		}


		imagettftext($this->image, $font_size, 0 , $x, $y, $color, $font, $text);

	}
	public function addTextCenter($text,$font_size, $x,$y,$color,$font){
		$rgb = $this->html2rgb($color);
		$color = imagecolorallocate($this->image, $rgb[0], $rgb[1], $rgb[2]);
		$dimensions = imagettfbbox($font_size, 0, $font, $text);
		$textWidth = abs($dimensions[4] - $dimensions[6]);
		$x =$x-($textWidth/2);
		imagettftext($this->image, $font_size, 0 , $x, $y, $color, $font, $text);

	}
	public function addTextCenterForSecondLine($text,$font_size, $x,$y,$color,$font,$sign_line){
		$_x = $x;
		$rgb = $this->html2rgb($color);
		$color = imagecolorallocate($this->image, $rgb[0], $rgb[1], $rgb[2]);
		$dimensions = imagettfbbox($font_size, 0, $font, $text);
		$word = explode(" ", wordwrap($text, $sign_line));
		$line_height = $font_size+10;
		$textWidth = abs($dimensions[4] - $dimensions[6]);
		
		$bg_color = imagecolorallocate($this->image, 0, 0, 0);
		$delta_y = 0;
		foreach($word as $line) {
		    $delta_y += $line_height;
		    $dims = imagettfbbox($font_size, 0, $font, $line);
		    $text_width  = abs($dims[4] - $dims[6]);
		    $x = $x-($text_width/2);
		    imagettftext($this->image, $font_size, 0, $x, $y + $delta_y, $color, $font, $line);
		   // imagefilledrectangle($this->image, $x,$y, $x+$text_width, $y + $delta_y, $bg_color);
		    break;
		}
		$count_word = count($word);
		$second_line = '';
		for ($i=1; $i < $count_word; $i++) { 
			$second_line = $second_line.$word[$i];
		}
		$delta_y += $line_height;
	    $dims = imagettfbbox($font_size, 0, $font, $second_line);
	    $text_width  = abs($dims[4] - $dims[6]);
	    $x = $_x-($text_width/2);
	    imagettftext($this->image, $font_size, 0, $x, $y + $delta_y, $color, $font, $second_line);
	}
	public function addTextLine($text,$font_size, $x,$y,$color,$font,$sign_line){
		$rgb = $this->html2rgb($color);
		$color = imagecolorallocate($this->image, $rgb[0], $rgb[1], $rgb[2]);

		$dimensions = imagettfbbox($font_size, 0, $font, $text);
		$word = explode("\n", wordwrap ($text, $sign_line));
		$line_height = $dimensions[3]- $dimensions[5];
		$delta_y = 0;
		$bg_color = imagecolorallocate($this->image, 0, 0, 0);

		foreach($word as $line) {
		    $delta_y =  $delta_y + $line_height;

		    $dims = imagettfbbox($font_size, 0, $font, $line);
		    $text_width  = 130; //abs($dims[4] - $dims[1]);
		   	$text_height = abs($dims[3] - $dims[5]);
		  	 // Add text background
		  	//imagefilledrectangle($this->image, $x,$y + $delta_y , $x+$text_width, $y + $delta_y+$text_height, $bg_color);
		    imagettftext($this->image, $font_size, 0, $x, $y + $delta_y, $color, $font, $line);
		  
		}


		//imagettftext($this->image, $font_size, 0 , $x, $y, $color, $font, $text);

	}

	public function addImage($file,$positionX,$positionY,$mime){
		$info = pathinfo($file);
		$extension = strtolower($info['extension']);
		if ($extension == 'jpeg' || $extension == 'jpg') {
			$mini_img =  imagecreatefromjpeg($file);
		} elseif ($extension == 'png') {
			$mini_img =  imagecreatefrompng($file);
		} elseif ($extension == 'gif') {
			$mini_img = imagecreatefromgif ($file);
		}
		$mini_img_width  = imagesx($mini_img);
		$mini_img_height = imagesy($mini_img);
		$sdvig_x = $mini_img_width/2;
		$sdvig_y = $mini_img_height/2;

		imagecopy($this->image, $mini_img, $positionX-$sdvig_x, $positionY-$sdvig_y, 0, 0, $mini_img_width, $mini_img_height);
		imagedestroy($mini_img);
	}

	public function watermark($file, $position = 'bottomright') {
		$watermark = $this->create($file);

		$watermark_width = imagesx($watermark);
		$watermark_height = imagesy($watermark);

		switch($position) {
			case 'topleft':
				$watermark_pos_x = 0;
				$watermark_pos_y = 0;
				break;
			case 'topright':
				$watermark_pos_x = $this->info['width'] - $watermark_width;
				$watermark_pos_y = 0;
				break;
			case 'bottomleft':
				$watermark_pos_x = 0;
				$watermark_pos_y = $this->info['height'] - $watermark_height;
				break;
			case 'bottomright':
				$watermark_pos_x = $this->info['width'] - $watermark_width;
				$watermark_pos_y = $this->info['height'] - $watermark_height;
				break;
		}

		imagecopy($this->image, $watermark, $watermark_pos_x, $watermark_pos_y, 0, 0, 120, 40);

		imagedestroy($watermark);
	}

	public function crop($top_x, $top_y, $bottom_x, $bottom_y) {
		$image_old = $this->image;
		$this->image = imagecreatetruecolor($bottom_x - $top_x, $bottom_y - $top_y);

		imagecopy($this->image, $image_old, 0, 0, $top_x, $top_y, $this->info['width'], $this->info['height']);
		imagedestroy($image_old);

		$this->info['width'] = $bottom_x - $top_x;
		$this->info['height'] = $bottom_y - $top_y;
	}

	public function rotate($degree, $color = 'FFFFFF') {
		$rgb = $this->html2rgb($color);

		$this->image = imagerotate($this->image, $degree, imagecolorallocate($this->image, $rgb[0], $rgb[1], $rgb[2]));

		$this->info['width'] = imagesx($this->image);
		$this->info['height'] = imagesy($this->image);
	}

	private function filter($filter) {
		imagefilter($this->image, $filter);
	}

	private function text($text, $x = 0, $y = 0, $size = 5, $color = '000000') {
		$rgb = $this->html2rgb($color);

		imagestring($this->image, $size, $x, $y, $text, imagecolorallocate($this->image, $rgb[0], $rgb[1], $rgb[2]));
	}

	private function merge($file, $x = 0, $y = 0, $opacity = 100) {
		$merge = $this->create($file);

		$merge_width = imagesx($merge);
		$merge_height = imagesy($merge);

		imagecopymerge($this->image, $merge, $x, $y, 0, 0, $merge_width, $merge_height, $opacity);
	}

	private function html2rgb($color) {
		if ($color[0] == '#') {
			$color = substr($color, 1);
		}

		if (strlen($color) == 6) {
			list($r, $g, $b) = array($color[0] . $color[1], $color[2] . $color[3], $color[4] . $color[5]);
		} elseif (strlen($color) == 3) {
			list($r, $g, $b) = array($color[0] . $color[0], $color[1] . $color[1], $color[2] . $color[2]);
		} else {
			return false;
		}

		$r = hexdec($r);
		$g = hexdec($g);
		$b = hexdec($b);

		return array($r, $g, $b);
	}
}

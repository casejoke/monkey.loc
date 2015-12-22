<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
  <base href="<?php  echo $base?>">
  <meta charset="UTF-8">
  
  <meta name="author" content="">

    <title><?php echo $title; ?></title>
    <meta name="description" content="<?php echo $description; ?>">
    <meta property="og:url" content="<?php echo $share_url; ?>" />
    <meta property="og:title" content="<?php echo $title; ?>" />
    <meta property="og:description" content="<?php echo $description?>" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="<?php  echo $base?><?php echo $image;?>" />
    <meta name="mrc__share_title" content="<?php echo $title; ?>" />
    <meta name="mrc__share_description" content="<?php echo $description; ?>" />
    <link rel="image_src" href="<?php  echo $base?><?php echo $image;?>" />
    <meta property="fb:app_id" content="966242223397117" /> 
  </head>
<body >
<img src="<?php echo $image;?>" alt="<?php echo $title; ?>">
<script type="text/javascript">
  function ready() {
    window.setTimeout( function(){
         window.location = '/' ;
      }, 2000 );
  }

  document.addEventListener("DOMContentLoaded", ready);
</script>
</body>
</html>
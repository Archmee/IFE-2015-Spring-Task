<?php 
	error_reporting(0);
	$ac = $_POST['name'] ? $_POST['name'] : $_GET['name'];
	$pw = $_POST['password'] ? $_POST['password'] : $_GET['password'];
	
	if (!$ac || !$pw) {
		echo 'Not permit null';
	}
	if ($ac == 'xsz' && $pw == '123456') {
		echo json_encode(array(
			'code' => 1,
			'message' => 'success'));
	} else {
		echo json_encode(array(
			'code' => -1,
			'message' => 'failed'));
	}
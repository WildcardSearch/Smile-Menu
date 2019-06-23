<?php
/*
 * Plugin Name: Smile Menu for MyBB 1.8.x
 * Copyright 2019 WildcardSearch
 * https://www.rantcentralforums.com
 *
 * this is the main plugin file
 */

// disallow direct access to this file for security reasons.
if (!defined('IN_MYBB')) {
    die('Direct initialization of this file is not allowed.<br /><br />Please make sure IN_MYBB is defined.');
}

// checked by other plugin files
define('SMILEMENU_VERSION', '0.0.1');

// register custom class autoloader
spl_autoload_register('smClassAutoLoad');

// load install routines only if in ACP
if (defined('IN_ADMINCP')) {
	global $mybb;
	if ($mybb->input['module'] == 'config-plugins' ||
		$mybb->input['module'] == 'config-settings') {
		require_once MYBB_ROOT . 'inc/plugins/sm/install.php';
	}
} else {
	require_once MYBB_ROOT . 'inc/plugins/sm/forum.php';
}

/**
 * class autoloader
 *
 * @param string the name of the class to load
 */
function smClassAutoLoad($className) {
	$path = MYBB_ROOT . "inc/plugins/sm/classes/{$className}.php";

	if (file_exists($path)) {
		require_once $path;
	}
}

?>

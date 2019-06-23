<?php
/*
 * Plugin Name: Smile Menu for MyBB 1.8.x
 * Copyright 2019 WildcardSearch
 * https://www.rantcentralforums.com
 *
 * wrapper to handle our plugin's installation
 */

class SmileMenuInstaller extends WildcardPluginInstaller020001
{
	static public function getInstance()
	{
		static $instance;

		if (!isset($instance)) {
			$instance = new SmileMenuInstaller();
		}

		return $instance;
	}

	/**
	 * link the installer to our data file
	 *
	 * @param  string path to the install data
	 * @return void
	 */
	public function __construct($path = '')
	{
		parent::__construct(MYBB_ROOT . 'inc/plugins/sm/install_data.php');
	}
}

?>

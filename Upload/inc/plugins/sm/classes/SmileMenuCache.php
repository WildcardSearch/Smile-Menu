<?php
/*
 * Plugin Name: Smile Menu for MyBB 1.8.x
 * Copyright 2019 WildcardSearch
 * https://www.rantcentralforums.com
 *
 * wrapper to handle our plugin's cache
 */

class SmileMenuCache extends WildcardPluginCache010300
{
	/**
	 * @var  string cache key
	 */
	protected $cacheKey = 'wildcard_plugins';

	/**
	 * @var  string cache sub key
	 */
	protected $subKey = 'sm';

	/**
	 * @return instance of the child class
	 */
	static public function getInstance()
	{
		static $instance;

		if (!isset($instance)) {
			$instance = new SmileMenuCache;
		}

		return $instance;
	}
}

?>

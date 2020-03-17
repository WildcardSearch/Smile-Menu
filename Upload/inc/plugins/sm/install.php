<?php
/*
 * Plugin Name: Smile Menu for MyBB 1.8.x
 * Copyright 2019 WildcardSearch
 * https://www.rantcentralforums.com
 *
 * this file provides install routines for sm.php
 */

// Disallow direct access to this file for security reasons.
if (!defined('IN_MYBB')) {
    die('Direct initialization of this file is not allowed.<br /><br />Please make sure IN_MYBB is defined.');
}

/**
 * used by MyBB to provide relevant information about the plugin and
 * also link users to updates
 *
 * @return array plugin info
 */
function sm_info()
{
	global $db, $lang, $mybb, $cp_style;

	if (!$lang->sm) {
		$lang->load('sm');
	}

	$settingsLink = smBuildSettingsLink();

	if ($settingsLink) {
		$settingsLink = <<<EOF
				<li style="list-style-image: url(styles/{$cp_style}/images/sm/settings.gif); margin-top: 10px;">
					{$settingsLink}
				</li>
EOF;

		$smDescription = <<<EOF

<table style="width: 100%;">
	<tr>
		<td style="width: 75%;">
			{$lang->sm_description}
			<ul id="sm_options">
{$settingsLink}
			</ul>
		</td>
		<td style="text-align: center;">
			<img src="styles/{$cp_style}/images/sm/logo.png" alt="{$lang->sm_logo}"/>
			<br />
			<br />
			<a href="https://paypal.me/wildcardsearch"><img src="styles/{$cp_style}/images/sm/donate.gif" style="outline: none; border: none;" /></a>
		</td>
	</tr>
</table>
EOF;
	} else {
		$smDescription = $lang->sm_description;
	}

	$name = "<span style=\"font-familiy: arial; font-size: 1.5em; color: #ffcc22; text-shadow: 2px 2px 2px #333333;\">Smile Menu</span>";
	$author = "</a></small></i><a href=\"https://www.rantcentralforums.com\" title=\"Rant Central\"><span style=\"font-family: Courier New; font-weight: bold; font-size: 1.2em; color: #117eec;\">Wildcard</span></a><i><small><a>";

    // return the info
	return array(
        'name' => $name,
        'description' => $smDescription,
        'website' => 'https://github.com/WildcardSearch/Smile-Menu',
        'version' => SMILEMENU_VERSION,
        'author' => $author,
        'authorsite' => 'https://www.rantcentralforums.com/',
		'compatibility' => '18*',
		'codename' => 'sm',
    );
}

/**
 * check to see if the plugin is installed
 *
 * @return bool true if installed, false if not
 */
function sm_is_installed()
{
	return smGetSettingsgroup();
}

/**
 * run the installer
 *
 * @return void
 */
function sm_install()
{
	global $db, $lang;

	if (!$lang->sm) {
		$lang->load('sm');
	}

	SmileMenuInstaller::getInstance()->install();
}

/**
 * edit templates & set the cache version
 *
 * @return void
 */
function sm_activate()
{
	global $plugins, $db, $cache, $lang, $smOldVersion;

	if (!$lang->sm) {
		$lang->load('sm');
	}

	require_once MYBB_ROOT . '/inc/adminfunctions_templates.php';

	// update the version (so we don't try to upgrade next round)
	SmileMenuCache::getInstance()->setVersion(SMILEMENU_VERSION);

	// edit the templates
	find_replace_templatesets('footer', '#^(.*?)$#s', '$1{$smAutocomplete}');
}

/**
 * restore templates
 *
 * @return void
 */
function sm_deactivate()
{
	require_once MYBB_ROOT . '/inc/adminfunctions_templates.php';

	find_replace_templatesets('footer', "#" . preg_quote('{$smAutocomplete}') . "#i", '');
}

/**
 * delete setting group and settings, templates,
 * and the style sheet
 *
 * unset the cached version
 *
 * @return void
 */
function sm_uninstall()
{
	SmileMenuInstaller::getInstance()->uninstall();

	SmileMenuCache::getInstance()->clear();
}

/**
 * settings
 */

/**
 * retrieves the plugin's settings group gid if it exists
 * attempts to cache repeat calls
 *
 * @return int setting group id
 */
function smGetSettingsgroup()
{
	static $gid;

	// if we have already stored the value
	if (!isset($gid)) {
		global $db;

		// otherwise we will have to query the db
		$query = $db->simple_select("settinggroups", "gid", "name='sm_settings'");
		$gid = (int) $db->fetch_field($query, 'gid');
	}

	return $gid;
}

/**
 * builds the URL to modify plugin settings if given valid info
 *
 * @param - $gid is an integer representing a valid settings group id
 * @return string setting group URL
 */
function smBuildSettingsURL($gid)
{
	if ($gid) {
		return 'index.php?module=config-settings&amp;action=change&amp;gid='.$gid;
	}
}

/**
 * builds a link to modify plugin settings if it exists
 *
 * @return setting group link HTML
 */
function smBuildSettingsLink()
{
	global $lang;

	if (!$lang->sm) {
		$lang->load('sm');
	}

	$gid = smGetSettingsgroup();

	// does the group exist?
	if ($gid) {
		// if so build the URL
		$url = smBuildSettingsURL($gid);

		// did we get a URL?
		if ($url) {
			// if so build the link
			return <<<EOF
<a href="{$url}" title="{$lang->sm_plugin_settings}">{$lang->sm_plugin_settings}</a>
EOF;
		}
	}

	return false;
}

?>

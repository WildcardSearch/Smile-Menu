<?php
/*
 * Plugin Name: Smile Menu for MyBB 1.8.x
 * Copyright 2019 WildcardSearch
 * https://www.rantcentralforums.com
 *
 * forum-side routines
 */

// Disallow direct access to this file for security reasons.
if (!defined('IN_MYBB')) {
    die('Direct initialization of this file is not allowed.<br /><br />Please make sure IN_MYBB is defined.');
}

smInitialize();

/**
 * add hooks and include functions only when appropriate
 *
 * return void
 */
function smInitialize()
{
	global $mybb, $plugins, $templatelist;

	$plugins->add_hook('global_intermediate', 'smBuildPopup');

	// only add the xmlhttp hook if required
	if (THIS_SCRIPT == 'xmlhttp.php' &&
		$mybb->input['action'] == 'sm') {
		$plugins->add_hook('xmlhttp', 'smXmlhttp');
	}

	$templatelist .= ',sm_popup';
}

/**
 * handles AJAX for Smile Menu
 *
 * @return void
 */
function smXmlhttp()
{
	global $mybb;

	$ajaxFunction = "smXmlhttp{$mybb->input['mode']}";
	if ($mybb->input['action'] != 'sm' ||
		!function_exists($ajaxFunction)) {
		return;
	}

	$ajaxFunction();
	return;
}

/**
 * cache smilies, if necessary, and return them
 *
 * @return array|bool false on error/empty cache
 */
function smCacheSmilies()
{
	global $cache, $mybb, $theme;

	static $localCache = null;

	if ($localCache === null) {
		$localCache = array();

		$smilies = $cache->read("smilies");

		if (is_array($smilies) &&
			!empty($smilies)) {
			foreach ($smilies as $sid => $smilie) {
				$smilie['find'] = explode("\n", $smilie['find']);
				$smilie['image'] = str_replace("{theme}", $theme['imgdir'], $smilie['image']);

				foreach ($smilie['find'] as $s) {
					$localCache[$s] = array(
						'title' => $smilie['name'],
						'code' => $s,
						'url' => $smilie['image'],
					);
				}
			}
		} else {
			$localCache = false;
		}
	}

	return $localCache;
}

/**
 * retrieve the smilie cache and echo JSON
 *
 * @return void
 */
function smXmlhttpLoad()
{
	global $mybb, $db, $cache;

	$smilies = smCacheSmilies();

	if (empty($smilies)) {
		exit;
	}

	$json = json_encode($smilies);

	// send our headers.
	header('Content-type: application/json');
	echo($json);
	exit;
}

/**
 * output the popup HTML
 *
 * @return void
 */
function smBuildPopup() {
	global $mybb, $lang, $theme, $templates, $smAutocomplete;

	if (!$lang->sm) {
		$lang->load('sm');
	}

	if ($mybb->settings['sm_minify_js']) {
		$min = '.min';
	}

	$mybb->settings['sm_min_width'] = (int) $mybb->settings['sm_min_width'];

	$smAutocomplete = <<<EOF
<!-- Smile Menu Autocomplete Scripts -->
<script type="text/javascript" src="{$mybb->asset_url}/jscripts/sm/Caret.js/jquery.caret{$min}.js"></script>
<script type="text/javascript" src="{$mybb->asset_url}/jscripts/sm/autocomplete{$min}.js"></script>
<script type="text/javascript">
<!--
	SmileMenu.autoComplete.setup({
		lang: {
			instructions: '{$lang->sm_autocomplete_instructions}',
		},
		maxLength: '32',
		maxItems: '{$mybb->settings['sm_max_items']}',
		minWidth: '{$mybb->settings['sm_min_width']}',
		fullText: '{$mybb->settings['sm_full_text_search']}',
		lockSelection: '{$mybb->settings['sm_lock_selection']}',
	});
// -->
</script>
EOF;

	eval("\$smAutocomplete .= \"" . $templates->get('sm_popup') . "\";");
}

?>

<?php
/*
 * Plugin Name: Smile Menu for MyBB 1.8.x
 * Copyright 2019 WildcardSearch
 * https://www.rantcentralforums.com
 *
 * this file contains data used by WildcardPluginInstaller
 */

$settings = array(
	'sm_settings' => array(
		'group' => array(
			'name' => 'sm_settings',
			'title'  => $lang->sm_plugin_settings_title,
			'description' => $lang->sm_settingsgroup_description,
			'disporder'  => '110',
			'isdefault'  => 0,
		),
		'settings' => array(
			'sm_max_items' => array(
				'sid' => '0',
				'name' => 'sm_max_items',
				'title' => $lang->sm_max_items_title,
				'description' => $lang->sm_max_items_description,
				'optionscode' => 'text',
				'value' => '5',
				'disporder' => '10',
			),
			'sm_min_width' => array(
				'sid' => '0',
				'name' => 'sm_min_width',
				'title' => $lang->sm_min_width_title,
				'description' => $lang->sm_min_width_description,
				'optionscode' => 'text',
				'value' => '120',
				'disporder' => '20',
			),
			'sm_full_text_search' => array(
				'sid' => '0',
				'name' => 'sm_full_text_search',
				'title' => $lang->sm_full_text_search_title,
				'description' => $lang->sm_full_text_search_description,
				'optionscode' => 'yesno',
				'value' => '0',
				'disporder' => '30',
			),
			'sm_lock_selection' => array(
				'sid' => '0',
				'name' => 'sm_lock_selection',
				'title' => $lang->sm_lock_selection_title,
				'description' => $lang->sm_lock_selection_description,
				'optionscode' => 'yesno',
				'value' => '1',
				'disporder' => '40',
			),
			'sm_minify_js' => array(
				'sid' => '0',
				'name' => 'sm_minify_js',
				'title' => $lang->sm_minify_js_title,
				'description' => $lang->sm_minify_js_desc,
				'optionscode' => 'yesno',
				'value' => '1',
				'disporder' => '50',
			),
		)
	)
);

$templates = array(
	'sm' => array(
		'group' => array(
			'prefix' => 'sm',
			'title' => $lang->sm,
		),
		'templates' => array(
			'sm_popup' => <<<EOF
<div id="sm_master_popup" class="sm_popup" style="display: none;">
	<div class="sm_spinner">
		<img src="images/spinner.gif" />
		<span>{\$lang->sm_autocomplete_loading}</span>
	</div>
	<div class="sm_popup_input_container">
		<input class="sm_popup_input" type="text" autocomplete="off" />
	</div>
	<div class="sm_popup_body"></div>
</div>
EOF
		),
	),
);

$styleSheets = array(
	'forum' => array(
		'sm' => array(
			'attachedto' => '',
			'stylesheet' => <<<EOF
div.sm_popup {
	position: absolute;
	overflow: hidden;
	z-index: 999;
	min-width: 120px;

	background: white;
	color: black;

	border: 1px solid #dddddd;
	-webkit-border-radius: 3px;
	-moz-border-radius: 3px;
	border-radius: 3px;

	-moz-box-shadow: 0 0 5px rgba(0,0,0,.1);
	-webkit-box-shadow: 0 0 5px rgba(0,0,0,.1);
	box-shadow: 0 0 5px rgba(0,0,0,.1);
	-ms-filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=1, Direction=135, Color='#818181')";
	filter: progid:DXImageTransform.Microsoft.Shadow(Strength=1, Direction=135, Color='#818181');
}

div.sm_popup_body {
	font-family: Arial, Helvetica, sans-serif;
	font-size: 15px;
	overflow-y: scroll;
	font-weight: normal !important;
	min-width: 150px;
}

div.sm_popup_input_container {
	border-bottom: 1px solid #DDD;
}

input.sm_popup_input {
	border: none;
	width: 100%;
	height: 25px;
	font-size: 15px;
	padding-left: 3px;
}

div.sm_popup_item {
	padding: 2px 3px 2px 3px !important;
	border-bottom: 1px solid #DDD;
}

div.sm_popup_item_on {
	background: #3366FF;
	color: white;
}

span.sm_popup_instructions {
	color: grey;
	font-style: italic;
}

span.sm_typed_text {
	padding-left: 3px;
}

span.sm_name_highlight {
	color: #3366FF;
	font-weight: bolder;
}

span.sm_name_highlight_on {
	color: white;
	font-weight: bolder;
}

div.sm_smilie_image {
	width: 30px;
	height: 30px;

	vertical-align: middle;
	margin: 2px 10px 2px 5px;
	display: inline-block;

	border: none;

	background-color: transparent;
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
}

div.sm_spinner {
	font-weight: bold;
	font-style: italic;
	color: #3D3D3D;
	padding-left: 5px;
}

div.sm_spinner img {
	float: right;
	padding-right: 5px;
}
EOF
		),
	),
);

$images = array(
	'folder' => 'sm',
	'acp' => array(
		'donate.gif' => array(
			'image' => <<<EOF
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
EOF
		),
		'settings.gif' => array(
			'image' => <<<EOF
R0lGODlhEAAQAOMLAAAAAAMDAwYGBgoKCg0NDRoaGh0dHUlJSVhYWIeHh5aWlv///////////////////yH5BAEKAA8ALAAAAAAQABAAAARe8Mn5lKJ4nqRMOtmDPBvQAZ+IIQZgtoAxUodsEKcNSqXd2ahdwlWQWVgDV6JiaDYVi4VlSq1Gf87L0GVUsARK3tBm6LAAu4ktUC6yMueYgjubjHrzVJ2WKKdCFBYhEQA7
EOF
		),
		'logo.png' => array(
			'image' => <<<EOF
iVBORw0KGgoAAAANSUhEUgAAAFAAAAAyCAYAAADLLVz8AAAABmJLR0QAqQCCAABmxYl2AAAACXBIWXMAAC3UAAAt1AEYYcVpAAAAB3RJTUUH4wYXFhEGvJsA7QAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAABIrSURBVGjelZvZk1zVfcc/59zununp2TSjGWmEENqNJSEHJENQwJTtorBjl5MU2HFcFT8kcYEr8Vte85A8+H/IC0nFlKmkUsEGG7BZA8iAwiKxCCSB1tE2M5p9prd7zy8PdzvnLjOiq2a6+57Tp+/93u9v+55fqytHHxGlNFopiJ6VUqAUSmlU/B6iZ0X0FgCx/olIeEzE+jPh8ei1EUGMscYMYgRjvQ7nmWRe+jp8jtdwjotgnDn2c7TmeuPWesZYr61zRARIAagobMDiP515ryzwLPTipVQImlIpiOm4RjCY6F04X1mfVoiKRkQhKjxBJeE5iUg4phQSHVMi4WfEOo6g4nsZr63CdUQJSPi1yfVLwbj1eYVCVHhO8Yi7frhQJQeS/VprYoCTMQeAeC1BRRcbLiygBGVM9IUahUnvXPR5iUBTSiLwVASkJCefrhsDUAaMfVyhEOJ7GeIVrYdCov9i3UaxbmgIviRoxXjjciNiYHTSWfahY7OOTDk23fgibfySLxNQJsYP0RoxNvc0iAlZg7gMUmKxMGVZDCKSufCIgSnQkrArPh2bRe7nIgJKCmxMz4SlOeCUY7oxCyskzNI5k1WRX0zeW+bumKlIeHoKlGgMghABaZtrzKzERAWR1D2IiANMOseiScyyQrPKsCgez01ShdzLMzJdL2WsOJ/XKSgkPi4GywFPaZQO/0QUqy0PY6Lx6HgYdHQ6X2XXc1+7ASkFkvR0LJO3/O8XHU/Wzwzm1nHXS11WOfiV1C25gUJlgkr8+rPJKm+cqNDugtZw5+6Aw/t8lDLW/VEJW1JmhcD992ubGO2b5e59yzz1h9u4bcNlDu9rOacnDovCu//plV2cmxmmv9Zk/8Q79Pd5vH/hMPPNOg09zb6JE/TUKHyk/ClxZM68NeYUDKUMTICzmJgBMwg0r75X4ZMzk5z6+HUqwXXePe3x0psLDsirLQ8j4ftWx8MPdHKr79xxhZdeP06rHQL+P6/MEQQSze2hG1RRJSwyxrDU7uXEKR/f1Fho1jHGcPKCz9xSF4BA+ugEQ6mvttxN14xi6CdLKlWCVfmxFMVKfjBrStnUBkaGB/nxX9/LxEbFG+9O8dwrp9m356s8/UadHROGc1c1/XVh15YuH5ytoRU8cHCerWMd3j+3hW/e30tvz4p1Oppjpya4OFNHKdi7eZ69t1zOMBJWVlvU6z1cmx9jYbWPrh+w2mwm8ybn93NhbjOCYkPvErs2vE3TH+Hj6bsY7plnvj2MVsItvR8y3PMxZ5YewbRm2DbwIqtyH9c6exha/Vc2DivWfqTjGgusbIqW9VW1quIbhwIGB/t5+vUK//aMR299jJ//47301DwAXnj9c4Ll4yw3Fa/+3yKXzryIp31++XybheU2AC++vcBqM0hO4vL0IBeme3nm2efxWh9w6uow75x0fVWcoM/NLbAcjDI5M8js/EISMVfao5yfm+APxz7gypnfstSu89bp7cn4uydvcPKdXyKmw9tnx1lYCb//1GXD8qpJ1j9+ur0+FZ0sN5mj1sE7BHP3NsVDd8/Tw0UuXp7i3VOKX7+yTBCeA0Fnhkd/tAel4PzkDP/w4wOMDiqMKG7MtQu/ZXapB4BvP/g1hjfeDsBrxxVRBuQ+uvOMjGzg0mw/16duoHV4eKk9DMDBA3u4/cDXEaW5utjPjYVwkempa/zVQzX6ax1As7hsUDeDlJSNSBRE1iVp+ub6jOJXr2m+eajBYz8cZaXp84tnhbc/WmXrmADDbNrYE5aD0R3tq1cKPIf76K0FBIHh4xMvs7i5n4szw2waukFgxqhod+7YwBzUd4agXL/KPQdvYXYOKroLBj7+8D3mh6e4vrKdup7D3DYIwGCfoHWawcbJudYaBAKputetrIxFrBHnfQRgOE9yblI5b4SxDYbNI5qX3q1xcUqYXfRodYRPTp2l9tAdJSgp564Vgbh1bIkzV4e4995vMNjQ9E97DMkxqpU0EY8fG/pnWfYMzbZw68gkPdXDAIw0rtBu7earhw+xabDF9eVh5i4fY6ihmV7IF08APV6TrbdsYlF/h2532D19SZ+l8MIkLlTFnoVdykp0QKKySCnh20d8+rzrPPfaJK++dZbnf/8KP3l4hL3bexmoXqPdXgER9kzMcfb8JAC7tyxx8tRZAHaNz3Dm84soJWwdvsrFS1fo6+1w5PaLXLw8w6vHrvLc8y8wMRafTHhuExtmOXf2MxSG3aNnefPYCfbvajDWuMynp8+hlc/+Te+wPH+VP3y4xHMvvE6NMwzUl+gsnGZhYQaA4eq55Fwm6m/SnJ/k2CfzHD16lGuXPmXdh7j0UtNv/0jiJFjrNAnWcWIcHdNKo3RYsaBgcbnDarPL0EAP9Z4KgqHbCfBNQLWi8f2AbtenWlWYwNDu+HgaRAydjk+lAkFg6HR9ahUdHu/63Jhr0d/n0VNTOcWl1Q7QStBKaHV8tAoB7nR8Kh6JijK70KHiCY1ejTEG3w/wjaGiQ8Wm3QnwtACGwDfML3Vp1FXyeU9LgWITqzTiAFiRqBQjUlLCFCZSVZSAmEhRETAgyqBQDDSqDDRCvxHLPJ6n0FpjxKA11KohMGEE15GUBLWax7XpLv97rMnubR4HvxT5E08xPtqbyE5ZU6pVVSRbSbieCS+oEt2A2GEMDVTBBGE5CXieK0rUqiqSp8JiYHjQiwBSmGiecDMPoZIqH1hyVFTcx/oe4d0Ki/m4+LZ9RKz3SaL9xeYXvpTkpsRu4ZmXV/nhd+pMz/qO60gUHRHe+0T49cuKf3o0xPHJZ6s8eG+XDYMmcS2/ea3BpWsazxO+e/8y733Sy7krFaqe8NCRecaHV7h5OCTn66TwdRphdHzxyQVaINiiqHFeR5SO6Z0ZdwRV7DVTnzp1w9BTU2zZ5LG4bABhtWnwfWi3w6n7d8Erx+HyFMwvwRO/01QrQrMVhrxmU/OVvR0O7O6yf2eXhSWPO3Y32b+zw/6dbRaWqo7fSuW21JVJhuXOTSwIKNngGDFQrOghKGUQ0YAJJajQUFPZh0hqynypy8RYiTYumAinz3X49LzhreNtzl/2WVoRDu3TPP9G6Cfvu0txeL/Q9YU/v0/x0RlFb03zzUPCwpLiyed6+cnDqzz1Ui/33dXmxOkq12cVP/vLJitNxYdnakzNa3768HQx90TWrInz8yQjpFp6oEg6MZY5xbktkRAaa3exGmghmETrHIhFbBZ2bq3w5Z2avds9FpYC7jnocW4y4EvbFdu2wFf2KowIiytw/12GX72sOPJHwnC/MD5q+Nohn6deqvO1Qy26XfjjO9psGuly9HiDA7ubHN7XYut4i6MnhvjOfavWNWUhKAKoaLvCnqucIKJD3S5/kbYpGiPO3oSJTNdYewcmnm+iv8wa9nd0A8PERk1PDT48HfDBqYDbd2iabbh1k0puwvUZGOgXDuwWDu41VCpw5oLHji0+568qbt3cpdNVTM16fPRZL9u3dGm1NVNzFT76vI/tE+1MHmdtOUjWjMU186K0z8mQxQoijvM0IDqaZ0JhM66XYxnXYaDL2mLmpZtIiLDSNNyyWdGow4//rAYII0PCg0c0wwOS+Mltm4W+ujC+wdCoB3z3gQCMoLTw4D1dFMK2iTZD/ZqeasBAo8NqSzHY6FCrBAw2mhghn+NaluK6oXxgzLNTZU04/gbL3xljmauOgIlTgVixEetLxXG+IXamgNXCK2+3WF4x3H2wgoiwcQOM3fNfeJ7HlsxNv63ArK5cucrTz/yOH/3sYfr7G5x8+k/orflR6iPUawE9I90oLbGYVeLFxDLj0shrXVdWt44AjMGzg0aiwkXgiZW+KNzNN5uBLhPJmPKXd3qAZnRYJcf9rs+lSxfZvWcv6wlJGzdu5PuPfI/R0RF830+iPKXmWLT1GrM8yz6xqp+i8byyWkm3IVMQ43xPYW+4xLtgoW5rX6l7AWKVf/l0aGxEJQxNfCMgpoNvoKrXBrDR6KPR6MtEykwWYAWNbJq2FtC263P8psNJVcRA3IiLTnylKLE2eYhMu6i2Tjdd4pwvvBCzZoASEabnPKr1vUxOdvhijyBKLYtY4/q5Mv8njjHnAc2H41waY4GWCC8m3ViJmBeCGG1mF+wPiMV1J60RcSsRB7xw/+7nj1d5/2oFb/UUyrTx+w/eFHx3Tvg89uV8leOwn2wlJAnT0jniBBCy6ziMdHUux4STLcZ4Myg24/hD0T6qsn2D7W4TE6Y4H6SAhSZd4Yd3fIbuwi8uhgD+7QMwswBdBbMz8NalolzXYrxjxrhBpMDNpDkshQDjuIGiEKMiBsYmqrTjWpSSZH82iR+iSnP4PHhrBBSLkQA7eq/w6J/+M3r+Em8+eYLP/HHEwC2bwPdhdXWNCtY2S4uJsVlKQbWUj7AlAItkI4jb2iHGDggmirB27hf3ToS1Spy+FFY9hemMFICYSbKBa+1hPr9wELW8nWt+uHP2+Os3U225NbZrllIafXPzcv5RSmSFzLb75y98S4oaiNxOLGtTej09oyCdIScquKb8budpVloVlLSjOrv3pnxgo9dnx9LdkSswme6vVL9zurqyHVhS1LklmS4uyWr0qZwl2SIxdnBJ+hJFXol36bLhPBPlCu6oZBiSNeeHv12l024y8/lvkK5h/PbvUW8MrAug7yve+09b9cl+T5mJ51vxEouJL8byh2UROI3CsVCglNXgE/W8JE03KuNMS7bqM9GwMKBkckSA6c/+nRHzOP7SDDdOLLL1yE85fwX6610qLCBoKtUaPbUatVotY8LxupncMgeO5MbJ+OsE4Jx8X2zCFTFWyuJ0R1lpS9Q+puyGwCKhLBeF3cQ6lw9aDt20znJl6RDS6jLQfx2AThemFha5vnCSvvoAw701BjdMMDE+4mZvkmdXGJwsJmZSliKR147CjkC8hi+s2HmOiv+JskCV1IzjOQW+ULIgZlm4FohAbeMP8Fb/BdQKauIxAPbeBjDK3uAIoDBB4LDPjqx5/5plp82+DDiOiVs3Jcc6lSNNJUxmrY7QpBUnbiMj6QolblQsSmRyqQFOTkZpPigEQcDm7XezPPoEoOgfGCIIAqfpJ9zb8JzjQRAUVjbgpksUBTKLiYXlZxIIVYEKY9XCxoStuXGjY5JIR/4vyf2sPHCtHYW0jKLEF2VNyeB5HjOXLrE8dQPp+Pi7tjE6MXGTKUxe8XES6xz73PPJmW6GqcVdC5JJpJN2NLHyQBz1JVk/7jpYQ751T6a4AT0bDZf/4yibjgcw2+Ta9y8w+vc/YPI6DPT5VHQr3I7s+mwcGSkEMcvqnFBMiQVQYOaFCnWRoCApgHHZJkm/c9w2G/VHKavLdN08sBw8SqJwe6yKvjSLv7iI3rEbgGYbZqdmGWjMc22lw47N40leny3lpBBEKWWp89mMn07JpzJaocr1bVTEWKqz1Suc5H5xQ7iQ+4lDWSViS1y2RJ4t8m0A9/7dX/BJ5wlkaIwD3/o6AHu2AYwD4+woNWNTvomV3WrN1OLZrQwn/ytpTcmVckaizSSRddIXlducKUNS1hIXMkxEhE6ng+d5bP+bh/G0R7fbvTkxKwkia29iZfdmChmaTXkym0dFSoyTSMe/1UhMOemij9mi8kVIgYvIpzP2SVHod0799v4CE5N0kwqLVcYUAGOKGZfxfSKu5ldWweRZp0ragyWTSCfCgUpSlkQ7UMpRdEo7iYuicFFFghsp8xtSZk0RVgpN1SQirhQqP+X1uBt5VWG5WhKF056Y9PcZUedRxMzwZwnirCl5RXXNdEYKEuscaIUXerNAFrORNVMd162IrNfJmPeJliItVg3spi/pz7HstVXhNnV2nyLPQJeJOamL9ZlyMyacCy6YEj0yukm5vhhV8t71hRVjTLJdqVRGwif+eYKl0pJFMidN5xTcwnSmSDEpzNvW21PJvDbFbCsPMFnRVJV0IRSLqmEpZ/0mTcXiqV2FZH8eJ2qdSiQrrlIIXl5NKRccypm2FqhmbRCdm6jW6McqAlPFpZyxckDSci7xeSqj90UJdnkTibvVaW9IF6Uz2WTXqZvN2vsp6zIycwyTYbUp7XnJC6hFc+J9YSsHTH+/hpu+qJTe5bmg5HqKc+Bl0oZYi8tH6CLWRFHWuCb+RVMcd01KAFMlETkrqCZpTKzAkKlCbNNUZYJ0voVcCrY6c1J/eUApj8rrBY01xk12jHUqjiIGuq//HzB1O6OYq0o9AAAAAElFTkSuQmCC
EOF
		),
	),
);

?>

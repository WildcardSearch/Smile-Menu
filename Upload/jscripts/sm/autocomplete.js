/*
 * Plugin Name: Smile Menu for MyBB 1.8.x
 * Copyright 2019 WildcardSearch
 * https://www.rantcentralforums.com
 *
 * this file contains a module for the auto-completion functionality
 */

var SmileMenu = (function($, m) {
	"use strict";

	var options = {
			minLength: 2,
			maxLength: 30,
			minWidth: 100,
			maxItems: 5,
			fullText: 0,
			lockSelection: 1,
		},

		lang = {
			instructions: "type a user name",
		},

		key = {
			BACKSPACE: 8,
			ENTER: 13,
			SHIFT: 16,
			CTRL: 17,
			ALT: 18,
			ESC: 27,
			PAGE_UP: 33,
			PAGE_DOWN: 34,
			END: 35,
			HOME: 36,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,
			INSERT: 45,
			DELETE: 46,
			NUMLOCK: 144,
		},

	/**
	 * the popup object
	 */
	Popup = (function() {
		/**
		 * constructor
		 *
		 * @param  function editor interface
		 * @return void
		 */
		function SmileMenuAutoCompletePopup(editorInterface) {
			var $testDiv, $testSmilie, container;

			this.editorInterface = editorInterface;
			container = this.editorInterface.getContainer();

			// clone the master popup and get linked up to the copy
			this.$popup = $("#sm_master_popup").clone().attr("id", "");
			this.$spinner = this.$popup.find("div.sm_spinner").hide();
			this.$input = this.$popup.find("input.sm_popup_input");
			this.$inputDiv = this.$popup.find("div.sm_popup_input_container");
			this.$body = this.$popup.find("div.sm_popup_body");

			if (typeof container === "string" &&
				$("#" + container).length) {
				this.$container = $("#" + container);
			} else if (typeof container === "object" &&
				$(container).length) {
				this.$container = $(container);
			} else {
				return false;
			}

			this.$container.append(this.$popup);
			this.$popup.css({
				left: "-1000px",
				top: "-1000px",
			}).show();

			this.inputHeight = this.$inputDiv.height();

			$testDiv = $("<div/>");

			$testSmilie = $("<div/>", {
				"class": "sm_smilie_image",
			}).appendTo($testDiv);

			$testDiv.append(Array(options.maxLength + 1).join("M"))
				.addClass("sm_popup_item");

			this.$body.html($testDiv);

			// figure the line height for later use
			this.lineHeight = pi($testDiv.height()) +
				this.editorInterface.lineHeightModifier +
				pi($testDiv.css("paddingTop").replace("px", "")) +
				pi($testDiv.css("paddingBottom").replace("px", ""));

			this.$instructions = $("<span/>", {
				"class": "sm_popup_instructions",
			}).html(lang.instructions);

			this.scrollWidthDiff = this.$body.width() - this.$body[0].scrollWidth;

			this.keyCache = new KeyCache(this);
			this.smilieCache = new SmilieCache(this);
		}

		/**
		 * display the popup where the user was typing (hopefully)
		 *
		 * @param  int
		 * @param  int
		 * @return void
		 */
		function show(left, top) {
			this.$input.val(":");
			this.keyCache.setText(":");

			// go ahead and fill the popup with suggestions from the name cache
			this.update();

			// resize, locate and show the popup, selecting the first item
			this.move(left, top);
			this.$popup.show();
			this.lastSelected = null;
			this.select();
			this.visible = true;

			// for highlighting, selecting and dismissing the popup and items
			this.$body.mouseover($.proxy(this.onMouseMove, this));
			this.$body.click($.proxy(this.onClick, this));
			$(document).click($.proxy(this.hide, this));
			this.editorInterface.bindClick($.proxy(this.hide, this));
			this.$input.keydown($.proxy(this.onKeyDown, this));
			this.$input.keyup($.proxy(this.updateCheck, this));
			this.$input.click($.proxy(this.onInputClick, this));

			this.$input.focus();
		}

		/**
		 * hide the popup
		 *
		 * @return void
		 */
		function hide() {
			this.$popup.hide();

			this.$body.off("mouseover", this.onMouseMove);
			this.$body.off("click", this.onClick);
			$(document).off("click", this.hide);
			this.editorInterface.unbindClick(this.hide);
			this.$input.off("keydown", this.onKeyDown);
			this.$input.off("keyup", this.updateCheck);
			this.$input.off("click", this.onInputClick);

			this.visible = false;
			this.$input.val("");
		}

		/**
		 * resize and/or reposition the popup
		 *
		 * @param  int x1
		 * @param  int y1
		 * @return void
		 */
		function move(left, top) {
			var style,
				longestText = this.smilieCache.getlongestText(),
				$testSmilie;

			this.width = 0;
			$testSmilie = $("<img/>", {
				"class": "sm_smilie_image",
				src: "images/smilies/smile.png",
			}).css({
				left: "-1000px",
				top: "-1000px",
			}).appendTo(this.$container);
			this.width += $testSmilie.width();
			$testSmilie.remove();

			this.width += pi(this.$body.css("fontSize").replace("px", "") * longestText);
			this.width = Math.max(options.minWidth, this.width);

			style = {
				height: this.getCurrentHeight() + this.inputHeight + "px",
				width: pi(this.width - this.scrollWidthDiff) + "px",
			};

			if (typeof left != "undefined") {
				style.left = left + "px";
			}
			if (typeof top != "undefined") {
				style.top = top + "px";
			}

			this.$popup.css(style);

			this.$body.css({
				height: this.getCurrentHeight() + "px",
				width: this.width,
			});
		}

		/**
		 * fill the popup with suggested names from
		 * the cache and search to fill the gaps
		 *
		 * @return void
		 */
		function update() {
			// if we get here too early, back off
			if (!this.smilieCache.isReady()) {
				this.showSpinner();
				return;
			}

			// get matching names and insert them into the list, selecting the first
			this.smilieCache.match();
			this.buildItems();
			this.lastSelected = null;
			this.select();

			/**
			 * if we have at least {minLength} chars,
			 * search to augment the (incomplete) name cache
			 */
			if (this.keyCache.getLength() >= options.minLength) {
				this.smilieCache.search();
			}
		}

		/**
		 * build the actual list items (divs)
		 *
		 * @return  void
		 */
		function buildItems() {
			var i, text, smilie, smiliePath, start, user,
				cacheLength = this.smilieCache.getItemsLength(),
				data = this.smilieCache.getData(),
				c = (navigator.userAgent.toLowerCase().indexOf("msie") !== -1) ? "hand" : "pointer";

			this.items = this.smilieCache.getItems();

			// if we've got no matches and the spinner isn't up . . .
			if (cacheLength === 0 &&
				this.spinnerVisible == false) {
				// . . . and there are typed chars . . .
				if (this.keyCache.getLength() > 0) {
					// . . . show them what they've typed
					this.clear();
					this.$body.html($("<span/>", {
						"class": "sm_typed_text",
					}).html(this.keyCache.getText()));
				} else {
					// . . . otherwise, instruct them (this should rarely, if ever, be seen)
					this.showInstructions();
				}

				// resize the popup
				if (this.isVisible()) {
					this.move();
				}
				return;
			}

			// if we have content, clear out and get ready to build items
			this.clear();

			for (i = 0; i < cacheLength; i++) {
				user = this.items[i];
				text = data[user]["code"];
				if (this.keyCache.getText()) {
					start = user.indexOf(this.keyCache.getText());

					if ((options.fullText && start !== -1) ||
						(!options.fullText && start === 0)) {
						text = text.slice(0, start) +
						'<span class="sm_name_highlight">' +
						text.slice(start, start + this.keyCache.getLength()) +
						"</span>" +
						text.slice(start + this.keyCache.getLength());
					}
				}

				smiliePath = data[user]["url"];

				smilie = $("<div/>", {
					"class": "sm_smilie_image",
				}).css({
					backgroundImage: "url("+smiliePath+")",
				});

				this.$body.append($("<div/>", {
					"class": "sm_popup_item sm_popup_item_" + i,
				}).append(smilie).append(text).css({
					cursor: c,
				}));
			}

			// resize the popup
			if (this.isVisible()) {
				this.move();
			}
		}

		/**
		 * clear the popup
		 *
		 * @return void
		 */
		function clear() {
			this.$body.html("");
			this.lastSelected = null;
			this.spinnerVisible = false;

			// resize the popup
			if (this.isVisible()) {
				this.move();
			}
		}

		/**
		 * show the activity indicator
		 *
		 * @return void
		 */
		function showSpinner() {
			this.clear();
			this.$body.html(this.$spinner);
			this.spinnerVisible = true;

			// resize the popup
			if (this.isVisible()) {
				this.move();
			}
		}

		/**
		 * show the usage prompt
		 *
		 * @return void
		 */
		function showInstructions() {
			this.clear();
			this.$body.html(this.$instructions);
		}

		/**
		 * update the popup if necessary
		 *
		 * @return void
		 */
		function updateCheck() {
			if (this.keyCache.update()) {
				this.update();
			}
		}

		/**
		 * highlight an item in the name list
		 *
		 * @param  string position alias
		 * @return void
		 */
		function select(selection) {
			var lastItem = this.smilieCache.getItemsLength() - 1;

			switch (selection) {
			case "last":
				this.selected = lastItem;
				break;
			case "next":
				this.selected++;
				if (this.selected > lastItem) {
					this.selected = 0;
				}
				break;
			case "previous":
				this.selected--;
				if (this.selected < 0) {
					this.selected = lastItem;
				}
				break;
			case "nextPage":
				this.selected  += options.maxItems;
				if (this.selected > lastItem) {
					this.selected = lastItem;
				}
				break;
			case "previousPage":
				this.selected  -= options.maxItems;
				if (this.selected < 0) {
					this.selected = 0;
				}
				break;
			default:
				this.selected = 0;
				break;
			}

			this.highlightSelected();
		}

		/**
		 * assign the "on" class to the currently
		 * selected list item
		 *
		 * @param  bool true to highlight without scrolling the item into view
		 * @return void
		 */
		function highlightSelected(noScroll) {
			var $selectedItem = this.$popup.find(".sm_popup_item_" + this.selected),
				$lastSelectedItem = this.$popup.find(".sm_popup_item_" + this.lastSelected),
				$highlightSpan = $lastSelectedItem.find("span.sm_name_highlight_on"),
				offset = this.itemInView($selectedItem);

			if (this.lastSelected == this.selected ||
				$selectedItem.length == 0) {
				return;
			}

			if ($lastSelectedItem.length) {
				$lastSelectedItem.removeClass("sm_popup_item_on");

				if ($highlightSpan.length) {
					$highlightSpan.removeClass("sm_name_highlight_on");
					$highlightSpan.addClass("sm_name_highlight");
				}
			}
			this.lastSelected = this.selected;

			if ($selectedItem) {
				if (!$selectedItem.hasClass("sm_popup_item_on")) {
					$selectedItem.addClass("sm_popup_item_on");
				}

				$highlightSpan = $selectedItem.find("span.sm_name_highlight");
				if ($highlightSpan.length) {
					$highlightSpan.removeClass("sm_name_highlight");
					$highlightSpan.addClass("sm_name_highlight_on");
				}
			}

			if (noScroll ||
				(options.lockSelection !== 1 &&
				offset === true)) {
				return;
			}

			if (options.lockSelection) {
				if (this.smilieCache.getItemsLength() - options.maxItems > 0) {
					this.$body.prop("scrollTop", pi($selectedItem.prop("offsetTop") - this.inputHeight));
				}
				return;
			}

			if (this.selected == 0) {
				this.$body.prop("scrollTop", -this.inputHeight);
				return;
			}

			if (offset > 0) {
				this.$body.prop("scrollTop", pi($selectedItem.prop("offsetTop") - (this.getCurrentHeight() - this.lineHeight) - this.inputHeight));
				return;
			}

			this.$body.prop("scrollTop", pi($selectedItem.prop("offsetTop") - this.inputHeight));
		}

		/**
		 * determines whether an item is in view
		 *
		 * @param  jQuery element
		 * @return boolean|int
		 */
		function itemInView($el) {
			var offset = $el.prop("offsetTop") - this.$body.prop("scrollTop");
			if (offset > 0 &&
				(offset + this.lineHeight) < this.getCurrentHeight()) {
				return true;
			}
			return offset;
		}

		/**
		 * basic navigation for when the popup is open
		 *
		 * @param  event
		 * @return void
		 */
		function onKeyDown(e) {
			switch (e.keyCode) {
			case key.ENTER:
				this.editorInterface.insert();
				break;
			case key.UP:
				this.select("previous");
				break;
			case key.DOWN:
				this.select("next");
				break;
			case key.END:
				this.select("last");
				break;
			case key.HOME:
				this.select();
				break;
			case key.PAGE_UP:
				this.select("previousPage");
				break;
			case key.PAGE_DOWN:
				this.select("nextPage");
				break;
			case key.ESC:
				this.hide();
				break;
			case key.BACKSPACE:
				if (this.$input.val() === "") {
					this.hide();
					this.editorInterface.focus();
				}
				return;
				break;
			default:
				return;
			}

			/**
			 * prevent a few navigation keys from
			 * working when the popup is in view
			 */
			e.preventDefault();
		}

		/**
		 * highlight items when the mouse is hovering
		 *
		 * @param  event
		 * @return void
		 */
		function onMouseMove(e) {
			if (this.selectEventTarget(e)) {
				this.highlightSelected(true);
			}
		}

		/**
		 * trigger smilie insertion on click
		 *
		 * @param  event
		 * @return void
		 */
		function onClick(e) {
			if (this.selectEventTarget(e)) {
				this.editorInterface.insert();
			} else {
				e.preventDefault();
			}
		}

		/**
		 * prevent event bubbling for clicks in input
		 *
		 * @param  event
		 * @return void
		 */
		function onInputClick(e) {
			e.stopPropagation();
		}

		/**
		 * select the element that the event was originally triggered on
		 *
		 * @param  event
		 * @return void
		 */
		function selectEventTarget(e) {
			if (!e) {
				return false;
			}

			var $target = $(e.target),
				classes,
				className,
				classNameParts,
				gotClassName = false;

			if ($target.length == 0 ||
				!$target.hasClass("sm_popup_item")) {
				return;
			}

			classes = $target.prop("class").split(" ");
			while (className = classes.shift()) {
				if (typeof className !== "undefined" &&
					["sm_popup_item", "sm_popup_item_on"].indexOf(className) === -1 &&
					className.indexOf("sm_popup_item_") === 0) {
					gotClassName = true;
					break;
				}
			}

			classNameParts = className.split("_");
			if (!gotClassName ||
				!classNameParts ||
				classNameParts.length == 0 ||
				!classNameParts[classNameParts.length - 1]) {
				return false;
			}

			// if all is good, select it
			this.selected = classNameParts[classNameParts.length - 1];
			return true;
		}

		/**
		 * return the name of the currently selected item
		 *
		 * @return void
		 */
		function getSelectedSmilie() {
			if (this.smilieCache.getItemsLength() === 0 ||
				!this.items[this.selected]) {
				return;
			}

			return this.smilieCache.getData()[this.items[this.selected]]["code"];
		}

		/**
		 * approximate height based on initial line measurements
		 *
		 * @return int the height in pixels
		 */
		function getCurrentHeight() {
			return (this.lineHeight * Math.max(1, Math.min(options.maxItems, this.smilieCache.getItemsLength()))) + this.editorInterface.heightModifier + 4;
		}

		/**
		 * getter for popup input value
		 *
		 * @return string
		 */
		function getInputValue() {
			return this.$input.val();
		}

		/**
		 * getter for line height
		 *
		 * @return int
		 */
		function getLineHeight() {
			return this.lineHeight;
		}

		/**
		 * getter for spinner visibility
		 *
		 * @return bool true if visible, false if not
		 */
		function spinnerIsVisible() {
			return this.spinnerVisible;
		}

		/**
		 * getter for popup visibility
		 *
		 * @return bool true if visible, false if not
		 */
		function isVisible() {
			return this.visible;
		}

		// extend the prototype
		$.extend(SmileMenuAutoCompletePopup.prototype, {
			show: show,
			hide: hide,
			move: move,
			update: update,
			buildItems: buildItems,
			clear: clear,
			showSpinner: showSpinner,
			showInstructions: showInstructions,
			updateCheck: updateCheck,
			select: select,
			highlightSelected: highlightSelected,
			itemInView: itemInView,
			onKeyDown: onKeyDown,
			onMouseMove: onMouseMove,
			onClick: onClick,
			onInputClick: onInputClick,
			selectEventTarget: selectEventTarget,
			getSelectedSmilie: getSelectedSmilie,
			getCurrentHeight: getCurrentHeight,
			getInputValue: getInputValue,
			getLineHeight: getLineHeight,
			spinnerIsVisible: spinnerIsVisible,
			isVisible: isVisible,
		});

		return SmileMenuAutoCompletePopup;
	})(),

	/**
	 * this object manages the chars typed since the @ symbol
	 */
	KeyCache = (function() {
		/**
		 * constructor
		 *
		 * @param  SmileMenuAutoCompletePopup
		 * @return void
		 */
		function SmileMenuKeyCache(popup) {
			this.popup = popup;
			this.clear();
		}

		/**
		 * reset the key cache
		 *
		 * @return void
		 */
		function clear() {
			this.data = "";
			this.mirror = "";
		}

		/**
		 * get change state
		 *
		 * @return bool true if changed
		 */
		function update() {
			var ret = false,
				inputVal = this.popup.getInputValue();
			if (this.data !== inputVal) {
				ret = true;
			}

			this.data = inputVal;
			return ret;
		}

		/**
		 * getter for data length
		 *
		 * @return int
		 */
		function getLength() {
			return this.data.length;
		}

		/**
		 * getter for data
		 *
		 * @param  bool false forces lowercase
		 * @return string
		 */
		function getText(natural) {
			if (natural != true) {
				return this.data.toLowerCase();
			}
			return this.data;
		}

		/**
		 * getter for data
		 *
		 * @param  bool false forces lowercase
		 * @return string
		 */
		function setText(text) {
			this.data = text ? text : "";
		}

		// extend the prototype
		$.extend(SmileMenuKeyCache.prototype, {
			clear: clear,
			update: update,
			getLength: getLength,
			getText: getText,
			setText: setText,
		});

		return SmileMenuKeyCache;
	})(),

	/**
	 * the user name cache object
	 */
	SmilieCache = (function() {
		/**
		 * constructor
		 *
		 * @param  SmileMenuCache
		 * @return void
		 */
		function SmileMenuCache(popup) {
			this.data = {};
			this.allNames = {};
			this.ready = false;
			this.loading = true;
			this.searching = false;
			this.searched = [];
			this.items = [];
			this.longestText = 5;
			this.popup = popup;
			this.editorInterface = this.popup.editorInterface;
			this.keyCache = popup.keyCache;

			$.ajax({
				type: "post",
				url: "xmlhttp.php",
				data: {
					action: "sm",
					mode: "Load",
					tid: options.tid,
				},
				success: this.OnLoad.bind(this),
			});
		}

		/**
		 * deal with the server response and store the data
		 *
		 * @param  object XMLHTTP response JSON
		 * @return void
		 */
		function OnLoad(response) {
			this.ready = true;
			this.loading = false;

			$.extend(this.data, response);

			if ($.isEmptyObject(this.data)) {
				this.data = {};
				this.popup.hide();
				return;
			}

			if (this.popup.isVisible()) {
				this.popup.update();
			}
		}

		/**
		 * list names that match the keyCache (currently typed string)
		 *
		 * @return int total items matched
		 */
		function match() {
			var property,
				i = 0,
				done = {};

			this.items = [];
			this.longestText = 5;

			// standard name cache
			for (property in this.data) {
				if (!this.checkEntry(property, this.data, done)) {
					continue;
				}

				this.items.push(property);
				done[property] = true;
				i++;
			}

			this.items = this.items.sort(sortByLength);

			return i;
		}

		/**
		 * check a name before using it
		 *
		 * @return bool
		 */
		function checkEntry(property, data, done) {
			if (!data.hasOwnProperty(property) ||
				!data[property] ||
				done[property] ||
				(this.keyCache.getLength() &&
				((!options.fullText &&
				property.slice(0, this.keyCache.getLength()) !== this.keyCache.getText()) ||
				(options.fullText &&
				property.indexOf(this.keyCache.getText()) === -1)))) {
				return false;
			}

			if (property.length > this.longestText) {
				this.longestText = property.length;
			}

			return true;
		}

		/**
		 * search for names that begin with the first
		 * {minLength} chars of the keyCache
		 *
		 * @return void
		 */
		function search() {
			// reset everything and rebuild the list
			this.match();
			this.popup.buildItems();
			this.popup.select();
		}

		/**
		 * getter for ready state
		 *
		 * @return bool true if cache loaded
		 */
		function isReady() {
			return this.ready;
		}

		/**
		 * getter for loading state
		 *
		 * @return bool true if cache loaded
		 */
		function isLoading() {
			return this.loading;
		}

		/**
		 * getter for user data
		 *
		 * @return object
		 */
		function getData() {
			return this.data;
		}

		/**
		 * getter for the item list
		 *
		 * @return array
		 */
		function getItems() {
			return this.items;
		}

		/**
		 * getter for items length
		 *
		 * @return int
		 */
		function getItemsLength() {
			return this.items.length;
		}

		/**
		 * getter for longest name length
		 *
		 * @return int
		 */
		function getlongestText() {
			return this.longestText;
		}

		// extend the prototype
		$.extend(SmileMenuCache.prototype, {
			OnLoad: OnLoad,
			match: match,
			checkEntry: checkEntry,
			search: search,
			isReady: isReady,
			isLoading: isLoading,
			getData: getData,
			getItems: getItems,
			getItemsLength: getItemsLength,
			getlongestText: getlongestText,
		});

		return SmileMenuCache;
	})(),

	/**
	 * interface for textarea element
	 */
	TextareaInterface = (function() {
		/**
		 * constructor
		 *
		 * @param  string
		 * @return void
		 */
		function AutoCompleteTextareaInterface(textareaId) {
			this.$textarea = $("#" + textareaId);
			this.$container = this.$textarea.closest("div");

			this.selection = {
				start: 0,
				end: 0,
			};

			// go ahead and build the popup
			this.popup = new Popup(this);

			// poll for the @ char
			this.bindKeyup();
		}

		/**
		 * polling for the @ character when uninitiated
		 *
		 * @param  event
		 * @return void
		 */
		function onKeyUp(e) {
			if (this.popup.isVisible()) {
				return;
			}

			// open the popup when user types an @
			this.getCaret();
			if (checkKeyCode(e.keyCode) &&
				this.$textarea.val().slice(this.selection.start - 1, this.selection.end) == ":") {
				this.showPopup();
			}
		}

		/**
		 * position and display the popup
		 *
		 * @return void
		 */
		function showPopup() {
			var coords = this.$textarea.caret("offset"),
				left = coords.left + 3,
				top = coords.top - 5;

			this.popup.show(left, top);
		}

		/**
		 * insert the smilie and get out
		 *
		 * @return void
		 */
		function insertSmilie() {
			var smilie = prepSmilie(this.popup);

			if (!smilie) {
				if (!this.popup.spinnerIsVisible()) {
					this.popup.hide();
				}
				return;
			}

			this.getCaret();

			this.$textarea.val(this.$textarea.val().slice(0, this.selection.start - 1) +
				smilie +
				this.$textarea.val().slice(this.selection.start));
			this.setCaret(this.selection.start + smilie.length);

			// and we're done here (for now)
			this.popup.hide();
		}

		/**
		 * store info about the caret/selection
		 *
		 * @return void
		 */
		function getCaret() {
			var range = this.$textarea.caret("pos");

			this.selection.start = range;
			this.selection.end = range;
		}

		/**
		 * position the caret
		 *
		 * @param  int
		 * @return void
		 */
		function setCaret(start, end) {
			var temp, range;

			if (typeof end === "undefined") {
				end = start;
			}

			temp = this.$textarea[0];

			if (temp.setSelectionRange) {
				temp.focus();
				temp.setSelectionRange(start, end);
			} else if (temp.createTextRange) {
				range = temp.createTextRange();
				range.collapse(true);
				range.moveEnd("character", end);
				range.moveStart("character", start);
				range.select();
			}
		}

		/**
		 * API for popup to attach event listener
		 *
		 * @return void
		 */
		function bindClick(f) {
			this.$textarea.click(f);
		}

		/**
		 * API for popup to detach event listener
		 *
		 * @return void
		 */
		function unbindClick(f) {
			this.$textarea.off("click", f);
		}

		/**
		 * API for popup to attach event listener
		 *
		 * @return void
		 */
		function bindKeyup() {
			this.$textarea.keyup($.proxy(this.onKeyUp,this));
		}

		/**
		 * API for popup to detach event listener
		 *
		 * @return void
		 */
		function unbindKeyup() {
			this.$textarea.off("keyup");
		}

		/**
		 * API for popup to focus editor
		 *
		 * @return void
		 */
		function focus() {
			this.$textarea.focus();
		}

		/**
		 * getter for the container element
		 *
		 * @return string|object
		 */
		function getContainer() {
			return this.$container;
		}

		// extend the prototype
		$.extend(AutoCompleteTextareaInterface.prototype, {
			heightModifier: 0,
			lineHeightModifier: 0,
			onKeyUp: onKeyUp,
			showPopup: showPopup,
			insert: insertSmilie,
			getCaret: getCaret,
			setCaret: setCaret,
			bindClick: bindClick,
			unbindClick: unbindClick,
			bindKeyup: bindKeyup,
			unbindKeyup: unbindKeyup,
			focus: focus,
			getContainer: getContainer,
		});

		return AutoCompleteTextareaInterface;
	})(),

	/**
	 * interface for SCEditor
	 */
	SCEditorInterface = (function() {
		/**
		 * constructor
		 *
		 * @return void
		 */
		function AutoCompleteSCEditorInterface() {
			this.editor = MyBBEditor;
			this.rangeHelper = this.editor.getRangeHelper();

			this.$iFrame = $("div.sceditor-toolbar").next("iframe");
			this.$container = this.$iFrame.closest(".sceditor-container").parent();
			this.$body = $(this.editor.getBody());

			this.selection = {
				start: 0,
				end: 0,
			};

			// go ahead and build the popup
			this.popup = new Popup(this);

			this.editor.keyUp(this.onKeyUp.bind(this));
		}

		/**
		 * polling for the @ character when uninitiated and
		 * some navigation and editing for our key cache
		 *
		 * @param  event
		 * @return void
		 */
		function onKeyUp(e) {
			this.getCaret();

			if (!e.keyCode) {
				if (e.originalEvent &&
					e.originalEvent.keyCode) {
					e.keyCode = e.originalEvent.keyCode;
				} else {
					return;
				}
			}

			// open the popup when user types an @
			if (!this.popup.isVisible()) {
				if (checkKeyCode(e.keyCode) &&
					this.$currentNode.text().slice(this.selection.start - 1, this.selection.end) == ":") {
					this.showPopup();
				}
				return;
			}
		}

		/**
		 * position and display the popup
		 *
		 * @return void
		 */
		function showPopup() {
			var fontSize, left, top,
				coords = this.$body.caret("offset", {
					iframe: this.$iFrame[0],
				}),
				containerOffset = this.$container.offset();

			fontSize = 7;
			if (this.$currentNode.closest("div").length &&
				typeof this.$currentNode.closest("div").css === "function") {
				fontSize = pi(this.$currentNode.closest("div").css("fontSize").replace("px", "") / 2);
			}

			left = pi(coords.left) + containerOffset.left + pi(this.$container.css("paddingLeft").replace("px", "")) + fontSize + 2;
			top = pi(coords.top + this.$container.find("div.sceditor-toolbar").height()) + containerOffset.top + pi(this.$container.css("paddingTop").replace("px", "")) + 6;

			this.popup.show(left, top);
		}

		/**
		 * insert the smilie and get out
		 *
		 * @return void
		 */
		function insertSmilie() {
			var smilie = prepSmilie(this.popup),
				r = new Range(),
				sr = this.rangeHelper.selectedRange(),
				n = this.editor.currentNode();

			if (!smilie) {
				if (!this.popup.spinnerIsVisible()) {
					this.popup.hide();
				}
				return;
			}

			this.editor.focus();
			r.setStart(n, sr.endOffset - 1);
			r.setEnd(n, sr.endOffset);
			this.rangeHelper.selectRange(r);
			this.editor.insert(smilie);

			// and we're done here (for now)
			this.popup.hide();
		}

		/**
		 * store info about the caret/selection
		 *
		 * @return void
		 */
		function getCaret() {
			var range = this.rangeHelper.selectedRange();

			if (range.startContainer) {
				this.$currentNode = $(range.startContainer);
			} else {
				this.$currentNode = $(this.editor.currentNode());
			}

			this.selection.start = range.startOffset;
			this.selection.end = range.endOffset;
		}

		/**
		 * API for popup to attach event listener
		 *
		 * @return void
		 */
		function bindClick(f) {
			this.$body.click(f);
		}

		/**
		 * API for popup to detach event listener
		 *
		 * @return void
		 */
		function unbindClick(f) {
			this.$body.off("click", f);
		}

		/**
		 * API for popup to focus editor
		 *
		 * @return void
		 */
		function focus() {
			this.$iFrame.focus();
		}

		/**
		 * getter for the container element
		 *
		 * @return string|object
		 */
		function getContainer() {
			return this.$container;
		}

		// extend the prototype
		$.extend(AutoCompleteSCEditorInterface.prototype, {
			heightModifier: 0,
			lineHeightModifier: 0,
			onKeyUp: onKeyUp,
			showPopup: showPopup,
			insert: insertSmilie,
			getCaret: getCaret,
			bindClick: bindClick,
			unbindClick: unbindClick,
			focus: focus,
			getContainer: getContainer,
		});

		return AutoCompleteSCEditorInterface;
	})(),

	/**
	 * interface for CKEditor
	 */
	CKEditorInterface = (function() {
		/**
		 * constructor
		 *
		 * @param  string
		 * @return void
		 */
		function AutoCompleteCKEditorInterface(textareaId) {
			if ($("#" + textareaId).length === 0 ||
				typeof CKEDITOR.instances[textareaId] === "undefined") {
				return;
			}

			this.finalized = false;
			this.id = textareaId;
			this.editor = CKEDITOR.instances[this.id];

			if (this.editor.status != "ready") {
				this.editor.on("instanceReady", $.proxy(this.finalize, this));
			} else {
				this.finalize();
			}

			$("#quick_reply_submit").click($.proxy(this.quickReplyPosted, this));
		}

		/**
		 * when CKEditor is ready, finish up initialization
		 *
		 * @return void
		 */
		function finalize() {
			if (this.editor.mode == "wysiwyg") {
				this.doFinalize();
			}

			this.lastState = this.editor.mode;
			this.editor.on('mode', $.proxy(this.onModeChange, this));
		}

		/**
		 * attach event listeners, capture copies of key elements
		 * and create the popup
		 *
		 * @return void
		 */
		function doFinalize() {
			this.$iFrame = $("#cke_" + this.id).find("iframe");
			this.$container = this.$iFrame.closest("div");
			this.$doc = $(this.editor.document.$);
			this.$body = this.$doc.find("body");

			this.bindKeyup();

			// go ahead and build the popup
			this.popup = new Popup(this);

			this.finalized = true;
		}

		/**
		 * handle editor state changes
		 *
		 * @return void
		 */
		function onModeChange(e) {
			if (typeof e.sender.mode == "undefined" ||
				e.sender.mode == this.lastState) {
				return;
			}

			this.lastState = e.sender.mode;

			if (this.finalized) {
				this.unbindKeyup();
			}

			if (e.sender.mode != "source") {
				this.doFinalize();
			}
		}

		/**
		 * polling for the @ character when uninitiated and
		 * some navigation and editing for our key cache
		 *
		 * @param  event
		 * @return void
		 */
		function onKeyUp(e) {
			// open the popup when user types an @
			if (!this.popup.isVisible()) {
				if (checkKeyCode(e.keyCode) &&
					this.getPrevChar() == ":") {
					this.showPopup();
				}
				return;
			}
		}

		/**
		 * reinstate observation on AJAX post
		 *
		 * @return void
		 */
		function quickReplyPosted() {
			if (typeof this.$doc !== "undefined" &&
				this.$doc.length) {
				this.$doc.off("keyup", this.onKeyUp);
			}

			setTimeout($.proxy(function() {
				this.$doc.keyup($.proxy(this.onKeyUp, this));
			}, this), 500);
		}

		/**
		 * position and display the popup
		 *
		 * @return void
		 */
		function showPopup() {
			var coords = this.$body.caret("offset", {
					iframe: this.$iFrame[0],
				}),
				iFrameOffset = this.$iFrame.offset(),
				left = pi(coords.left + iFrameOffset.left) + 2,
				top = pi(coords.top + iFrameOffset.top) - 5;

			this.popup.show(left, top);
		}

		/**
		 * insert the smilie and get out
		 *
		 * @return void
		 */
		function insertSmilie() {
			var smilie = prepSmilie(this.popup),
				r = this.editor.getSelection().getRanges()[0];

			if (!smilie) {
				if (!this.popup.spinnerIsVisible()) {
					this.popup.hide();
				}
				return;
			}

			this.editor.focus();
			r.setStart(r.endContainer, r.startOffset - 1);
			r.deleteContents();
			this.editor.insertText(smilie);

			// and we're done here (for now)
			this.popup.hide();
		}

		/**
		 * get the character just before the cursor
		 * credit:
		 * http://stackoverflow.com/questions/20972431/ckeditor-get-previous-character-of-current-cursor-position
		 *
		 * @return mixed
		 */
		function getPrevChar() {
			var startNode, walker, node,
				range = this.editor.getSelection().getRanges()[0];

			if (!range ||
				!range.startContainer) {
				return null;
			}
			startNode = range.startContainer;

			if (startNode.type == CKEDITOR.NODE_TEXT &&
				range.startOffset) {
				// Range at the non-zero position of a text node.
				return startNode.getText()[range.startOffset - 1];
			} else {
				// Expand the range to the beginning of editable.
				range.collapse(true);
				range.setStartAt(this.editor.editable(), CKEDITOR.POSITION_AFTER_START);

				// use the walker to find the closest previous text node.
				walker = new CKEDITOR.dom.walker(range);

				while (node = walker.previous()) {
					// If found, return the last character of the text node.
					if (node.type == CKEDITOR.NODE_TEXT) {
						return node.getText().slice(-1);
					}
				}
			}

			// Selection starts at the 0 index of the text node and/or there's no previous text node in contents.
			return null;
		}

		/**
		 * API for popup to attach event listener
		 *
		 * @param  function
		 * @return void
		 */
		function bindClick(f) {
			this.$doc.click(f);
		}

		/**
		 * API for popup to detach event listener
		 *
		 * @param  function
		 * @return void
		 */
		function unbindClick(f) {
			this.$doc.off("click", f);
		}

		/**
		 * API for popup to attach event listener
		 *
		 * @return void
		 */
		function bindKeyup() {
			this.$doc.keyup($.proxy(this.onKeyUp, this));
		}

		/**
		 * API for popup to detach event listener
		 *
		 * @return void
		 */
		function unbindKeyup() {
			this.$doc.off("keyup", this.onKeyUp);
		}

		/**
		 * API for popup to focus editor
		 *
		 * @return void
		 */
		function focus() {
			this.editor.focus();
		}

		/**
		 * getter for the container element
		 *
		 * @return string|object
		 */
		function getContainer() {
			return this.$container;
		}

		// extend the prototype
		$.extend(AutoCompleteCKEditorInterface.prototype, {
			heightModifier: 0,
			lineHeightModifier: 0,
			finalize: finalize,
			doFinalize: doFinalize,
			onModeChange: onModeChange,
			onKeyUp: onKeyUp,
			quickReplyPosted: quickReplyPosted,
			showPopup: showPopup,
			insert: insertSmilie,
			getPrevChar: getPrevChar,
			bindClick: bindClick,
			unbindClick: unbindClick,
			bindKeyup: bindKeyup,
			unbindKeyup: unbindKeyup,
			focus: focus,
			getContainer: getContainer,
		});

		return AutoCompleteCKEditorInterface;
	})();

	/**
	 * load options and language (used externally)
	 *
	 * @param  object
	 * @return void
	 */
	function setup(opt) {
		$.extend(lang, opt.lang || {});
		delete opt.lang;
		$.extend(options, opt || {});

		$(["minLength", "maxLength", "minWidth", "maxItems", "fullText", "lockSelection"]).each(function() {
			if (typeof options[this] !== "undefined") {
				options[this] = pi(options[this]);
			}
		});
	}

	/**
	 * prepare to auto-complete
	 *
	 * @return void
	 */
	function init() {
		var id, key,
			$shoutbox = $('.panel > form > input[class="text"]');

		if (typeof CKEDITOR !== "undefined" &&
			typeof CKEDITOR.instances !== "undefined") {
			key = $.map(CKEDITOR.instances, function(i, k) { return k })[0];

			if (typeof CKEDITOR.instances[key] !== "object") {
				return false;
			}
			new CKEditorInterface(key);
		} else if (MyBBEditor !== null &&
			typeof MyBBEditor === "object" &&
			MyBBEditor.getRangeHelper &&
			typeof MyBBEditor.getRangeHelper === "function") {
			new SCEditorInterface();
		} else if ($("#message").length > 0 ||
			$("#signature").length > 0) {
			// almost every page uses this id
			if ($("#message").length) {
				id = "message";
			// usercp.php and modcp.php use this id
			} else if ($("#signature").length) {
				id = "signature";
			}

			// if no suitable text area is present, get out
			if (!id ||
				!$("#" + id).length) {
				return false;
			}

			new TextareaInterface(id);
		}

		if ($shoutbox.length) {
			$shoutbox.prop("id", "dvz_shoutbox_input");
			new TextareaInterface("dvz_shoutbox_input");
		}

		// quick edit
		$(".quick_edit_button").click(doQuickEdit);
		$("#quick_reply_submit").click(doQuickReply);
	}

	/**
	 * create a new instance when quick edit is invoked
	 *
	 * @param  event
	 * @return void
	 */
	function doQuickEdit(e) {
		var pid = this.id.split("_").slice(-1)[0],
			id = "quickedit_" + pid,
			i;

		if ($("#" + id).length == 0) {
			return;
		}

		if (typeof CKEDITOR === "undefined") {
			i = new TextareaInterface(id);
		} else {
			setTimeout(function() {
				i = new CKEditorInterface(id);
			}, 1100);
		}

		setTimeout(function() {
			$("#quicksub_" + pid)
				.add($("#quicksub_" + pid).next("button"))
				.click(function() {
				i.unbindKeyup();
			});
		}, 1100);
	}

	/**
	 * attach event listeners after a new AJAX post
	 *
	 * @param  event
	 * @return void
	 */
	function doQuickReply(e) {
		$(".quick_edit_button").off("click", doQuickEdit);
		setTimeout(function() {
			$(".quick_edit_button").click(doQuickEdit);
		}, 500);
	}

	/**
	 * quote a name and return it
	 *
	 * @return string
	 */
	function prepSmilie(popup) {
		var code = popup.getSelectedSmilie();

		if (!code) {
			return;
		}

		return code+" ";
	}

	/**
	 * check key code against a bad list
	 *
	 * @param  int
	 * @return bool
	 */
	function checkKeyCode(keyCode) {
		return [key.LEFT, key.RIGHT, key.UP, key.DOWN, key.BACKSPACE, key.ESC, key.SHIFT, key.CTRL, key.ALT, key.ENTER, key.DELETE, key.INSERT, key.END, key.NUMLOCK].indexOf(keyCode) === -1;
	}

	/**
	 * sort strings by length
	 *
	 * @param  string
	 * @param  string
	 * @return int
	 */
	function sortByLength(a, b) {
		if (a.length < b.length) {
			return -1;
		} else if (a.length > b.length) {
			return 1;
		} else {
			return 0;
		}
	}

	/**
	 * alias for parseInt
	 *
	 * @param  number
	 * @return int
	 */
	function pi(i) {
		return parseInt(i, 10);
	}

	$(init);

	m.autoComplete = {
		setup: setup,
	};

	return m;
})(jQuery, SmileMenu || {});

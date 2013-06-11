define(['jquery','buildable','backbone','underscore','_.mixins'],
function(  $    , Buildable , Backbone , undef      , undef    ) {

	/////////////////////////////
	///////// Interactive Box ///
	/////////////////////////////

	// this is just a generalization object used to build dropdown and expandable boxes
	var Interactive = Object.create(Buildable);

	Interactive.extend(Backbone.Events, {
		defaults: {
			animateOptions: {
				duration: 170,
			},
			interaction: 'hover',
		},

		init: function(data) {

			data = _.extend({}, this.defaults, data);

			_.interface({
				id: 'Interactive',
				obj: data,
				typeofs: {
					$li: 'object',
					axis: 'string',
					animateOptions: 'object',
					interaction: 'string',
				}
			});

			_.bindAll(this);

			this.$li = data.$li;

			// options
			this.animateOptions = data.animateOptions;
			this.interaction = data.interaction;

			// metadata
			this.axis = data.axis;

			// build
			this._build();
		},

		_build: function() {
			this.$ul = this.$li.children('ul');

			// build a wrapping div for the drop
			this.$div = this._buildWrappingDiv();

			// set the opening
			this._setInteraction();

			// set open and closing events
			this._setEvents();
		},

		// sets the manner through which users interact with the box
		_setInteraction: function() {
			// set the opening method
			if (this.interaction === 'hover') {

				this.$li.hover(this._hoveron, this._hoveroff);

			} else if (this.interaction === 'click') {

				this.$li.children('a').click(this._click);
			}
		},

		// sets the internal events of the interactive box
		_setEvents: function() {
			var _this = this;

			this.on('open-end', function() {
				_this.isOpen = true;
			});

			this.on('close-end', function() {
				_this.isOpen = false;
			});
		},

		// event handlers
		_click: function(e) {
			if (this.isOpen) {
				// is open
				this._close(this.animateOptions);
			} else {
				// is closed
				this._open(this.animateOptions);
			}
		},

		_hoveron: function(e) {
			this._open(this.animateOptions);
		},

		_hoveroff: function(e) {
			this._close(this.animateOptions);
		},


		// openeners and closer wrappers
		// basically fire events
		_open: function(options) {
			this.trigger('open-ini');

			var _this = this;
			$.when( this.open(options) )
				.then(function() {
					_this.trigger('open-end');
				});
		},

		_close: function(options) {
			this.trigger('close-ini');

			var _this = this;
			$.when( this.close(options) )
				.then(function() {
					_this.trigger('close-end');
				});
		},

		//// NO OP /////
		// must be filled by the interactive boxes
		_buildWrappingDiv: function() {},
		open: function() {},
		close: function() {},
	});


	/////////////////////////////
	///////// Dropdown //////////
	/////////////////////////////

	var Dropdown = Object.create(Interactive);

	Dropdown.extend({
		_buildWrappingDiv: function() {
			var $div = $('<div class="dropdowndiv"></div>')
					.append(this.$ul)
					.height(0);

			if (this.axis === 'x') {
				$div.width(this.$li.width())
			} else {
				$div.css({
						position: 'absolute',
						top: this.$li.position().top,
						left: this.$li.position().left + this.$li.width()
					});
			}

			return $div.appendTo(this.$li);
		},
		///////////////////
		/////// API ///////
		///////////////////
		open: function(options) {
			return this.$div
				.css({
					top: this.$li.position().top,
					left: this.$li.position().left + this.$li.width()
				})
				.stop()
				.animate({
					height: this.$ul.height(),
					opacity: 1,
				}, options);
		},

		close: function(options) {
			return this.$div
				.stop()
				.animate({
					height: 0,
					opacity: 0,
				}, options);
		},
	});

	var Expandable = Object.create(Interactive);
	Expandable.extend({
		_buildWrappingDiv: function() {
			var $div = $('<div class="expandablediv"></div>')
					.append(this.$ul)

			if (this.axis === 'x') {
				$div.css({
						position: 'absolute',
						top: this.$li.position().top,
						left: this.$li.position().left + this.$li.width()
					})
					.addClass('horizontal')
					.width(0)
					.height(this.$li.height());
			} else {
				$div.height(0)
			}

			return $div.appendTo(this.$li);
		},

		///////////////////
		/////// API ///////
		///////////////////
		open: function(options) {
			var animation = { opacity: 1 };

			if (this.axis === 'x') {
				animation.width = this.$ul.width() || 400;
			} else {
				animation.height = this.$ul.height();
			}

			return this.$div
				.stop()
				.animate(animation, options);
		},

		close: function(options) {
			var animation = { opacity: 0 };

			if (this.axis === 'x') {
				animation.width = 0;
			} else {
				animation.height = 0;
			}

			return this.$div
				.stop()
				.animate(animation, options);
		},
	});





	////////////////////////
	///////// Nav //////////
	////////////////////////

	var Nav = Object.create(Buildable);

	Nav.extend(Backbone.Events, {
		defaults: {
			expandableInteraction: 'hover',
			dropdownInteraction: 'hover',
		},

		init: function(data) {
			data = _.defaults(data, this.defaults);

			_.interface({
				id: 'Nav init',
				obj: data,
				typeofs: {
					$ul: 'object',
				}
			});

			_.bindAll(this);

			this.options = data;

			this.$ul = data.$ul;

			this.axis = data.$ul.hasClass('horizontal') ? 'x' : 'y';

			// objects
			this.$buttons = {};
			this.dropdowns = {};
			this.expandables = {};

			this.router = data.router;

			this._build();
		},

		_build: function() {

			this._buildButtons();
			this._buildDropdowns();
			this._buildExpandables();

			if (this.router) {
				
			}
		},

		_buildButtons: function() {
			// find ALL buttons including those within the expandable and dropdowns
			this.$buttons = this.$ul.find('a');

			console.log(this.$buttons)

			this.$buttons
				.on('click',this._click)
				.hover(this._hoveron, this._hoveroff);
		},

		_buildDropdowns: function() {
			var _this = this,
				$drops = this.$ul.children('li.dropdown');

			// build the dropdowns
			_.each($drops, function(li, index) {

				var $li = $(li),
					id = $li.prop('id') || index;

				_this.dropdowns[ id ] = Dropdown.build({
					$li: $li,
					axis: _this.axis,
					interaction: _this.options.dropdownInteraction
				});
			});
		},

		_buildExpandables: function() {
			var _this = this,
				$expands = this.$ul.children('li.expandable');

			// build expandables
			_.each($expands, function(li, index) {

				var $li = $(li),
					id = $li.prop('id') || index;

				_this.expandables[ id ] = Expandable.build({
					$li: $li,
					axis: _this.axis,
					interaction: _this.options.expandableInteraction
				});
			});
		},

		_click: function(e) {
			var $target = $(e.target),
				id = $target.prop('id') || $target.prop('href');


			console.log('click:' + id);

			this.trigger('click', e, $target);

			this.trigger('click:' + id, e, $target);

			// cancel default behaviour
			e.preventDefault();
		},

		_hoveron: function(e) {
			var $target = $(e.target),
				id = $target.prop('id');

			this.trigger('hover-on', e, $target);
			this.trigger('hover-on:' + id, e, $target);
		},

		_hoveroff: function(e) {
			var $target = $(e.target),
				id = $target.prop('id');

			this.trigger('hover-off', e, $target);
		},

		///////////////
		///// API /////
		///////////////
		// use .on method !!!
		/* events triggered:
			- click
			- click:%id
			- hover-on:%id
			- hover-off:%id
		*/

		// programmaticaly activate a click
		click: function(selector) {
			return this.$buttons.filter(selector).trigger('click')
		},
	});

	// define a jquery plugin behaviour
	$.fn.Nav = function(options) {
		options = options || {};
		options.$ul = this;

		return $(this).data('Nav', Nav.build(options) );
	};

	return Nav;

});
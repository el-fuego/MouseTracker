/**
 * @author Knyazevich Denis, Pulyaev Yuriy
 * logging
 */
var _log = function () {

	if (window.DEBUG && window.console && window.console.info) {
		var i = 0;
		for (i = 0; i < arguments.length; i++) {
			window.console.info(arguments[i]);
		}
	}
};

/**
 * Можно использовать для отладки в браузерах, которые не поддерживают console
 * @type {Object}
 */
var DOMLogger = {
	_options: {
		consoleBlockId: "domLogger",
		height: "100px"
	},

	log: function () {
		var canvas = document.createElement('div');
		var consoleBlock = document.getElementById(this._options.consoleBlockId);
		var i;
		var len = arguments.length;

		if (!consoleBlock) {
			document.body.insertBefore(this._buildConsoleBlock(), document.body.firstChild);
			consoleBlock = document.getElementById(this._options.consoleBlockId);
		}

		canvas.innerHTML = consoleBlock.innerHTML;

		for (i = 0; i < len; i++) {
			canvas.innerHTML += arguments[i] + " ";
		}

		consoleBlock.innerHTML = canvas.innerHTML + "<br>";
	},

	_buildConsoleBlock: function () {
		var block = document.createElement('div');
		block.setAttribute('id', this._options.consoleBlockId);
		block.style.height = this._options.height;
		block.style.overflow = "scroll";
		block.style.backgroundColor = "#ffffff";

		return block;
	}
};

/**
 * Функция логирования ошибок.
 *  Если выключен режим отладки, функция ничего не выведет.
 *  Если послетним аргументом указан флаг === true, то логирование будет выполняться даже при
 *  отключенном режиме отладки
 */
var _error = function () {
	var i = 0;

	if (!window.DEBUG && arguments[arguments.length - 1] !== true) {
		return;
	}

	if (window.console && window.console.debug) {
		for (i = 0; i < arguments.length; i++) {
			window.console.debug(arguments[i]);
		}
	} else if (typeof window.Error === 'function') {
		for (i = 0; i < arguments.length; i++) {
			new Error(arguments[i]);
		}
	}
};

/**
 * set DEBUG true on test servers or DEBUG in location
 * @type {Boolean}
 */
window.DEBUG = ((/(^localhost|^10\.|\.loc)/).test(document.location.host) || (/DEBUG/).test(document.location.href));

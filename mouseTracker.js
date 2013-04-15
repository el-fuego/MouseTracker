window.MouseTracker = function (options) {

	$.extend(this.options, options);
	this._calculateQueryData();
}
window.MouseTracker.prototype = {

	options: {
		// Параметры запроса к серверу
		queryData: {
			url: '',
			type: 'post',
			data: {
				// заполняются при инициализации
				cellSize:       null,
				cellsCountPerX: null,
				cellsCountPerY: null
			}
		},
		// Интервал отправки запросов к серверу, ms
		queryInterval:  2000,
		// Размер ячейки, px
		cellSize: 50,
		
		// Функция, выполяемая по наведению на ячейку
		onTrack: function (cell) {}
	},
	
	
	
	/** 
	* Список ячеек и времени находжения в них
	*/
	_cellsIntervals: [],
	
	
	
	/** 
	* Начать отслеживать движения курсора
	*/
	start: function () {
		if (!this._tracker) {
			this._tracker = $.proxy(this._trackMouseMoving, this);
		}
		$(document).mousemove(this._tracker);
		this._interval = window.setInterval($.proxy(this._sendQuery, this), this.options.queryInterval);
		
		window._log('MouseTracker started');
	},
	
	
	
	/** 
	* Остановить отслеживание движения курсора
	*/
	stop: function () {
		if (this._tracker) {
			$(document).off('mousemove', this._tracker);
		}
		if (this._interval) {
			window.clearInterval(this._interval);
		}
		
		window._log('MouseTracker stopped');
	},
	
	
	
	/** 
	* Сохраняет позиции курсора в ячейках
	*/
	_trackMouseMoving: function (event) {
		var cellPosition = this._getCellPosition(event.pageX, event.pageY);
		
		// получим последнюю задействованную ячейку
		var lastCell;
		if(this._cellsIntervals.length) {
			lastCell = this._cellsIntervals[this._cellsIntervals.length - 1];
		}
		
		// выбрана та же ячейка - проставим ей время сведения курсора
		if (lastCell && lastCell.x === cellPosition.x && lastCell.y === cellPosition.y) {
			lastCell.outAt = (new Date()).valueOf();
		} else {
		
			// новая ячейка
			this._cellsIntervals.push({
				x: cellPosition.x,
				y: cellPosition.y,
				// для ускорения храним милисекунды
				overAt: (new Date()).valueOf(),
				outAt:  (new Date()).valueOf(),
			});
		}
		
		window._log(this._cellsIntervals[this._cellsIntervals.length - 1]);
		
		this.options.onTrack(this._cellsIntervals[this._cellsIntervals.length - 1]);
	},
	
	
	
	/** 
	* Позиция яцейки по координатам
	* @param x {Integer} px
	* @param y {Integer} px
	* @return {Object} {
	* 	x: 1,
	* 	y: 2
	* }
	*/
	_getCellPosition: function (x, y) {
		return {
			// целочисленное деление
			x: x / this.options.cellSize >> 0,
			y: y / this.options.cellSize >> 0
		}
	},
	
	
	
	/** 
	* Подсчитывает парамеры, необходимые в каждом из запросов к серверу
	*/
	_calculateQueryData: function () {
		var lastCellPosition = this._getCellPosition($(document).width(), $(document).height());
	
		$.extend(this.options.queryData.data, {
			cellSize:       this.options.cellSize,
			cellsCountPerX: lastCellPosition.x + 1,
			cellsCountPerY: lastCellPosition.y + 1
		});
	},
	
	
	
	/** 
	* Отправляет запрос к серверу
	* и очищает _cellsIntervals
	* данные запроса:
		cellSize: 100,
		cellsCountPerX: 12,
		cellsCountPerY: 8,
		createdAt: "2013-04-15T15:20:35Z",
		cellsIntervals: [
			{
				x: 12,
				y: 2,
				overAt: "2013-04-15T15:20:35Z",
				outAt:  "2013-04-15T15:20:35Z"
			},
			{
				x: 10,
				y: 2,
				overAt: "2013-04-15T15:20:35Z",
				outAt:  "2013-04-15T15:20:35Z"
			}
		]
	*/
	_sendQuery: function () {
		var queryData = $.extend(true, {}, this.options.queryData, {
			data: {
				createdAt:      (new iDate('now')).timestamp(),
				cellsIntervals: JSON.stringify($.map(this._cellsIntervals, function (cell) {
					return {
						x: cell.x,
						y: cell.y,
						overAt: (new iDate(cell.overAt)).timestamp(),
						outAt:  (new iDate(cell.outAt)).timestamp(),
					}
				}))
			}
		});
		$.ajax(queryData);
		
		this._cellsIntervals = [];
		window._log('MouseTracker data was sent', queryData);
	}
};
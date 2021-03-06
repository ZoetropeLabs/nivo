'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var memoize = _interopDefault(require('lodash/memoize'));
var isDate = _interopDefault(require('lodash/isDate'));
var range = _interopDefault(require('lodash/range'));
var max = _interopDefault(require('lodash/max'));
var assign = _interopDefault(require('lodash/assign'));
var d3TimeFormat = require('d3-time-format');
var d3Time = require('d3-time');
var PropTypes = _interopDefault(require('prop-types'));
var core = require('@nivo/core');
var legends = require('@nivo/legends');
var React = _interopDefault(require('react'));
var compose = _interopDefault(require('recompose/compose'));
var withPropsOnChange = _interopDefault(require('recompose/withPropsOnChange'));
var pure = _interopDefault(require('recompose/pure'));
var defaultProps = _interopDefault(require('recompose/defaultProps'));
var minBy = _interopDefault(require('lodash/minBy'));
var maxBy = _interopDefault(require('lodash/maxBy'));
var d3Scale = require('d3-scale');

var DIRECTION_HORIZONTAL = 'horizontal';
var DIRECTION_VERTICAL = 'vertical';

/**
 * Compute day cell size according to current context.
 *
 * @param {number} width
 * @param {number} height
 * @param {number} direction
 * @param {array}  yearRange
 * @param {number} yearSpacing
 * @param {number} daySpacing
 * @param {number} maxWeeks
 * @returns {number}
 */
var computeCellSize = function computeCellSize(_ref) {
    var width = _ref.width,
        height = _ref.height,
        direction = _ref.direction,
        yearRange = _ref.yearRange,
        yearSpacing = _ref.yearSpacing,
        daySpacing = _ref.daySpacing,
        maxWeeks = _ref.maxWeeks;

    var hCellSize = void 0;
    var vCellSize = void 0;

    if (direction === DIRECTION_HORIZONTAL) {
        hCellSize = (width - daySpacing * maxWeeks) / maxWeeks;
        vCellSize = (height - (yearRange.length - 1) * yearSpacing - yearRange.length * (8 * daySpacing)) / (yearRange.length * 7);
    } else {
        hCellSize = (width - (yearRange.length - 1) * yearSpacing - yearRange.length * (8 * daySpacing)) / (yearRange.length * 7);
        vCellSize = (height - daySpacing * maxWeeks) / maxWeeks;
    }

    return Math.min(hCellSize, vCellSize);
};

/**
 * Computes month path and bounding box.
 *
 * @param {Date}   date
 * @param {number} cellSize
 * @param {number} yearIndex
 * @param {number} yearSpacing
 * @param {number} daySpacing
 * @param {string} direction
 * @returns { { path: string, bbox: { x: number, y: number, width: number, height: number } } }
 */
var monthPathAndBBox = function monthPathAndBBox(_ref2) {
    var date = _ref2.date,
        cellSize = _ref2.cellSize,
        yearIndex = _ref2.yearIndex,
        yearSpacing = _ref2.yearSpacing,
        daySpacing = _ref2.daySpacing,
        direction = _ref2.direction;

    var t1 = new Date(date.getFullYear(), date.getMonth() + 1, 0); // first day of next month
    var d0 = date.getDay(); // first day of month
    var w0 = d3Time.timeWeek.count(d3Time.timeYear(date), date); // first week of month
    var d1 = t1.getDay(); // last day of month
    var w1 = d3Time.timeWeek.count(d3Time.timeYear(t1), t1); // last week of month

    // offset according to year index
    var xO = 0;
    var yO = 0;
    var yearOffset = yearIndex * (7 * (cellSize + daySpacing) + yearSpacing);
    if (direction === DIRECTION_HORIZONTAL) {
        yO = yearOffset;
    } else {
        xO = yearOffset;
    }

    var path = void 0;
    var bbox = { x: xO, y: yO, width: 0, height: 0 };
    if (direction === DIRECTION_HORIZONTAL) {
        path = ['M' + (xO + (w0 + 1) * (cellSize + daySpacing)) + ',' + (yO + d0 * (cellSize + daySpacing)), 'H' + (xO + w0 * (cellSize + daySpacing)) + 'V' + (yO + 7 * (cellSize + daySpacing)), 'H' + (xO + w1 * (cellSize + daySpacing)) + 'V' + (yO + (d1 + 1) * (cellSize + daySpacing)), 'H' + (xO + (w1 + 1) * (cellSize + daySpacing)) + 'V' + yO, 'H' + (xO + (w0 + 1) * (cellSize + daySpacing)) + 'Z'].join('');

        bbox.x = xO + w0 * (cellSize + daySpacing);
        bbox.width = (w1 + 1) * (cellSize + daySpacing) - bbox.x;
        bbox.height = 7 * (cellSize + daySpacing);
    } else {
        path = ['M' + (xO + d0 * (cellSize + daySpacing)) + ',' + (yO + (w0 + 1) * (cellSize + daySpacing)), 'H' + xO + 'V' + (yO + (w1 + 1) * (cellSize + daySpacing)), 'H' + (xO + (d1 + 1) * (cellSize + daySpacing)) + 'V' + (yO + w1 * (cellSize + daySpacing)), 'H' + (xO + 7 * (cellSize + daySpacing)) + 'V' + (yO + w0 * (cellSize + daySpacing)), 'H' + (xO + d0 * (cellSize + daySpacing)) + 'Z'].join('');

        bbox.y = yO + w0 * (cellSize + daySpacing);
        bbox.width = 7 * (cellSize + daySpacing);
        bbox.height = (w1 + 1) * (cellSize + daySpacing) - bbox.y;
    }

    return { path: path, bbox: bbox };
};

/**
 * Creates a memoized version of monthPathAndBBox function.
 */
var memoMonthPathAndBBox = memoize(monthPathAndBBox, function (_ref3) {
    var date = _ref3.date,
        cellSize = _ref3.cellSize,
        yearIndex = _ref3.yearIndex,
        yearSpacing = _ref3.yearSpacing,
        daySpacing = _ref3.daySpacing,
        direction = _ref3.direction;

    return date.toString() + '.' + cellSize + '.' + yearIndex + '.' + yearSpacing + '.' + daySpacing + '.' + direction;
});

/**
 * Returns a function to Compute day cell position for horizontal layout.
 *
 * @param {number} cellSize
 * @param {number} yearSpacing
 * @param {number} daySpacing
 * @returns { function(): { x: number, y: number } }
 */
var cellPositionHorizontal = function cellPositionHorizontal(cellSize, yearSpacing, daySpacing) {
    return function (d, yearIndex) {
        var weekOfYear = d3Time.timeWeek.count(d3Time.timeYear(d), d);

        return {
            x: weekOfYear * (cellSize + daySpacing) + daySpacing / 2,
            y: d.getDay() * (cellSize + daySpacing) + daySpacing / 2 + yearIndex * (yearSpacing + 7 * (cellSize + daySpacing))
        };
    };
};

/**
 * Returns a function to Compute day cell position for vertical layout.
 *
 * @param {number} cellSize
 * @param {number} yearSpacing
 * @param {number} daySpacing
 * @returns { function(): { x: number, y: number } }
 */
var cellPositionVertical = function cellPositionVertical(cellSize, yearSpacing, daySpacing) {
    return function (d, yearIndex) {
        var weekOfYear = d3Time.timeWeek.count(d3Time.timeYear(d), d);

        return {
            x: d.getDay() * (cellSize + daySpacing) + daySpacing / 2 + yearIndex * (yearSpacing + 7 * (cellSize + daySpacing)),
            y: weekOfYear * (cellSize + daySpacing) + daySpacing / 2
        };
    };
};

// used for days range and data matching
var dayFormat = d3TimeFormat.timeFormat('%Y-%m-%d');

/**
 * This layout is responsible for computing Calendar chart data/positions….
 * It's used for all Calendar related chart components.
 *
 * @param {number}      width
 * @param {number}      height
 * @param {string|Date} from
 * @param {string|Date} to
 * @param {array}       data
 * @param {string}      direction
 * @param {object}      colorScale
 * @param {string}      emptyColor
 * @param {number}      yearSpacing
 * @param {number}      daySpacing
 * @returns {object}
 */
var CalendarLayout = function CalendarLayout(_ref4) {
    var width = _ref4.width,
        height = _ref4.height,
        from = _ref4.from,
        to = _ref4.to,
        data = _ref4.data,
        direction = _ref4.direction,
        colorScale = _ref4.colorScale,
        emptyColor = _ref4.emptyColor,
        yearSpacing = _ref4.yearSpacing,
        daySpacing = _ref4.daySpacing;

    // time related data
    var fromDate = isDate(from) ? from : new Date(from);
    var toDate = isDate(to) ? to : new Date(to);

    var yearRange = range(fromDate.getFullYear(), toDate.getFullYear() + 1);
    var maxWeeks = max(yearRange.map(function (year) {
        return d3Time.timeWeeks(new Date(year, 0, 1), new Date(year + 1, 0, 1)).length;
    })) + 1;

    // ——————————————————————————————————————————————————————————————————————————————————————————————————————
    // Computes years/months/days
    // ——————————————————————————————————————————————————————————————————————————————————————————————————————
    // compute cellSize
    var cellSize = computeCellSize({
        width: width,
        height: height,
        direction: direction,
        yearRange: yearRange,
        yearSpacing: yearSpacing,
        daySpacing: daySpacing,
        maxWeeks: maxWeeks
    });

    // determine day cells positioning function according to layout direction
    var cellPosition = void 0;
    if (direction === DIRECTION_HORIZONTAL) {
        cellPosition = cellPositionHorizontal(cellSize, yearSpacing, daySpacing);
    } else {
        cellPosition = cellPositionVertical(cellSize, yearSpacing, daySpacing);
    }

    var years = [];
    var months = [];
    var days = [];

    yearRange.forEach(function (year, i) {
        var yearStart = new Date(year, 0, 1);
        var yearEnd = new Date(year + 1, 0, 1);

        days = days.concat(d3Time.timeDays(yearStart, yearEnd).map(function (dayDate) {
            return assign({
                date: dayDate,
                day: dayFormat(dayDate),
                size: cellSize
            }, cellPosition(dayDate, i));
        }));

        var yearMonths = d3Time.timeMonths(yearStart, yearEnd).map(function (monthDate) {
            return assign({ date: monthDate }, memoMonthPathAndBBox({
                date: monthDate,
                direction: direction,
                yearIndex: i,
                yearSpacing: yearSpacing,
                daySpacing: daySpacing,
                cellSize: cellSize
            }));
        });

        months = months.concat(yearMonths);

        years.push({
            year: year,
            bbox: {
                x: yearMonths[0].bbox.x,
                y: yearMonths[0].bbox.y,
                width: yearMonths[11].bbox.x - yearMonths[0].bbox.x + yearMonths[11].bbox.width,
                height: yearMonths[11].bbox.y - yearMonths[0].bbox.y + yearMonths[11].bbox.height
            }
        });
    });

    // ——————————————————————————————————————————————————————————————————————————————————————————————————————
    // Computes days/data intersection
    // ——————————————————————————————————————————————————————————————————————————————————————————————————————
    //const color = scalePropToD3Scale(colorScale)

    days.forEach(function (day) {
        day.color = emptyColor;
        data.forEach(function (dataDay) {
            if (dataDay.day === day.day) {
                day.value = dataDay.value;
                day.color = colorScale(dataDay.value);
            }
        });
    });

    return { years: years, months: months, days: days, cellSize: cellSize };
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Calendar components propTypes.
 *
 * @type {object}
 */
var CalendarPropTypes = {
    from: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        day: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired
    })).isRequired,

    domain: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.arrayOf(PropTypes.number)]).isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    colorScale: PropTypes.func.isRequired,

    onDayClick: PropTypes.func.isRequired,
    direction: PropTypes.oneOf([DIRECTION_HORIZONTAL, DIRECTION_VERTICAL]),
    emptyColor: PropTypes.string.isRequired,

    // years
    yearSpacing: PropTypes.number.isRequired,
    yearLegendOffset: PropTypes.number.isRequired,

    // months
    monthBorderWidth: PropTypes.number.isRequired,
    monthBorderColor: PropTypes.string.isRequired,
    monthLegendOffset: PropTypes.number.isRequired,

    // days
    daySpacing: PropTypes.number.isRequired,
    dayBorderWidth: PropTypes.number.isRequired,
    dayBorderColor: PropTypes.string.isRequired,

    // interactivity
    isInteractive: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    tooltipFormat: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),

    legends: PropTypes.arrayOf(PropTypes.shape(_extends({}, legends.LegendPropShape, {
        itemCount: PropTypes.number
    }))).isRequired

    /**
     * Calendar components defaultProps.
     *
     * @type {object}
     */
};var CalendarDefaultProps = {
    domain: 'auto',
    colors: ['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560'],

    direction: DIRECTION_HORIZONTAL,
    onDayClick: function onDayClick() {},
    emptyColor: '#fff',

    // years
    yearSpacing: 30,
    yearLegendOffset: 10,

    // months
    monthBorderWidth: 2,
    monthBorderColor: '#000',
    monthLegendOffset: 6,

    // days
    daySpacing: 0,
    dayBorderWidth: 1,
    dayBorderColor: '#000',

    // interactivity
    isInteractive: true,
    onClick: core.noop,

    legends: []
};

var CalendarDay = function CalendarDay(_ref) {
    var x = _ref.x,
        y = _ref.y,
        size = _ref.size,
        color = _ref.color,
        borderWidth = _ref.borderWidth,
        borderColor = _ref.borderColor,
        onClick = _ref.onClick,
        showTooltip = _ref.showTooltip,
        hideTooltip = _ref.hideTooltip;
    return React.createElement('rect', {
        x: x,
        y: y,
        width: size,
        height: size,
        style: {
            fill: color,
            strokeWidth: borderWidth,
            stroke: borderColor
        },
        onClick: onClick,
        onMouseEnter: showTooltip,
        onMouseMove: showTooltip,
        onMouseLeave: hideTooltip
    });
};

CalendarDay.propTypes = {
    onClick: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    borderWidth: PropTypes.number.isRequired,
    borderColor: PropTypes.string.isRequired,

    tooltipFormat: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    showTooltip: PropTypes.func.isRequired,
    hideTooltip: PropTypes.func.isRequired,

    theme: PropTypes.shape({
        tooltip: PropTypes.shape({}).isRequired
    }).isRequired
};

var enhance = compose(withPropsOnChange(['data', 'onClick'], function (_ref2) {
    var data = _ref2.data,
        _onClick = _ref2.onClick;
    return {
        onClick: function onClick(event) {
            return _onClick(data, event);
        }
    };
}), withPropsOnChange(['data', 'color', 'showTooltip', 'theme', 'tooltipFormat'], function (_ref3) {
    var data = _ref3.data,
        color = _ref3.color,
        _showTooltip = _ref3.showTooltip,
        theme = _ref3.theme,
        tooltipFormat = _ref3.tooltipFormat;

    if (data.value === undefined) return { showTooltip: core.noop };

    return {
        showTooltip: function showTooltip(event) {
            return _showTooltip(React.createElement(core.BasicTooltip, {
                id: '' + data.day,
                value: data.value,
                enableChip: true,
                color: color,
                theme: theme,
                format: tooltipFormat
            }), event);
        }
    };
}), pure);

var CalendarDay$1 = enhance(CalendarDay);

var CalendarMonthPath = function CalendarMonthPath(_ref) {
    var path = _ref.path,
        borderWidth = _ref.borderWidth,
        borderColor = _ref.borderColor;
    return React.createElement('path', {
        d: path,
        style: {
            fill: 'none',
            strokeWidth: borderWidth,
            stroke: borderColor
        }
    });
};

CalendarMonthPath.propTypes = {
    path: PropTypes.string.isRequired,
    borderWidth: PropTypes.number.isRequired,
    borderColor: PropTypes.string.isRequired
};

var CalendarMonthPath$1 = pure(CalendarMonthPath);

var enhance$1 = (function (Component) {
    return compose(defaultProps(CalendarDefaultProps), core.withTheme(), core.withDimensions(), withPropsOnChange(['data', 'domain', 'colors'], function (_ref) {
        var data = _ref.data,
            domain = _ref.domain,
            colors = _ref.colors;

        var colorDomain = void 0;
        if (domain === 'auto') {
            colorDomain = [minBy(data, 'value').value, maxBy(data, 'value').value];
        } else {
            colorDomain = [].concat(domain);
        }

        var colorScale = d3Scale.scaleQuantize().domain(colorDomain).range(colors);

        return { colorScale: colorScale };
    }), pure)(Component);
});

var monthLegendFormat = d3TimeFormat.timeFormat('%b');

var Calendar = function Calendar(_ref) {
    var data = _ref.data,
        from = _ref.from,
        to = _ref.to,
        colorScale = _ref.colorScale,
        margin = _ref.margin,
        width = _ref.width,
        height = _ref.height,
        outerWidth = _ref.outerWidth,
        outerHeight = _ref.outerHeight,
        direction = _ref.direction,
        emptyColor = _ref.emptyColor,
        yearSpacing = _ref.yearSpacing,
        yearLegendOffset = _ref.yearLegendOffset,
        daySpacing = _ref.daySpacing,
        dayBorderWidth = _ref.dayBorderWidth,
        dayBorderColor = _ref.dayBorderColor,
        monthBorderWidth = _ref.monthBorderWidth,
        monthBorderColor = _ref.monthBorderColor,
        monthLegendOffset = _ref.monthLegendOffset,
        theme = _ref.theme,
        isInteractive = _ref.isInteractive,
        tooltipFormat = _ref.tooltipFormat,
        onClick = _ref.onClick,
        legends$$1 = _ref.legends;

    var _computeCalendar = CalendarLayout({
        width: width,
        height: height,
        from: from,
        to: to,
        data: data,
        direction: direction,
        colorScale: colorScale,
        emptyColor: emptyColor,
        yearSpacing: yearSpacing,
        daySpacing: daySpacing
    }),
        years = _computeCalendar.years,
        months = _computeCalendar.months,
        days = _computeCalendar.days;

    return React.createElement(
        core.Container,
        { isInteractive: isInteractive, theme: theme },
        function (_ref2) {
            var showTooltip = _ref2.showTooltip,
                hideTooltip = _ref2.hideTooltip;
            return React.createElement(
                core.SvgWrapper,
                { width: outerWidth, height: outerHeight, margin: margin },
                days.map(function (d) {
                    return React.createElement(CalendarDay$1, {
                        key: d.date.toString(),
                        data: d,
                        x: d.x,
                        y: d.y,
                        size: d.size,
                        color: d.color,
                        borderWidth: dayBorderWidth,
                        borderColor: dayBorderColor,
                        showTooltip: showTooltip,
                        hideTooltip: hideTooltip,
                        tooltipFormat: tooltipFormat,
                        theme: theme,
                        onClick: onClick
                    });
                }),
                months.map(function (m) {
                    return React.createElement(CalendarMonthPath$1, {
                        key: m.date.toString(),
                        path: m.path,
                        borderWidth: monthBorderWidth,
                        borderColor: monthBorderColor
                    });
                }),
                months.map(function (month) {
                    var transform = void 0;
                    if (direction === DIRECTION_HORIZONTAL) {
                        transform = 'translate(' + (month.bbox.x + month.bbox.width / 2) + ',' + (month.bbox.y - monthLegendOffset) + ')';
                    } else {
                        transform = 'translate(' + (month.bbox.x - monthLegendOffset) + ',' + (month.bbox.y + month.bbox.height / 2) + ') rotate(-90)';
                    }

                    return React.createElement(
                        'text',
                        {
                            key: month.date.toString() + '.legend',
                            className: 'nivo_calendar_month_legend',
                            transform: transform,
                            textAnchor: 'middle'
                        },
                        monthLegendFormat(month.date)
                    );
                }),
                years.map(function (year) {
                    var transform = void 0;
                    if (direction === DIRECTION_HORIZONTAL) {
                        transform = 'translate(' + (year.bbox.x - yearLegendOffset) + ',' + (year.bbox.y + year.bbox.height / 2) + ') rotate(-90)';
                    } else {
                        transform = 'translate(' + (year.bbox.x + year.bbox.width / 2) + ',' + (year.bbox.y - yearLegendOffset) + ')';
                    }

                    return React.createElement(
                        'text',
                        {
                            key: year.year,
                            className: 'nivo_calendar_year_legend',
                            transform: transform,
                            textAnchor: 'middle'
                        },
                        year.year
                    );
                }),
                legends$$1.map(function (legend, i) {
                    var legendData = colorScale.ticks(legend.itemCount).map(function (value) {
                        return {
                            label: value,
                            fill: colorScale(value)
                        };
                    });

                    return React.createElement(legends.BoxLegendSvg, _extends({
                        key: i
                    }, legend, {
                        containerWidth: width,
                        containerHeight: height,
                        data: legendData
                    }));
                })
            );
        }
    );
};

Calendar.propTypes = CalendarPropTypes;

var Calendar$1 = enhance$1(Calendar);

var ResponsiveCalendar = function ResponsiveCalendar(props) {
    return React.createElement(
        core.ResponsiveWrapper,
        null,
        function (_ref) {
            var width = _ref.width,
                height = _ref.height;
            return React.createElement(Calendar$1, _extends({ width: width, height: height }, props));
        }
    );
};

exports.Calendar = Calendar$1;
exports.ResponsiveCalendar = ResponsiveCalendar;
exports.CalendarPropTypes = CalendarPropTypes;
exports.CalendarDefaultProps = CalendarDefaultProps;

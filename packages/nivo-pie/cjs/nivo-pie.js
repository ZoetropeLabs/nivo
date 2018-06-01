'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var PropTypes = _interopDefault(require('prop-types'));
var compose = _interopDefault(require('recompose/compose'));
var withPropsOnChange = _interopDefault(require('recompose/withPropsOnChange'));
var pure = _interopDefault(require('recompose/pure'));
var core = require('@nivo/core');
var reactMotion = require('react-motion');
var d3Shape = require('d3-shape');
require('lodash/merge');
var legends = require('@nivo/legends');
var defaultProps = _interopDefault(require('recompose/defaultProps'));

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
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



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var PieSlice = function PieSlice(_ref) {
    var data = _ref.data,
        path = _ref.path,
        color = _ref.color,
        fill = _ref.fill,
        borderWidth = _ref.borderWidth,
        borderColor = _ref.borderColor,
        showTooltip = _ref.showTooltip,
        hideTooltip = _ref.hideTooltip,
        onClick = _ref.onClick,
        tooltipFormat = _ref.tooltipFormat,
        tooltip = _ref.tooltip,
        theme = _ref.theme;

    var handleTooltip = function handleTooltip(e) {
        return showTooltip(React__default.createElement(core.BasicTooltip, {
            id: data.label,
            value: data.value,
            enableChip: true,
            color: color,
            theme: theme,
            format: tooltipFormat,
            renderContent: typeof tooltip === 'function' ? tooltip.bind(null, _extends({ color: color }, data)) : null
        }), e);
    };

    return React__default.createElement('path', {
        key: data.id,
        d: path,
        fill: fill,
        strokeWidth: borderWidth,
        stroke: borderColor,
        onMouseEnter: handleTooltip,
        onMouseMove: handleTooltip,
        onMouseLeave: hideTooltip,
        onClick: onClick
    });
};

PieSlice.propTypes = {
    data: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        value: PropTypes.number.isRequired
    }).isRequired,

    path: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    fill: PropTypes.string.isRequired,
    borderWidth: PropTypes.number.isRequired,
    borderColor: PropTypes.string.isRequired,

    tooltipFormat: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    tooltip: PropTypes.func,
    showTooltip: PropTypes.func.isRequired,
    hideTooltip: PropTypes.func.isRequired,
    onClick: PropTypes.func,

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
}), pure);

var PieSlice$1 = enhance(PieSlice);

var lineGenerator = d3Shape.line().x(function (d) {
    return d.x;
}).y(function (d) {
    return d.y;
});

var PieRadialLabels = function (_Component) {
    inherits(PieRadialLabels, _Component);

    function PieRadialLabels() {
        classCallCheck(this, PieRadialLabels);
        return possibleConstructorReturn(this, _Component.apply(this, arguments));
    }

    PieRadialLabels.prototype.render = function render() {
        var _props = this.props,
            data = _props.data,
            label = _props.label,
            radius = _props.radius,
            skipAngle = _props.skipAngle,
            linkOffset = _props.linkOffset,
            linkDiagonalLength = _props.linkDiagonalLength,
            linkHorizontalLength = _props.linkHorizontalLength,
            linkStrokeWidth = _props.linkStrokeWidth,
            textXOffset = _props.textXOffset,
            textColor = _props.textColor,
            linkColor = _props.linkColor,
            theme = _props.theme;


        return React__default.createElement(
            'g',
            null,
            data.filter(function (d) {
                return skipAngle === 0 || d.angleDegrees > skipAngle;
            }).map(function (d) {
                var angle = core.midAngle(d) - Math.PI / 2;
                var positionA = core.positionFromAngle(angle, radius + linkOffset);
                var positionB = core.positionFromAngle(angle, radius + linkOffset + linkDiagonalLength);
                var positionC = void 0;
                var labelPosition = void 0;
                var textAnchor = void 0;
                if (angle + Math.PI / 2 < Math.PI) {
                    positionC = { x: positionB.x + linkHorizontalLength, y: positionB.y };
                    labelPosition = {
                        x: positionB.x + linkHorizontalLength + textXOffset,
                        y: positionB.y
                    };
                    textAnchor = 'start';
                } else {
                    positionC = { x: positionB.x - linkHorizontalLength, y: positionB.y };
                    labelPosition = {
                        x: positionB.x - linkHorizontalLength - textXOffset,
                        y: positionB.y
                    };
                    textAnchor = 'end';
                }

                return React__default.createElement(
                    'g',
                    { key: d.data.id },
                    React__default.createElement('path', {
                        d: lineGenerator([positionA, positionB, positionC]),
                        fill: 'none',
                        style: { fill: 'none', stroke: linkColor(d.data, theme) },
                        strokeWidth: linkStrokeWidth
                    }),
                    React__default.createElement(
                        'g',
                        { transform: 'translate(' + labelPosition.x + ', ' + labelPosition.y + ')' },
                        React__default.createElement(
                            'text',
                            {
                                textAnchor: textAnchor,
                                dy: '0.3em',
                                style: {
                                    fill: textColor(d.data, theme),
                                    fontSize: theme.axis.fontSize
                                }
                            },
                            label(d.data)
                        )
                    )
                );
            })
        );
    };

    return PieRadialLabels;
}(React.Component);

PieRadialLabels.propTypes = {
    label: PropTypes.func.isRequired,
    skipAngle: PropTypes.number.isRequired,
    radius: PropTypes.number.isRequired,
    linkOffset: PropTypes.number.isRequired,
    linkDiagonalLength: PropTypes.number.isRequired,
    linkHorizontalLength: PropTypes.number.isRequired,
    linkStrokeWidth: PropTypes.number.isRequired,
    textXOffset: PropTypes.number.isRequired,
    textColor: PropTypes.func.isRequired,
    linkColor: PropTypes.func.isRequired,
    theme: PropTypes.shape({
        axis: PropTypes.shape({
            tickColor: PropTypes.string.isRequired,
            fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
        }).isRequired
    }).isRequired
};
PieRadialLabels.defaultProps = {
    skipAngle: 0,
    linkOffset: 0,
    linkDiagonalLength: 16,
    linkHorizontalLength: 24,
    linkStrokeWidth: 1,
    textXOffset: 6
};

var sliceStyle = {
    pointerEvents: 'none'
};

var PieSlicesLabels = function (_Component) {
    inherits(PieSlicesLabels, _Component);

    function PieSlicesLabels() {
        classCallCheck(this, PieSlicesLabels);
        return possibleConstructorReturn(this, _Component.apply(this, arguments));
    }

    PieSlicesLabels.prototype.render = function render() {
        var _props = this.props,
            data = _props.data,
            label = _props.label,
            radius = _props.radius,
            skipAngle = _props.skipAngle,
            innerRadius = _props.innerRadius,
            textColor = _props.textColor,
            theme = _props.theme;


        var centerRadius = innerRadius + (radius - innerRadius) / 2;

        return React__default.createElement(
            'g',
            null,
            data.filter(function (d) {
                return skipAngle === 0 || d.angleDegrees > skipAngle;
            }).map(function (d) {
                var angle = core.midAngle(d) - Math.PI / 2;
                var position = core.positionFromAngle(angle, centerRadius);

                return React__default.createElement(
                    'g',
                    {
                        key: d.data.id,
                        transform: 'translate(' + position.x + ', ' + position.y + ')',
                        style: sliceStyle
                    },
                    React__default.createElement(
                        'text',
                        {
                            textAnchor: 'middle',
                            style: {
                                fill: textColor(d.data, theme),
                                fontSize: theme.axis.fontSize
                            }
                        },
                        label(d.data)
                    )
                );
            })
        );
    };

    return PieSlicesLabels;
}(React.Component);

PieSlicesLabels.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    skipAngle: PropTypes.number.isRequired,
    radius: PropTypes.number.isRequired,
    innerRadius: PropTypes.number.isRequired,
    textColor: PropTypes.func.isRequired,
    theme: PropTypes.shape({
        axis: PropTypes.shape({
            textColor: PropTypes.string.isRequired,
            fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
        }).isRequired
    }).isRequired
};
PieSlicesLabels.defaultProps = {
    skipAngle: 0
};

var PiePropTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired
    })).isRequired,

    sortByValue: PropTypes.bool.isRequired,
    innerRadius: PropTypes.number.isRequired,
    padAngle: PropTypes.number.isRequired,
    cornerRadius: PropTypes.number.isRequired,

    // border
    borderWidth: PropTypes.number.isRequired,
    borderColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    // radial labels
    enableRadialLabels: PropTypes.bool.isRequired,
    radialLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    radialLabelsSkipAngle: PropTypes.number,
    radialLabelsTextXOffset: PropTypes.number,
    radialLabelsTextColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    radialLabelsLinkOffset: PropTypes.number,
    radialLabelsLinkDiagonalLength: PropTypes.number,
    radialLabelsLinkHorizontalLength: PropTypes.number,
    radialLabelsLinkStrokeWidth: PropTypes.number,
    radialLabelsLinkColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    // slices labels
    enableSlicesLabels: PropTypes.bool.isRequired,
    sliceLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    slicesLabelsSkipAngle: PropTypes.number,
    slicesLabelsTextColor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    // styling
    defs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired
    })).isRequired,
    fill: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        match: PropTypes.oneOfType([PropTypes.oneOf(['*']), PropTypes.object, PropTypes.func]).isRequired
    })).isRequired,

    // interactivity
    isInteractive: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    tooltipFormat: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    tooltip: PropTypes.func,

    // legends
    legends: PropTypes.arrayOf(PropTypes.shape(legends.LegendPropShape)).isRequired
};

var PieDefaultProps = {
    sortByValue: false,
    innerRadius: 0,
    padAngle: 0,
    cornerRadius: 0,

    // border
    borderWidth: 0,
    borderColor: 'inherit:darker(1)',

    // radial labels
    enableRadialLabels: true,
    radialLabel: 'id',
    radialLabelsTextColor: 'theme',
    radialLabelsLinkColor: 'theme',

    // slices labels
    enableSlicesLabels: true,
    sliceLabel: 'value',
    slicesLabelsTextColor: 'theme',

    // styling
    defs: [],
    fill: [],

    // interactivity
    isInteractive: true,
    onClick: core.noop,

    legends: []
};

var enhance$1 = (function (Component) {
    return compose(defaultProps(PieDefaultProps), core.withTheme(), core.withDimensions(), core.withColors(), pure)(Component);
});

var Pie = function Pie(_ref) {
    var data = _ref.data,
        margin = _ref.margin,
        width = _ref.width,
        height = _ref.height,
        outerWidth = _ref.outerWidth,
        outerHeight = _ref.outerHeight,
        sortByValue = _ref.sortByValue,
        _innerRadius = _ref.innerRadius,
        _padAngle = _ref.padAngle,
        cornerRadius = _ref.cornerRadius,
        borderWidth = _ref.borderWidth,
        _borderColor = _ref.borderColor,
        enableRadialLabels = _ref.enableRadialLabels,
        radialLabel = _ref.radialLabel,
        radialLabelsSkipAngle = _ref.radialLabelsSkipAngle,
        radialLabelsLinkOffset = _ref.radialLabelsLinkOffset,
        radialLabelsLinkDiagonalLength = _ref.radialLabelsLinkDiagonalLength,
        radialLabelsLinkHorizontalLength = _ref.radialLabelsLinkHorizontalLength,
        radialLabelsLinkStrokeWidth = _ref.radialLabelsLinkStrokeWidth,
        radialLabelsTextXOffset = _ref.radialLabelsTextXOffset,
        radialLabelsTextColor = _ref.radialLabelsTextColor,
        radialLabelsLinkColor = _ref.radialLabelsLinkColor,
        enableSlicesLabels = _ref.enableSlicesLabels,
        sliceLabel = _ref.sliceLabel,
        slicesLabelsSkipAngle = _ref.slicesLabelsSkipAngle,
        slicesLabelsTextColor = _ref.slicesLabelsTextColor,
        theme = _ref.theme,
        getColor = _ref.getColor,
        defs = _ref.defs,
        fill = _ref.fill,
        animate = _ref.animate,
        motionStiffness = _ref.motionStiffness,
        motionDamping = _ref.motionDamping,
        isInteractive = _ref.isInteractive,
        onClick = _ref.onClick,
        tooltipFormat = _ref.tooltipFormat,
        tooltip = _ref.tooltip,
        legends$$1 = _ref.legends;

    var centerX = width / 2;
    var centerY = height / 2;

    var padAngle = core.degreesToRadians(_padAngle);

    var borderColor = core.getInheritedColorGenerator(_borderColor);

    var motionProps = {
        animate: animate,
        motionDamping: motionDamping,
        motionStiffness: motionStiffness
    };

    var radialLabelsProps = {
        label: core.getLabelGenerator(radialLabel),
        skipAngle: radialLabelsSkipAngle,
        linkOffset: radialLabelsLinkOffset,
        linkDiagonalLength: radialLabelsLinkDiagonalLength,
        linkHorizontalLength: radialLabelsLinkHorizontalLength,
        linkStrokeWidth: radialLabelsLinkStrokeWidth,
        textXOffset: radialLabelsTextXOffset,
        textColor: core.getInheritedColorGenerator(radialLabelsTextColor, 'labels.textColor'),
        linkColor: core.getInheritedColorGenerator(radialLabelsLinkColor, 'axis.tickColor')
    };

    var slicesLabelsProps = {
        label: core.getLabelGenerator(sliceLabel),
        skipAngle: slicesLabelsSkipAngle,
        textColor: core.getInheritedColorGenerator(slicesLabelsTextColor, 'labels.textColor')
    };

    var radius = Math.min(width, height) / 2;
    var innerRadius = radius * Math.min(_innerRadius, 1);

    var pie = d3Shape.pie();
    pie.value(function (d) {
        return d.value;
    });
    if (sortByValue !== true) pie.sortValues(null);

    var arc = d3Shape.arc();
    arc.outerRadius(radius);

    var enhancedData = data.map(function (d) {
        return _extends({}, d, {
            color: getColor(d)
        });
    });

    var legendData = enhancedData.map(function (d) {
        return {
            label: d.label,
            fill: d.color
        };
    });

    var boundDefs = core.bindDefs(defs, enhancedData, fill);

    return React__default.createElement(
        core.Container,
        { isInteractive: isInteractive, theme: theme },
        function (_ref2) {
            var showTooltip = _ref2.showTooltip,
                hideTooltip = _ref2.hideTooltip;
            return React__default.createElement(
                core.SvgWrapper,
                {
                    width: outerWidth,
                    height: outerHeight,
                    margin: margin,
                    defs: boundDefs
                },
                React__default.createElement(
                    reactMotion.Motion,
                    {
                        style: {
                            centerX: reactMotion.spring(centerX, motionProps),
                            centerY: reactMotion.spring(centerY, motionProps),
                            innerRadius: reactMotion.spring(innerRadius),
                            padAngle: reactMotion.spring(padAngle, motionProps),
                            cornerRadius: reactMotion.spring(cornerRadius, motionProps)
                        }
                    },
                    function (interpolatingStyle) {
                        var interpolatedPie = pie.padAngle(interpolatingStyle.padAngle);
                        var interpolatedArc = arc.cornerRadius(interpolatingStyle.cornerRadius).innerRadius(interpolatingStyle.innerRadius);

                        var arcsData = interpolatedPie(enhancedData).map(function (d) {
                            var angle = d.endAngle - d.startAngle;

                            return _extends({}, d, {
                                angle: angle,
                                angleDegrees: core.radiansToDegrees(angle),
                                data: d.data
                            });
                        });

                        return React__default.createElement(
                            'g',
                            {
                                transform: 'translate(' + interpolatingStyle.centerX + ', ' + interpolatingStyle.centerY + ')'
                            },
                            arcsData.map(function (d) {
                                return React__default.createElement(PieSlice$1, {
                                    key: d.data.id,
                                    data: d.data,
                                    path: interpolatedArc(d),
                                    color: d.data.color,
                                    fill: d.data.fill ? d.data.fill : d.data.color,
                                    borderWidth: borderWidth,
                                    borderColor: borderColor(d.data),
                                    showTooltip: showTooltip,
                                    hideTooltip: hideTooltip,
                                    tooltipFormat: tooltipFormat,
                                    tooltip: tooltip,
                                    theme: theme,
                                    onClick: onClick
                                });
                            }),
                            enableSlicesLabels && React__default.createElement(PieSlicesLabels, _extends({
                                data: arcsData,
                                radius: radius,
                                innerRadius: interpolatingStyle.innerRadius,
                                theme: theme
                            }, slicesLabelsProps)),
                            enableRadialLabels && React__default.createElement(PieRadialLabels, _extends({
                                data: arcsData,
                                radius: radius,
                                theme: theme
                            }, radialLabelsProps))
                        );
                    }
                ),
                legends$$1.map(function (legend, i) {
                    return React__default.createElement(legends.BoxLegendSvg, _extends({
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

Pie.propTypes = PiePropTypes;

var enhancedPie = enhance$1(Pie);
enhancedPie.displayName = 'enhance(Pie)';

var ResponsivePie = (function (props) {
    return React__default.createElement(
        core.ResponsiveWrapper,
        null,
        function (_ref) {
            var width = _ref.width,
                height = _ref.height;
            return React__default.createElement(enhancedPie, _extends({ width: width, height: height }, props));
        }
    );
});

exports.Pie = enhancedPie;
exports.ResponsivePie = ResponsivePie;
exports.PiePropTypes = PiePropTypes;
exports.PieDefaultProps = PieDefaultProps;

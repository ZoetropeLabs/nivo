'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var range = _interopDefault(require('lodash/range'));
var random = _interopDefault(require('lodash/random'));
var shuffle = _interopDefault(require('lodash/shuffle'));
var d3Time = require('d3-time');
var d3TimeFormat = require('d3-time-format');

var randColor = function randColor() {
  return "hsl(" + Math.round(Math.random() * 360) + ", 70%, 50%)";
};

var countryCodes = ['AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'];

var names = ['John', 'Raoul', 'Jane', 'Marcel', 'Ibrahim', 'Junko', 'Lyu', 'André', 'Maki', 'Véronique', 'Thibeau', 'Josiane', 'Raphaël', 'Mathéo', 'Margot', 'Hugo', 'Christian', 'Louis', 'Ella', 'Alton', 'Jimmy', 'Guillaume', 'Sébastien', 'Alfred', 'Bon', 'Solange', 'Kendrick', 'Jared', 'Satoko', 'Tomoko', 'Line', 'Delphine', 'Leonard', 'Alphonse', 'Lisa', 'Bart', 'Benjamin', 'Homer', 'Jack'];

var programmingLanguages = ['php', 'make', 'javascript', 'go', 'erlang', 'elixir', 'lisp', 'haskell', 'python', 'ruby', 'hack', 'scala', 'java', 'rust', 'c', 'css', 'sass', 'stylus'];



var index = Object.freeze({
	countryCodes: countryCodes,
	names: names,
	programmingLanguages: programmingLanguages
});

var availableNodes = names.map(function (name) {
    return { id: name };
});

var getNodeTargets = function getNodeTargets(id, links, currentPath) {
    var targets = links.filter(function (_ref) {
        var source = _ref.source;
        return source === id;
    }).map(function (_ref2) {
        var target = _ref2.target;

        if (target === id) {
            throw new Error('[sankey] a node cannot be linked on itself:\n  link: ' + id + ' \u2014> ' + id);
        }
        if (currentPath && currentPath.includes(target)) {
            throw new Error('[sankey] found cyclic dependency:\n  link: ' + currentPath.join(' —> ') + ' \u2014> ' + target);
        }
        return target;
    });

    return targets.reduce(function (acc, targetId) {
        return acc.concat(getNodeTargets(targetId, links, currentPath ? [].concat(currentPath, [targetId]) : [id, targetId]));
    }, targets);
};

var getNodesTargets = function getNodesTargets(links) {
    return links.reduce(function (targetsById, link) {
        if (!targetsById[link.source]) {
            targetsById[link.source] = getNodeTargets(link.source, links);
        }

        return targetsById;
    }, {});
};

var sankey = (function () {
    var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        nodeCount = _ref3.nodeCount,
        _ref3$maxIterations = _ref3.maxIterations,
        maxIterations = _ref3$maxIterations === undefined ? 3 : _ref3$maxIterations;

    var nodes = availableNodes.slice(0, nodeCount).map(function (node) {
        return Object.assign({}, node, {
            color: randColor()
        });
    });

    var links = [];
    shuffle(nodes).forEach(function (_ref4) {
        var id = _ref4.id;

        range(random(1, maxIterations)).forEach(function () {
            var targetsById = getNodesTargets(links);
            var randId = shuffle(nodes.filter(function (n) {
                return n.id !== id;
            }).map(function (n) {
                return n.id;
            }))[0];
            if ((!targetsById[randId] || !targetsById[randId].includes(id)) && (!targetsById[id] || !targetsById[id].includes(randId))) {
                links.push({
                    source: id,
                    target: randId,
                    value: random(5, 200)
                });
            }
        });
    });

    return { nodes: nodes, links: links };
});

var chord = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$keys = _ref.keys,
        keys = _ref$keys === undefined ? names : _ref$keys,
        _ref$size = _ref.size,
        size = _ref$size === undefined ? 7 : _ref$size,
        _ref$minValue = _ref.minValue,
        minValue = _ref$minValue === undefined ? 0 : _ref$minValue,
        _ref$maxValue = _ref.maxValue,
        maxValue = _ref$maxValue === undefined ? 2000 : _ref$maxValue;

    var maxSize = Math.min(keys.length, size);
    var selectedKeys = keys.slice(0, maxSize);

    var matrix = range(maxSize).map(function () {
        return range(maxSize).map(function () {
            if (Math.random() < 0.66) return random(minValue, maxValue / 4);
            return random(minValue, maxValue);
        });
    });

    return { matrix: matrix, keys: selectedKeys };
});

var randColor$1 = randColor;

var generateProgrammingLanguageStats = function generateProgrammingLanguageStats() {
    var shouldShuffle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

    var langs = programmingLanguages;
    if (shouldShuffle) {
        langs = shuffle(langs);
    }
    if (limit < 1) {
        limit = 1 + Math.round(Math.random() * (programmingLanguages.length - 1));
    }

    return langs.slice(0, limit).map(function (language) {
        return {
            label: language,
            value: Math.round(Math.random() * 600),
            color: randColor$1()
        };
    });
};

var uniqRand = function uniqRand(generator) {
    var used = [];

    return function () {
        var value = void 0;
        do {
            value = generator.apply(undefined, arguments);
        } while (used.includes(value));

        used.push(value);

        return value;
    };
};

var randCountryCode = function randCountryCode() {
    return shuffle(countryCodes)[0];
};

var generateDrinkStats = function generateDrinkStats() {
    var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 16;

    var rand = function rand() {
        return random(0, 60);
    };
    var types = ['whisky', 'rhum', 'gin', 'vodka', 'cognac'];
    var country = uniqRand(randCountryCode);

    var data = types.map(function (id) {
        return {
            id: id,
            color: randColor$1(),
            data: []
        };
    });

    range(size).forEach(function () {
        var x = country();
        types.forEach(function (id) {
            data.find(function (d) {
                return d.id === id;
            }).data.push({
                color: randColor$1(),
                x: x,
                y: rand()
            });
        });
    });

    return data;
};

var generateSerie = function generateSerie() {
    var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;

    var data = [];
    var max = 100 + Math.random() * (Math.random() * 600);

    for (var i = 0; i < length; i++) {
        data.push(Math.round(Math.random() * max));
    }

    return data;
};

var generateStackData = function generateStackData() {
    var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;

    var length = 16;
    return range(size).map(function () {
        return generateSerie(length).map(function (v, i) {
            return { x: i, y: v };
        });
    });
};

var generateCountriesPopulation = function generateCountriesPopulation(size) {
    var countryCode = uniqRand(randCountryCode());

    return range(size).map(function () {
        return {
            country: countryCode(),
            population: 200 + Math.round(Math.random() * Math.random() * 1000000)
        };
    });
};

var generateDayCounts = function generateDayCounts(from, to) {
    var maxSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.9;

    var days = d3Time.timeDays(from, to);

    var size = Math.round(days.length * (maxSize * 0.4)) + Math.round(Math.random() * (days.length * (maxSize * 0.6)));

    var dayFormat = d3TimeFormat.timeFormat('%Y-%m-%d');

    return shuffle(days).slice(0, size).map(function (day) {
        return {
            day: dayFormat(day),
            value: Math.round(Math.random() * 400)
        };
    });
};

var generateCountriesData = function generateCountriesData(keys) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$size = _ref.size,
        size = _ref$size === undefined ? 12 : _ref$size,
        _ref$min = _ref.min,
        min = _ref$min === undefined ? 0 : _ref$min,
        _ref$max = _ref.max,
        max = _ref$max === undefined ? 200 : _ref$max,
        _ref$withColors = _ref.withColors,
        withColors = _ref$withColors === undefined ? true : _ref$withColors;

    return countryCodes.slice(0, size).map(function (country) {
        var d = {
            country: country
        };
        keys.forEach(function (key) {
            d[key] = random(min, max);
            if (withColors === true) {
                d[key + 'Color'] = randColor$1();
            }
        });

        return d;
    });
};

var libTreeItems = [['viz', [['stack', [['chart'], ['xAxis'], ['yAxis'], ['layers']]], ['pie', [['chart', [['pie', [['outline'], ['slices'], ['bbox']]], ['donut'], ['gauge']]], ['legends']]]]], ['colors', [['rgb'], ['hsl']]], ['utils', [['randomize'], ['resetClock'], ['noop'], ['tick'], ['forceGC'], ['stackTrace'], ['dbg']]], ['generators', [['address'], ['city'], ['animal'], ['movie'], ['user']]], ['set', [['clone'], ['intersect'], ['merge'], ['reverse'], ['toArray'], ['toObject'], ['fromCSV'], ['slice'], ['append'], ['prepend'], ['shuffle'], ['pick'], ['plouc']]], ['text', [['trim'], ['slugify'], ['snakeCase'], ['camelCase'], ['repeat'], ['padLeft'], ['padRight'], ['sanitize'], ['ploucify']]], ['misc', [['whatever', [['hey'], ['WTF'], ['lol'], ['IMHO']]], ['other'], ['crap', [['crapA'], ['crapB', [['crapB1'], ['crapB2'], ['crapB3'], ['crapB4']]], ['crapC', [['crapC1'], ['crapC2'], ['crapC3'], ['crapC4'], ['crapC5'], ['crapC6'], ['crapC7'], ['crapC8'], ['crapC9']]]]]]]];

var generateLibTree = function generateLibTree() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'nivo';
    var limit = arguments[1];
    var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : libTreeItems;

    limit = limit || children.length;
    if (limit > children.length) {
        limit = children.length;
    }

    var tree = {
        name: name,
        color: randColor$1()
    };
    if (children && children.length > 0) {
        tree.children = range(limit).map(function (o, i) {
            var leaf = children[i];

            // full path `${name}.${leaf[0]}`
            return generateLibTree(leaf[0], null, leaf[1] || []);
        });
    } else {
        tree.loc = Math.round(Math.random() * 200000);
    }

    return tree;
};

var wines = ['chardonay', 'carmenere', 'syrah'];
var wineTastes = ['fruity', 'bitter', 'heavy', 'strong', 'sunny'];
var generateWinesTastes = function generateWinesTastes() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$randMin = _ref2.randMin,
        randMin = _ref2$randMin === undefined ? 20 : _ref2$randMin,
        _ref2$randMax = _ref2.randMax,
        randMax = _ref2$randMax === undefined ? 120 : _ref2$randMax;

    var data = wineTastes.map(function (taste) {
        var d = { taste: taste };
        wines.forEach(function (wine) {
            d[wine] = random(randMin, randMax);
        });

        return d;
    });

    return { data: data, keys: wines };
};

exports.sets = index;
exports.randColor = randColor$1;
exports.generateProgrammingLanguageStats = generateProgrammingLanguageStats;
exports.uniqRand = uniqRand;
exports.randCountryCode = randCountryCode;
exports.generateDrinkStats = generateDrinkStats;
exports.generateSerie = generateSerie;
exports.generateStackData = generateStackData;
exports.generateCountriesPopulation = generateCountriesPopulation;
exports.generateDayCounts = generateDayCounts;
exports.generateCountriesData = generateCountriesData;
exports.generateLibTree = generateLibTree;
exports.generateWinesTastes = generateWinesTastes;
exports.generateSankeyData = sankey;
exports.generateChordData = chord;

"use strict";
exports.__esModule = true;
var os = require("os");
var _codes_base = {
    reset: "\u001B[0m",
    bold: "\u001B[1m",
    dim: "\u001B[2m",
    italic: "\u001B[3m",
    underline: "\u001B[4m",
    inverse: "\u001B[7m",
    hidden: "\u001B[8m",
    strikethrough: "\u001B[9m",
    black: "\u001B[30m",
    red: "\u001B[31m",
    green: "\u001B[32m",
    yellow: "\u001B[33m",
    blue: "\u001B[34m",
    magenta: "\u001B[35m",
    cyan: "\u001B[36m",
    white: "\u001B[37m",
    bg_black: "\u001B[40m",
    bg_red: "\u001B[41m",
    bg_green: "\u001B[42m",
    bg_yellow: "\u001B[43m",
    bg_blue: "\u001B[44m",
    bg_magenta: "\u001B[45m",
    bg_cyan: "\u001B[46m",
    bg_white: "\u001B[47m"
};
var _codes_advanced = {
    brightblack: "\u001B[30;1m",
    brightred: "\u001B[31;1m",
    brightgreen: "\u001B[32;1m",
    brightyellow: "\u001B[33;1m",
    brightblue: "\u001B[34;1m",
    brightmagenta: "\u001B[35;1m",
    brightcyan: "\u001B[36;1m",
    brightwhite: "\u001B[37;1m",
    bg_brightblack: "\u001B[40;1m",
    bg_brightred: "\u001B[41;1m",
    bg_brightgreen: "\u001B[42;1m",
    bg_brightyellow: "\u001B[43;1m",
    bg_brightblue: "\u001B[44;1m",
    bg_brightmagenta: "\u001B[45;1m",
    bg_brightcyan: "\u001B[46;1m",
    bg_brightwhite: "\u001B[47;1m"
};
var _reset_ctrl = _codes_base.reset;
var _color_256bits = "\u001B[38;5;";
var _color_256bits_endl = "m";
var _color_256bits_black = "\u001B[38;5;0m";
var _color_256bits_white = "\u001B[38;5;15m";
var _color_256bits_bg = "\u001B[48;5;";
var _color_256bits_bg_endl = "m";
var _color_256bits_bg_black = "\u001B[48;5;0m";
var _color_256bits_bg_white = "\u001B[48;5;15m";
var _gray_color_startpos = 232;
function _get_gray_code(level) {
    if (_enable) {
        if (_support < Support.ANSI256)
            return "\u001b[90m";
        ;
        if (level <= 0)
            return _color_256bits_black;
        else if (level >= 25)
            return _color_256bits_white;
        return _color_256bits + (level - 1 + 232).toString() + _color_256bits_endl;
    }
    return '';
}
function _get_gray_bg_code(level) {
    if (_enable) {
        if (_support < Support.ANSI256)
            return _color_256bits_bg + 245 + _color_256bits_bg_endl;
        if (level <= 0)
            return _color_256bits_bg_black;
        else if (level >= 25)
            return _color_256bits_bg_white;
        return _color_256bits_bg + (level - 1 + 232).toString() + _color_256bits_bg_endl;
    }
    return '';
}
function _get_256bits_color_code(idx) {
    if (_support < Support.ANSI256)
        return null;
    if (idx < 0)
        idx = 0;
    else if (idx > 255)
        idx = 255;
    return _color_256bits + idx + _color_256bits_endl;
}
function _get_256bits_color_bg_code(idx) {
    if (_support < Support.ANSI256)
        return null;
    if (idx < 0)
        idx = 0;
    else if (idx > 255)
        idx = 255;
    return _color_256bits_bg + idx + _color_256bits_bg_endl;
}
var _0_ascii = 0x30;
var _9_ascii = 0x39;
var _a_ascii = 0x61;
var _f_ascii = 0x66;
function _n2h(n) {
    var hex = n.toString(16);
    if (n < 0x10)
        hex = "0" + hex;
    return hex;
}
function _get_color_by_hex(hexcode, bg) {
    if (_support == Support.ANSI24bits) {
        var r = parseInt(hexcode[0] + hexcode[1], 16);
        var g = parseInt(hexcode[2] + hexcode[3], 16);
        var b = parseInt(hexcode[4] + hexcode[5], 16);
        return bg ? _get_truecolor_bg(r, g, b) : _get_truecolor(r, g, b);
    }
    if (_support < Support.ANSI256)
        return null;
    if (_more_detail_on_color256) {
        if (bg)
            return _get_web_safe_code_by_hex(hexcode, _color_bg_web_safe_map, _color_bg_web_safe_list, _color_bg_gray_map, _color_bg_gray_list);
        else
            return _get_web_safe_code_by_hex(hexcode, _color_web_safe_map, _color_web_safe_list, _color_gray_map, _color_gray_list);
    }
    else if (bg)
        return _get_web_safe_code_by_hex(hexcode, _color_bg_web_safe_map, _color_bg_web_safe_list);
    else
        return _get_web_safe_code_by_hex(hexcode, _color_web_safe_map, _color_web_safe_list);
}
function _get_color_by_rgb(r, g, b, bg) {
    if (_support == Support.ANSI24bits)
        return bg ? _get_truecolor_bg(r, g, b) : _get_truecolor(r, g, b);
    if (_support < Support.ANSI256)
        return null;
    if (_more_detail_on_color256) {
        if (bg)
            return _get_web_safe_code_by_rgb(r, g, b, _color_bg_web_safe_map, _color_bg_web_safe_list, _color_bg_gray_map, _color_bg_gray_list);
        else
            return _get_web_safe_code_by_rgb(r, g, b, _color_web_safe_map, _color_web_safe_list, _color_bg_gray_map, _color_bg_gray_list);
    }
    if (bg)
        return _get_web_safe_code_by_rgb(r, g, b, _color_bg_web_safe_map, _color_bg_web_safe_list);
    else
        return _get_web_safe_code_by_rgb(r, g, b, _color_web_safe_map, _color_web_safe_list);
}
function _get_web_safe_code_by_hex(hex, map, list, map2, list2) {
    var c = map[hex];
    if (c != null)
        return c;
    if (map2 != null) {
        c = map2[hex];
        if (c != null)
            return c;
    }
    var r = parseInt(hex[0] + hex[1], 16);
    var g = parseInt(hex[2] + hex[3], 16);
    var b = parseInt(hex[4] + hex[5], 16);
    c = _get_web_safe_code_search(r, g, b, list, list2);
    map[hex] = c;
    return c;
}
function _get_web_safe_code_by_rgb(r, g, b, map, list, map2, list2) {
    var hex = _n2h(r) + _n2h(g) + _n2h(b);
    var c = map[hex];
    if (c != null)
        return c;
    if (map2 != null) {
        c = map2[hex];
        if (c != null)
            return c;
    }
    c = _get_web_safe_code_search(r, g, b, list, list2);
    map[hex] = c;
    return c;
}
function _get_web_safe_code_search(r, g, b, list, list2) {
    var m = Number.MAX_VALUE;
    var c = null;
    list.forEach(function (item) {
        var v = (item.r - r) * (item.r - r) +
            (item.g - g) * (item.g - g) +
            (item.b - b) * (item.b - b);
        if (v < m) {
            m = v;
            c = item.c;
        }
    });
    if (list2 != null) {
        list2.forEach(function (item) {
            var v = (item.r - r) * (item.r - r) +
                (item.g - g) * (item.g - g) +
                (item.b - b) * (item.b - b);
            if (v < m) {
                m = v;
                c = item.c;
            }
        });
    }
    return c;
}
function _get_truecolor(r, g, b) {
    return "\u001B[38;2;" + r + ";" + g + ";" + b + ";m";
}
function _get_truecolor_bg(r, g, b) {
    return "\u001B[48;2;" + r + ";" + g + ";" + b + ";m";
}
function _get_code(color) {
    if (color.length == 0 || _support < Support.BASE)
        return null;
    var code = _codes_base[color];
    if (code != null)
        return code;
    code = _codes_advanced[color];
    if (code != null)
        return code;
    color = color.toLowerCase();
    if (color.charAt(0) == '#')
        return _get_color_by_hex(color.slice(1), false);
    else if (color.charAt(0) == 'g')
        return _get_gray_code(parseInt(color.slice(1)));
    else if (color.charAt(0) == 'b') {
        if (color.charAt(1) == '#')
            return _get_color_by_hex(color.slice(2), true);
        else if (color.charAt(1) == 'g')
            return _get_gray_bg_code(parseInt(color.slice(2)));
    }
    return code;
}
var _color_web_safe_map = null;
var _color_web_safe_list = null;
var _color_bg_web_safe_map = null;
var _color_bg_web_safe_list = null;
var _color_gray_map = null;
var _color_gray_list = null;
var _color_bg_gray_map = null;
var _color_bg_gray_list = null;
function _color_web_safe_map_init() {
    var hexs = ["0", "33", "66", "99", "cc", "ff"];
    var hexns = [0, 0x33, 0x66, 0x99, 0xcc, 0xff];
    _color_web_safe_map = {};
    _color_web_safe_list = [];
    _color_bg_web_safe_map = {};
    _color_bg_web_safe_list = [];
    _color_gray_map = {};
    _color_gray_list = [];
    _color_bg_gray_map = {};
    _color_bg_gray_list = [];
    var startpos = 16;
    var key = [0, 0, 0];
    for (var i = 0; i < 216; ++i, ++key[0]) {
        if (key[0] >= 6) {
            key[0] = 0;
            key[1] += 1;
            if (key[1] >= 6) {
                key[1] = 0;
                key[2] += 1;
            }
        }
        var pos = startpos + i;
        var hex = hexs[key[2]] + hexs[key[1]] + hexs[key[0]];
        var c = _color_256bits + pos + _color_256bits_endl;
        _color_web_safe_map[hex] = c;
        _color_web_safe_list.push({
            r: hexns[key[2]],
            g: hexns[key[1]],
            b: hexns[key[0]],
            c: c
        });
        c = _color_256bits_bg + pos + _color_256bits_bg_endl;
        _color_bg_web_safe_map[hex] = c;
        _color_bg_web_safe_list.push({
            r: hexns[key[2]],
            g: hexns[key[1]],
            b: hexns[key[0]],
            c: c
        });
    }
    for (var i = 0; i < 24; ++i) {
        var n = 8 + i * 10;
        var hex = n.toString(16);
        if (n < 0x10)
            hex = '0' + hex;
        var c = _color_256bits + (232 + i).toString() + _color_256bits_endl;
        _color_gray_map[hex] = c;
        _color_gray_list.push({ r: n, g: n, b: n, c: c });
        c = _color_256bits_bg + (232 + i).toString() + _color_256bits_bg_endl;
        _color_bg_gray_map[hex] = c;
        _color_bg_gray_list.push({ r: n, g: n, b: n, c: c });
    }
}
var _default_theme = {
    verbose: "white",
    info: "green",
    debug: "blue",
    warning: "yellow",
    error: "red",
    custom0: "white",
    custom1: "white",
    custom2: "white",
    custom3: "white",
    custom4: "white",
    custom5: "white",
    custom6: "white",
    custom7: "white",
    custom8: "white",
    custom9: "white"
};
var Support;
(function (Support) {
    Support[Support["DISABLE"] = 0] = "DISABLE";
    Support[Support["BASE"] = 1] = "BASE";
    Support[Support["ANSI256"] = 2] = "ANSI256";
    Support[Support["ANSI24bits"] = 3] = "ANSI24bits";
})(Support = exports.Support || (exports.Support = {}));
;
var _support = Support.DISABLE;
var _enable = true;
var _more_detail_on_color256 = false;
var _theme = _default_theme;
function _check_reset_end(value) {
    return value.length >= _reset_ctrl.length &&
        value.lastIndexOf(_reset_ctrl) + _reset_ctrl.length == value.length;
}
function _up(n) {
    if (n === void 0) { n = 1; }
    return "\u001B[" + n + "A";
}
function _down(n) {
    if (n === void 0) { n = 1; }
    return "\u001B[" + n + "B";
}
function _right(n) {
    if (n === void 0) { n = 1; }
    return "\u001B[" + n + "C";
}
function _left(n) {
    if (n === void 0) { n = 1; }
    return "\u001B[" + n + "D";
}
function _next_line(n) {
    if (n === void 0) { n = 1; }
    return "\u001B[" + n + "E";
}
function _prev_line(n) {
    if (n === void 0) { n = 1; }
    return "\u001B[" + n + "F";
}
function _column(n) { return "\u001B[" + n + "G"; }
function _position(x, y) { return "\u001B[" + y + ";" + x + "H"; }
var _save_position_code = "\u001B[s";
var _load_position_code = "\u001B[u";
var _clear_screen_code = "\u001B[2J";
var _clear_line_code = "\u001B[K";
var _hide_cursor_code = "\u001B[?25l";
var _show_cursor_code = "\u001B[?25h";
function _check_support() {
    var env = process.env;
    var argv = process.argv;
    if (argv.indexOf("nocolor") >= 0 ||
        argv.indexOf("nocolors") >= 0)
        return Support.DISABLE;
    if (argv.indexOf("fullcolor") >= 0 ||
        argv.indexOf("fullcolors") >= 0 ||
        argv.indexOf("truecolor") >= 0 ||
        argv.indexOf("truecolors") >= 0 ||
        argv.indexOf("color24bits") >= 0)
        return Support.ANSI24bits;
    if (argv.indexOf("websafe") >= 0 ||
        argv.indexOf("color256") >= 0)
        return Support.ANSI256;
    if (argv.indexOf("colorbase") >= 0 ||
        argv.indexOf("basecolors") >= 0)
        return Support.BASE;
    if (process.platform === 'win32') {
        var osRelease = os.release().split('.');
        if (Number(process.versions.node.split('.')[0]) >= 8 &&
            Number(osRelease[0]) >= 10 &&
            Number(osRelease[2]) >= 10586) {
            return Support.ANSI256;
        }
        return Support.BASE;
    }
    if ('CI' in env) {
        if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(function (sign) { return sign in env; }) || env.CI_NAME === 'codeship') {
            return Support.BASE;
        }
        return Support.DISABLE;
    }
    if ('TEAMCITY_VERSION' in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if ('TERM_PROGRAM' in env) {
        var version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);
        switch (env.TERM_PROGRAM) {
            case 'iTerm.app':
                return version >= 3 ? 3 : 2;
            case 'Hyper':
                return Support.ANSI24bits;
            case 'Apple_Terminal':
                return Support.ANSI256;
        }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
        return Support.ANSI256;
    }
    if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return Support.ANSI256;
    }
    if ('COLORTERM' in env) {
        return Support.BASE;
    }
    if (env.TERM === 'dumb') {
        return Support.BASE;
    }
    return Support.DISABLE;
}
function _codes_init() {
    _support = _check_support();
    var _loop_1 = function (key) {
        var ctrl = _codes_base[key];
        if (ctrl == null)
            return "continue";
        Object.defineProperty(String.prototype, key, {
            get: function () {
                if (_enable) {
                    if (_support < Support.BASE)
                        return this;
                    if (_check_reset_end(this))
                        return ctrl + this;
                    else
                        return ctrl + this + _reset_ctrl;
                }
                else
                    return this;
            },
            enumerable: false,
            configurable: false
        });
    };
    for (var key in _codes_base) {
        _loop_1(key);
    }
    String.prototype.color_at_256 = function (idx) {
        if (_check_reset_end((this)))
            return _get_256bits_color_code(idx) + this;
        else
            return _get_256bits_color_code(idx) + this + _reset_ctrl;
    };
    String.prototype.color_bg_at_256 = function (idx) {
        if (_check_reset_end((this)))
            return _get_256bits_color_bg_code(idx) + this;
        else
            return _get_256bits_color_bg_code(idx) + this + _reset_ctrl;
    };
    String.prototype.gray = function (level) {
        if (_check_reset_end((this)))
            return _get_gray_code(level) + this;
        else
            return _get_gray_code(level) + this + _reset_ctrl;
    };
    String.prototype.grey = String.prototype.gray;
    String.prototype.gray_bg = function (level) {
        if (_check_reset_end((this)))
            return _get_gray_bg_code(level) + this;
        else
            return _get_gray_bg_code(level) + this + _reset_ctrl;
    };
    String.prototype.grey_bg = String.prototype.gray_bg;
    String.prototype.colors = function (color, noreset) {
        return colors(color, this, noreset);
    };
    String.prototype.hex = function (hex) {
        return _get_color_by_hex(hex, false) + this + _reset_ctrl;
    };
    String.prototype.hex_bg = function (hex) {
        return _get_color_by_hex(hex, true) + this + _reset_ctrl;
    };
    String.prototype.rgb = function (r, g, b) {
        return _get_color_by_rgb(r, g, b, false) + this + _reset_ctrl;
    };
    String.prototype.rgb_bg = function (r, g, b) {
        return _get_color_by_rgb(r, g, b, true) + this + _reset_ctrl;
    };
    String.prototype.paint = function (pt) {
        return paint(pt, this);
    };
    String.prototype.up = function (n) {
        return _up(n) + this;
    };
    String.prototype.down = function (n) {
        return _down(n) + this;
    };
    String.prototype.right = function (n) {
        return _right(n) + this;
    };
    String.prototype.left = function (n) {
        return _left(n) + this;
    };
    String.prototype.next_line = function (n) {
        return _next_line(n) + this;
    };
    String.prototype.prev_line = function (n) {
        return _prev_line(n) + this;
    };
    String.prototype.column = function (n) {
        return _column(n) + this;
    };
    String.prototype.position = function (x, y) {
        return _position(x, y) + this;
    };
    Object.defineProperty(String.prototype, "load_position", {
        get: function () {
            return _load_position_code + this;
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(String.prototype, "save_position", {
        get: function () {
            return _save_position_code + this;
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(String.prototype, "clear_screen", {
        get: function () {
            return _clear_screen_code + this;
        },
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(String.prototype, "clear_line", {
        get: function () {
            return _clear_line_code + this;
        },
        enumerable: false,
        configurable: false
    });
}
function _theme_init() {
    var _loop_2 = function (key) {
        var _key = key;
        Object.defineProperty(String.prototype, key, {
            get: function () {
                if (_enable) {
                    var s = _theme[key];
                    if (s == null)
                        return this;
                    return colors(s, this);
                }
                return this;
            },
            enumerable: false,
            configurable: false
        });
    };
    for (var key in _theme) {
        _loop_2(key);
    }
}
var _ready = false;
function _init() {
    if (_ready)
        return;
    _ready = true;
    _color_web_safe_map_init();
    _codes_init();
    _theme_init();
}
_init();
function colors(color, value, noreset) {
    if (_enable) {
        if (_support < Support.BASE)
            return value;
        if (typeof (color) == "string") {
            var s = _theme[color];
            if (s != null)
                return colors(s, value);
            var code = _get_code(color);
            if (code == null)
                return value;
            if (noreset)
                return code + value;
            return code + value + _reset_ctrl;
        }
        else {
            var result = value;
            for (var i = color.length - 1; i >= 0; --i) {
                var code = _get_code(color[i]);
                if (code != null)
                    result = code + result;
            }
            if (noreset)
                return result;
            return result + _reset_ctrl;
        }
    }
    return value;
}
exports.colors = colors;
function enable(value) {
    if (value === void 0) { value = true; }
    _enable = value;
}
exports.enable = enable;
function support(support) {
    if (support != null)
        _support = support;
    return _support;
}
exports.support = support;
function theme(theme) {
    if (theme === void 0) { theme = _default_theme; }
    if (theme == null)
        _theme = _default_theme;
    else
        _theme = theme;
}
exports.theme = theme;
function position(x, y) {
    process.stdout.write(_position(x, y));
}
exports.position = position;
function clear_screen() {
    process.stdout.write(_clear_screen_code);
}
exports.clear_screen = clear_screen;
function show_cursor(show) {
    if (show === void 0) { show = true; }
    process.stdout.write(show ? _show_cursor_code : _hide_cursor_code);
}
exports.show_cursor = show_cursor;
function more_detail_on_color256(value) {
    if (value === void 0) { value = true; }
    _more_detail_on_color256 = value;
    return _more_detail_on_color256;
}
exports.more_detail_on_color256 = more_detail_on_color256;
function replace_all(value, search, replace) {
    if (search == null || search.length == 0)
        return value;
    var idx = -1;
    var array = [];
    while (true) {
        idx = value.indexOf(search);
        if (idx < 0) {
            array.push(value);
            break;
        }
        array.push(value.slice(0, idx));
        array.push(replace);
        value = value.slice(idx + search.length);
    }
    value = "";
    for (var i = 0; i < array.length; ++i) {
        value += array[i];
    }
    return value;
}
function paint(paint, value) {
    if (!_enable || paint == null || value == null || value.length == 0 || paint.length == 0)
        return value;
    var _loop_3 = function (i) {
        var item = paint[i];
        var key = item.key;
        var cs = item.colors;
        if (key == null || cs == null || colors.length == 0)
            return "continue";
        if (typeof (key) == "string") {
            value = replace_all(value, key, colors(cs, key));
        }
        else if (key instanceof RegExp) {
            value = value.replace(key, function (ar) {
                return colors(cs, ar);
            });
        }
        else {
            if (key.length == 0)
                return { value: value };
            if (typeof (key[0]) == "string") {
                for (var idx = 0; idx < key.length; ++idx) {
                    var k = key[idx];
                    value = replace_all(value, k, colors(cs, k));
                }
            }
            else {
                for (var idx = 0; idx < key.length; ++idx) {
                    value = value.replace(key[idx], function (ar) {
                        return colors(cs, ar);
                    });
                }
            }
        }
    };
    for (var i = 0; i < paint.length; ++i) {
        var state_1 = _loop_3(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return value;
}
exports.paint = paint;
//# sourceMappingURL=colors.js.map
/* Copyright xerysherry 2018
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import os = require("os");

const _codes_base: { [key: string]: string } = {
    reset: `\u001b[0m`,

    bold: `\u001b[1m`,
    dim: `\u001b[2m`,
    italic: `\u001b[3m`,
    underline: `\u001b[4m`,
    inverse: `\u001b[7m`,
    hidden: `\u001b[8m`,
    strikethrough: `\u001b[9m`,

    black: `\u001b[30m`,
    red: `\u001b[31m`,
    green: `\u001b[32m`,
    yellow: `\u001b[33m`,
    blue: `\u001b[34m`,
    magenta: `\u001b[35m`,
    cyan: `\u001b[36m`,
    white: `\u001b[37m`,

    bg_black: `\u001b[40m`,
    bg_red: `\u001b[41m`,
    bg_green: `\u001b[42m`,
    bg_yellow: `\u001b[43m`,
    bg_blue: `\u001b[44m`,
    bg_magenta: `\u001b[45m`,
    bg_cyan: `\u001b[46m`,
    bg_white: `\u001b[47m`,
};
const _codes_advanced: { [key: string]: string } = {
    brightblack: `\u001b[30;1m`,
    brightred: `\u001b[31;1m`,
    brightgreen: `\u001b[32;1m`,
    brightyellow: `\u001b[33;1m`,
    brightblue: `\u001b[34;1m`,
    brightmagenta: `\u001b[35;1m`,
    brightcyan: `\u001b[36;1m`,
    brightwhite: `\u001b[37;1m`,

    bg_brightblack: `\u001b[40;1m`,
    bg_brightred: `\u001b[41;1m`,
    bg_brightgreen: `\u001b[42;1m`,
    bg_brightyellow: `\u001b[43;1m`,
    bg_brightblue: `\u001b[44;1m`,
    bg_brightmagenta: `\u001b[45;1m`,
    bg_brightcyan: `\u001b[46;1m`,
    bg_brightwhite: `\u001b[47;1m`,
}
const _reset_ctrl: string = _codes_base.reset

// 256bits
const _color_256bits: string = `\u001b[38;5;`;
const _color_256bits_endl: string = `m`;
const _color_256bits_black: string = `\u001b[38;5;0m`
const _color_256bits_white: string = `\u001b[38;5;15m`
// bg 256bits
const _color_256bits_bg: string = `\u001b[48;5;`;
const _color_256bits_bg_endl: string = `m`;
const _color_256bits_bg_black: string = `\u001b[48;5;0m`
const _color_256bits_bg_white: string = `\u001b[48;5;15m`

const _gray_color_startpos = 232
// gray level at [0,25], 0 is black, and 25 is white
// 26级灰度，0为黑色，25为白色
function _get_gray_code(level: number): string {
    if (_enable) {
        if(_support < Support.ANSI256)
            return "\u001b[90m";;
        if (level <= 0)
            //黑
            return _color_256bits_black;
        else if (level >= 25)
            //白
            return _color_256bits_white;
        return _color_256bits + (level - 1 + 232).toString() + _color_256bits_endl;
    }
    return '';
}
function _get_gray_bg_code(level: number): string {
    if (_enable) {
        if(_support < Support.ANSI256)
            return _color_256bits_bg + 245 + _color_256bits_bg_endl;
        if (level <= 0)
            //黑
            return _color_256bits_bg_black;
        else if (level >= 25)
            //白
            return _color_256bits_bg_white;
        return _color_256bits_bg + (level - 1 + 232).toString() + _color_256bits_bg_endl;
    }
    return '';
}
// get 256 colors, idx at [0, 255]
function _get_256bits_color_code(idx: number): string {
    if(_support < Support.ANSI256)
        return null;
    if (idx < 0)
        idx = 0;
    else if (idx > 255)
        idx = 255;
    return _color_256bits + idx + _color_256bits_endl;
}
// get bg 256 colors, idx at [0, 255]
function _get_256bits_color_bg_code(idx: number): string {
    if(_support < Support.ANSI256)
        return null;
    if (idx < 0)
        idx = 0;
    else if (idx > 255)
        idx = 255;
    return _color_256bits_bg + idx + _color_256bits_bg_endl;
}

const _0_ascii = 0x30;
const _9_ascii = 0x39;
const _a_ascii = 0x61;
const _f_ascii = 0x66;

function _n2h(n:number):string
{
    let hex = n.toString(16);
    if(n < 0x10)
        hex = "0" + hex;
    return hex;
}

function _get_color_by_hex(hexcode: string, bg: boolean): string
{
    if(_support == Support.ANSI24bits)
    {
        let r = parseInt(hexcode[0]+hexcode[1], 16);
        let g = parseInt(hexcode[2]+hexcode[3], 16);
        let b = parseInt(hexcode[4]+hexcode[5], 16);
        return bg ? _get_truecolor_bg(r, g, b) : _get_truecolor(r, g, b);
    }
    if(_support < Support.ANSI256)
        return null;
    if(_more_detail_on_color256)
    {
        if(bg)
            return _get_web_safe_code_by_hex(hexcode, 
                    _color_bg_web_safe_map, _color_bg_web_safe_list,
                    _color_bg_gray_map, _color_bg_gray_list);
        else
            return _get_web_safe_code_by_hex(hexcode, 
                    _color_web_safe_map, _color_web_safe_list,
                    _color_gray_map, _color_gray_list);
    }
    else if(bg)
        return _get_web_safe_code_by_hex(hexcode, 
                _color_bg_web_safe_map, _color_bg_web_safe_list);
    else
        return _get_web_safe_code_by_hex(hexcode, 
                _color_web_safe_map, _color_web_safe_list);
}

function _get_color_by_rgb(r:number, g:number, b:number, bg: boolean): string
{
    if(_support == Support.ANSI24bits)
        return bg ? _get_truecolor_bg(r, g, b) : _get_truecolor(r, g, b);
    if(_support < Support.ANSI256)
        return null;
    if(_more_detail_on_color256)
    {
        if(bg)
            return _get_web_safe_code_by_rgb(r, g, b, 
                    _color_bg_web_safe_map, _color_bg_web_safe_list,
                    _color_bg_gray_map, _color_bg_gray_list);
        else
            return _get_web_safe_code_by_rgb(r, g, b, 
                    _color_web_safe_map, _color_web_safe_list,
                    _color_bg_gray_map, _color_bg_gray_list);
    }
    if(bg)
        return _get_web_safe_code_by_rgb(r, g, b, 
                _color_bg_web_safe_map, _color_bg_web_safe_list);
    else
        return _get_web_safe_code_by_rgb(r, g, b, 
                _color_web_safe_map, _color_web_safe_list);
}

function _get_web_safe_code_by_hex(hex:string, 
                                map:{ [key: string]: string },
                                list:{r:number, g:number, b:number, c:string}[],
                                map2?:{ [key: string]: string },
                                list2?:{r:number, g:number, b:number, c:string}[])
{
    let c = map[hex];
    if(c != null)
        return c;
    if(map2 != null)
    {
        c = map2[hex];
        if(c != null)
            return c;
    }
    let r = parseInt(hex[0]+hex[1], 16);
    let g = parseInt(hex[2]+hex[3], 16);
    let b = parseInt(hex[4]+hex[5], 16);
    c = _get_web_safe_code_search(r, g, b, list, list2);
    map[hex] = c;
    return c;
}

function _get_web_safe_code_by_rgb(r:number, g:number, b:number, 
                                map:{ [key: string]: string },
                                list:{r:number, g:number, b:number, c:string}[],
                                map2?:{ [key: string]: string },
                                list2?:{r:number, g:number, b:number, c:string}[])
{
    let hex = _n2h(r) + _n2h(g) + _n2h(b);
    let c = map[hex];
    if(c != null)
        return c;
    if(map2 != null)
    {
        c = map2[hex];
        if(c != null)
            return c;
    }
    c = _get_web_safe_code_search(r, g, b, list, list2);
    map[hex] = c;
    return c;
}

function _get_web_safe_code_search(r:number, g:number, b:number, 
    list:{r:number, g:number, b:number, c:string}[],
    list2?:{r:number, g:number, b:number, c:string}[]): string
{
    let m = Number.MAX_VALUE;
    let c = null;

    list.forEach(item=>{
        let v = (item.r - r)*(item.r - r) +
                (item.g - g)*(item.g - g) +
                (item.b - b)*(item.b - b);
        if(v < m)
        {
            m = v;
            c = item.c;
        }
    });
    if(list2 != null) {
        list2.forEach(item=>{
            let v = (item.r - r)*(item.r - r) +
                    (item.g - g)*(item.g - g) +
                    (item.b - b)*(item.b - b);
            if(v < m)
            {
                m = v;
                c = item.c;
            }
        });
    }
    return c;
}

function _get_truecolor(r: number, g: number, b:number): string
{
    return `\u001b[38;2;${r};${g};${b};m`;
}

function _get_truecolor_bg(r: number, g: number, b:number): string
{
    return `\u001b[48;2;${r};${g};${b};m`;
}

function _get_code(color: string) {
    if (color.length == 0 || _support < Support.BASE)
        return null;
    let code = _codes_base[color];
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
    else if (color.charAt(0) == 'b')
    {
        // b#
        if(color.charAt(1) == '#')
            return _get_color_by_hex(color.slice(2), true);
        // bg
        else if(color.charAt(1) == 'g')
            return _get_gray_bg_code(parseInt(color.slice(2)));

    }
    return code;
}

let _color_web_safe_map: { [key: string]: string } = null;
let _color_web_safe_list: {r:number, g:number, b:number, c:string}[] = null;
let _color_bg_web_safe_map: { [key: string]: string } = null;
let _color_bg_web_safe_list: {r:number, g:number, b:number, c:string}[] = null;
let _color_gray_map: { [key: string]: string } = null;
let _color_gray_list: {r:number, g:number, b:number, c:string}[] = null;
let _color_bg_gray_map: { [key: string]: string } = null;
let _color_bg_gray_list: {r:number, g:number, b:number, c:string}[] = null;

function _color_web_safe_map_init(): void {
    let hexs = ["0", "33", "66", "99", "cc", "ff"];
    let hexns = [0, 0x33, 0x66, 0x99, 0xcc, 0xff];
    _color_web_safe_map = {};
    _color_web_safe_list = [];
    _color_bg_web_safe_map = {};
    _color_bg_web_safe_list = [];
    _color_gray_map = {};
    _color_gray_list = [];
    _color_bg_gray_map = {};
    _color_bg_gray_list = [];

    let startpos = 16;
    let key: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 216; ++i, ++key[0]) {
        if (key[0] >= 6) {
            key[0] = 0;
            key[1] += 1;
            if (key[1] >= 6) {
                key[1] = 0;
                key[2] += 1;
            }
        }
        let pos = startpos + i;
        let hex = hexs[key[2]] + hexs[key[1]] + hexs[key[0]];
        let c = _color_256bits + pos + _color_256bits_endl;
        _color_web_safe_map[hex] = c;
        _color_web_safe_list.push({
            r:hexns[key[2]], 
            g:hexns[key[1]], 
            b:hexns[key[0]], 
            c: c});
        c = _color_256bits_bg + pos + _color_256bits_bg_endl;
        _color_bg_web_safe_map[hex] = c;
        _color_bg_web_safe_list.push({
            r:hexns[key[2]], 
            g:hexns[key[1]], 
            b:hexns[key[0]], 
            c: c})
    }

    for(let i=0; i<24; ++i)
    {
        let n = 8 + i * 10;
        let hex = n.toString(16);
        if(n < 0x10)
            hex = '0' + hex;
        let c = _color_256bits + (232 + i).toString() + _color_256bits_endl;
        _color_gray_map[hex] = c;
        _color_gray_list.push({r:n, g:n, b:n, c: c});
        c = _color_256bits_bg + (232 + i).toString() + _color_256bits_bg_endl;
        _color_bg_gray_map[hex] = c;
        _color_bg_gray_list.push({r:n, g:n, b:n, c: c});
    }
}

const _default_theme: { [key: string]: string | string[] } = {
    verbose: "white",
    info: "green",
    debug: "blue",
    warning: "yellow",
    error: "red",
    // custom
    custom0: "white",
    custom1: "white",
    custom2: "white",
    custom3: "white",
    custom4: "white",
    custom5: "white",
    custom6: "white",
    custom7: "white",
    custom8: "white",
    custom9: "white",
}
export enum Support {DISABLE = 0, BASE = 1, ANSI256 = 2, ANSI24bits = 3};
let _support: Support = Support.DISABLE;
let _enable: boolean = true;
let _more_detail_on_color256: boolean = false;
let _theme: { [key: string]: string | string[] } = _default_theme

function _check_reset_end(value: string): boolean {
    return value.length >= _reset_ctrl.length &&
        value.lastIndexOf(_reset_ctrl) + _reset_ctrl.length == value.length
}

function _up(n: number = 1): string { return `\u001b[${n}A`; }
function _down(n: number = 1): string { return `\u001b[${n}B`; }
function _right(n: number = 1): string { return `\u001b[${n}C`; }
function _left(n: number = 1): string { return `\u001b[${n}D`; }
function _next_line(n: number = 1): string { return `\u001b[${n}E`; }
function _prev_line(n: number = 1): string { return `\u001b[${n}F`; }
function _column(n: number): string { return `\u001b[${n}G`; }
function _position(x: number, y: number): string { return `\u001b[${y};${x}H`; }
let _save_position_code:string = `\u001b[s`;
let _load_position_code:string = `\u001b[u`;
let _clear_screen_code: string = `\u001b[2J`;
let _clear_line_code: string = `\u001b[K`;
let _hide_cursor_code: string = `\u001b[?25l`;
let _show_cursor_code: string = `\u001b[?25h`;

function _check_support(): Support {
    let env = process.env;
    let argv = process.argv;
    if(argv.indexOf("nocolor")>=0 || 
        argv.indexOf("nocolors")>=0)
        return Support.DISABLE;
    if(argv.indexOf("fullcolor")>=0 ||
        argv.indexOf("fullcolors")>=0 ||
        argv.indexOf("truecolor")>=0 ||
        argv.indexOf("truecolors")>=0 ||
        argv.indexOf("color24bits")>=0)
        return Support.ANSI24bits;
    if(argv.indexOf("websafe")>=0 || 
        argv.indexOf("color256")>=0)
        return Support.ANSI256;
    if(argv.indexOf("colorbase")>=0 ||
        argv.indexOf("basecolors")>=0)
        return Support.BASE;

    if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Support.ANSI256;
		}

		return Support.BASE;
    }
    if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return Support.BASE;
		}
		return Support.DISABLE;
	}
	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}
	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Hyper':
				return Support.ANSI24bits;
			case 'Apple_Terminal':
				return Support.ANSI256;
			// No default
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

    for (const key in _codes_base) {
        let ctrl = _codes_base[key]
        if (ctrl == null)
            continue;
        Object.defineProperty(String.prototype, key, {
            get: function (): string {
                if (_enable) {
                    if(_support < Support.BASE)
                        return this;
                    if (_check_reset_end(<string>this))
                        return ctrl + this;
                    else
                        return ctrl + this + _reset_ctrl;
                }
                else
                    return this;
            },
            enumerable: false,
            configurable: false
        })
    }

    String.prototype.color_at_256 = function (idx: number): string {
        if (_check_reset_end(<string>(this)))
            return _get_256bits_color_code(idx) + this;
        else
            return _get_256bits_color_code(idx) + this + _reset_ctrl;
    }

    String.prototype.color_bg_at_256 = function (idx: number): string {
        if (_check_reset_end(<string>(this)))
            return _get_256bits_color_bg_code(idx) + this;
        else
            return _get_256bits_color_bg_code(idx) + this + _reset_ctrl;
    }

    String.prototype.gray = function (level: number): string {
        if (_check_reset_end(<string>(this)))
            return _get_gray_code(level) + this;
        else
            return _get_gray_code(level) + this + _reset_ctrl;
    }
    String.prototype.grey = String.prototype.gray;

    String.prototype.gray_bg = function (level: number): string {
        if (_check_reset_end(<string>(this)))
            return _get_gray_bg_code(level) + this;
        else
            return _get_gray_bg_code(level) + this + _reset_ctrl;
    }
    String.prototype.grey_bg = String.prototype.gray_bg;

    String.prototype.colors = function (color: string | string[], noreset?: boolean): string {
        return colors(color, this, noreset);
    }

    String.prototype.hex = function (hex:string): string {
        return _get_color_by_hex(hex, false) + this + _reset_ctrl;
    }

    String.prototype.hex_bg = function (hex:string): string {
        return _get_color_by_hex(hex, true) + this + _reset_ctrl;
    }

    String.prototype.rgb = function (r:number, g:number, b:number): string {
        return _get_color_by_rgb(r, g, b, false) + this + _reset_ctrl;
    }

    String.prototype.rgb_bg = function (r:number, g:number, b:number): string {
        return _get_color_by_rgb(r, g, b, true) + this + _reset_ctrl;
    }

    String.prototype.paint = function (pt: Painter[]): string {
        return paint(pt, this);
    }

    String.prototype.up = function (n: number): string {
        return _up(n) + this;
    }
    String.prototype.down = function (n: number): string {
        return _down(n) + this;
    }
    String.prototype.right = function (n: number): string {
        return _right(n) + this;
    }
    String.prototype.left = function (n: number): string {
        return _left(n) + this;
    }

    String.prototype.next_line = function (n: number): string {
        return _next_line(n) + this;
    }
    String.prototype.prev_line = function (n: number): string {
        return _prev_line(n) + this;
    }
    String.prototype.column = function (n: number): string {
        return _column(n) + this;
    }
    String.prototype.position = function (x: number, y: number): string {
        return _position(x, y) + this;
    }
    Object.defineProperty(String.prototype, "load_position", {
        get: function (): string {
            return _load_position_code + this;
        },
        enumerable: false,
        configurable: false
    })
    Object.defineProperty(String.prototype, "save_position", {
        get: function (): string {
            return _save_position_code + this;
        },
        enumerable: false,
        configurable: false
    })
    Object.defineProperty(String.prototype, "clear_screen", {
        get: function (): string {
            return _clear_screen_code + this;
        },
        enumerable: false,
        configurable: false
    })
    Object.defineProperty(String.prototype, "clear_line", {
        get: function (): string {
            return _clear_line_code + this;
        },
        enumerable: false,
        configurable: false
    })
}

function _theme_init() {
    for (const key in _theme) {
        let _key = key;
        Object.defineProperty(String.prototype, key, {
            get: function (): string {
                if (_enable) {
                    let s = _theme[key];
                    if (s == null)
                        return this;
                    return colors(s, this);
                }
                return this;
            },
            enumerable: false,
            configurable: false
        })
    }
}

let _ready: boolean = false;
function _init()
{
    if(_ready)
        return;
    _ready = true;
    _color_web_safe_map_init();
    _codes_init();
    _theme_init();
}
_init();

export function colors(color: string | string[], value: string, noreset?: boolean): string {
    if (_enable) {
        if(_support < Support.BASE)
            return value;
        if (typeof (color) == "string") {
            let s: string | string[] = _theme[color]
            if (s != null)
                return colors(s, value);

            var code = _get_code(color);
            if(code == null)
                return value;
            if(noreset)
                return code + value;
            return code + value + _reset_ctrl;
        }
        else {
            let result = value;
            for (let i = color.length - 1; i >= 0; --i) {
                var code = _get_code(color[i]);
                if (code != null)
                    result = code + result;
            }
            if(noreset)
                return result;
            return result + _reset_ctrl;
        }
    }
    return value;
}

export function enable(value: boolean = true) {
    _enable = value;
}

export function support(support?: Support): Support
{
    if(support != null)
        _support = support;
    return _support;
}

export function theme(theme: { [key: string]: string | string[] } = _default_theme) {
    if (theme == null)
        _theme = _default_theme;
    else
        _theme = theme;
}

export function position(x:number, y:number)
{
    process.stdout.write(_position(x, y));
}

export function clear_screen() {
    process.stdout.write(_clear_screen_code);
}

export function show_cursor(show:boolean = true) {
    process.stdout.write(show ? _show_cursor_code : _hide_cursor_code);
}

export function more_detail_on_color256(value:boolean = true): boolean {
    _more_detail_on_color256 = value;
    return _more_detail_on_color256;
}

function replace_all(value: string, search: string, replace: string): string {
    if (search == null || search.length == 0)
        return value;
    let idx = -1;
    let array: string[] = [];
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
    for (let i = 0; i < array.length; ++i) {
        value += array[i];
    }
    return value;
}

export interface Painter
{
    // match mode, string, regex, array of string, array of regex
    key: string | string[] | RegExp | RegExp[];
    // color style
    // keyword, like "underline", "bold", "red", "green", "bg_reg", "bg_green"
    // hexcode, like "#ff00ff", "#337011"
    // hexcode for bg, like "b#ff00ff", "b#337011"
    // graycode like "g11", "g25"
    // graycode fro by like "bg11, "bg25""
    colors: string | string[];
}

export function paint(paint: Painter[], value: string): string {
    if (!_enable || paint == null || value == null || value.length == 0 || paint.length == 0)
        return value;
    for (let i = 0; i < paint.length; ++i) {
        let item = paint[i];
        let key = item.key;
        let cs = item.colors;

        if (key == null || cs == null || colors.length == 0)
            continue;

        if (typeof (key) == "string") {
            value = replace_all(value, key, colors(cs, key))
        }
        else if (key instanceof RegExp) {
            value = value.replace(key, (ar) => {
                return colors(cs, ar);
            })
        }
        else {
            if (key.length == 0)
                return value;
            if (typeof (key[0]) == "string") {
                //string[]
                for (let idx = 0; idx < key.length; ++idx) {
                    let k = <string>key[idx];
                    value = replace_all(value, k, colors(cs, k));
                }
            }
            else {
                //RegExp[]
                for (let idx = 0; idx < key.length; ++idx) {
                    value = value.replace(key[idx], (ar) => {
                        return colors(cs, ar);
                    })
                }
            }
        }
    }
    return value;
}



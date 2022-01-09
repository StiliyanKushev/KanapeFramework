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

declare global {
    interface String {
        reset: string;
        bold: string;
        dim: string;
        italic: string;
        underline: string;
        inverse: string;
        hidden: string;
        strikethrough: string;

        black: string;
        red: string;
        green: string;
        yellow: string;
        blue: string;
        magenta: string;
        cyan: string;
        white: string;
        //gray: string;
        //grey: string;

        bg_black: string;
        bg_red: string;
        bg_green: string;
        bg_yellow: string;
        bg_blue: string;
        bg_magenta: string;
        bg_cyan: string;
        bg_white: string;

        //theme
        verbose: string;
        info: string;
        warning: string;
        debug: string;
        error: string;

        custom0: string;
        custom1: string;
        custom2: string;
        custom3: string;
        custom4: string;
        custom5: string;
        custom6: string;
        custom7: string;
        custom8: string;
        custom9: string;

        //[0, 255]
        color_at_256(idx:number):string;
        color_bg_at_256(idx:number):string;
        //[0, 25]
        gray(level:number):string;
        grey(level:number):string;
        gray_bg(level:number):string;
        grey_bg(level:number):string;
        // [000000, ffffff]
        hex(hex:string): string;
        hex_bg(hex:string): string;
        // [0, 255]
        rgb(r:number, g:number, b:number): string;
        rgb_bg(r:number, g:number, b:number): string;

        // keyword, #000000, b#000000
        colors(color:string|string[], noreset?:boolean):string;
        paint(paint:Colors.Painter[]):string;

        up(n?:number):string;
        down(n?:number):string;
        right(n?:number):string;
        left(n?:number):string;
        
        next_line(n?:number):string;
        prev_line(n?:number):string;
        column(n:number):string;
        position(x:number, y:number):string;
        save_position:string;
        load_position:string;

        clear_screen:string;
        clear_line:string;
    }
}

declare namespace Colors
{
    export enum Support {
        DISABLE = 0, 
        BASE = 1,
        ANSI256 = 2, 
        ANSI24bits = 3,
    }
    // Painter
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
    export function colors(color: string|string[], value: string, noreset?: boolean):string;
    export function enable(value?: boolean): void;
    export function support(support?: Support): Support;
    export function more_detail_on_color256(value?: boolean): boolean;
    export function theme(theme?: {[key:string]:string|string[]}): void;
    export function paint(paint:{key:string|string[]|RegExp|RegExp[], colors:string|string[]}[], value:string):string
    export function position(x:number, y:number): void;
    export function clear_screen(): void;
    export function show_cursor(show?: boolean): void;
}
export = Colors;
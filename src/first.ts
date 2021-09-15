// import { Vector } from "matter-js";


let __ = undefined;

let gvar = {} as any;

let lastClickedObject = undefined;


type num = number;
type tup = Array<number>;
type tup3 = [num, num, num];
// type vec = Vector;
let _hex = function () {
    function _componentToHex(c: number) {
        var hex = Math.round(Math.min(c, 255)).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    let hex = function (r: num, g: num, b: num, ...extras: num[]) {
        return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
    }
    return hex;
}();
function _rgb(hex: string): [num,num,num] {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r,g,b];
}
function assert(condition: any, message?: any) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
    return condition;
}

class CollisionFilters {
    group = 0;
    category; // 2^0
    mask; // 4294967293
    // all 0b111...1101 except category 2
    constructor(category: num, mask: num, group = 0) {
        if (group) this.group = group;
        if (category) this.category = category;
        if (mask) this.mask = mask;
    }
    static readonly SOLID = new CollisionFilters(1, 0xFFFFFFFF);
    static readonly MOUSE = new CollisionFilters(2, 0xFFFFFFFF);
    static readonly WALL = new CollisionFilters(4, 0xFFFFFFFF);
    static readonly GASLIKE = new CollisionFilters(8, 2 + 4); // only collide with walls and the mouse constraint
    

}
enum ScreenState {
    PAUSED, RUNNING, CREDITS
}
let universe = {} as { engine: Matter.Engine, world: Matter.World, runner: Matter.Runner, paused: Boolean, screenstate: ScreenState };
universe.paused = false;

function getCanvas(): HTMLCanvasElement {
    let canvas = document.getElementById("canvas");

    if (canvas && canvas instanceof HTMLCanvasElement) {
        return canvas;
    } else {
        throw new TypeError("Canvas doesn't exist?");
    }
}
function getCanvasContext(canvas?: HTMLCanvasElement): CanvasRenderingContext2D {
    if(!canvas) {
        canvas = getCanvas();
    }
    let ctxt = canvas.getContext("2d");
    if (ctxt === null) throw new TypeError("Context is null?");
    return ctxt;
}
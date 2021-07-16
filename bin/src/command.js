"use strict";
/// <reference path='ptable.ts'/>
// H2O (l) 2mol 
// H2O(l) 2mol
// H2O (l) 5mL
// CH3CH2OH(l) 16g
var Tokenized = /** @class */ (function () {
    function Tokenized() {
        this.tokens = [];
    }
    return Tokenized;
}());
var ElementTracker = /** @class */ (function () {
    function ElementTracker() {
        this._elems = [];
        this._qtys = [];
    }
    ElementTracker.prototype.push = function (elem, qty) {
        if (qty === void 0) { qty = 1; }
        this._elems.push(elem);
        this._qtys.push(qty);
    };
    ElementTracker.prototype.setLastQty = function (qty) {
        this._qtys[this._qtys.length - 1] = qty;
    };
    return ElementTracker;
}());
var TokenBuilder = /** @class */ (function () {
    function TokenBuilder() {
        this.elemt = new ElementTracker();
        // elems: string[] = [];
        this.formula = '';
        this.state = '';
        this.qty = '';
    }
    return TokenBuilder;
}());
function _isLower(inp) {
    return inp.length === 1 && 'abcdefghijklmnopqrstuvwxyz'.includes(inp);
}
function _isCapital(inp) {
    return inp.length === 1 && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(inp);
}
function _isNumeric(inp) {
    return inp.length === 1 && '1234567890'.includes(inp);
}
var gbdr = new TokenBuilder();
function formulaTknr(inp, startidx, bdr) {
    if (startidx === void 0) { startidx = 0; }
    if (bdr === void 0) { bdr = gbdr; }
    // TODO: Ambiguous statement: CaRbON
    // CAlcium RuBidium Oxygen Nitrogen = CARBON
    // let elems = [];
    bdr.elemt = new ElementTracker();
    var elemt = bdr.elemt;
    var ptree = ptable_symb_tree;
    var i = startidx;
    function sliceUpTo(newidx) {
        bdr.formula = inp.slice(startidx, newidx);
        return [bdr.formula, newidx];
    }
    for (; i < inp.length; i++) {
        var c = inp[i];
        if (_isCapital(c)) {
            // start searching the tree
            if (!(c in ptable_symb_tree))
                throw "Couldn't find capital letter " + c + " as a chemical element name at index " + i + " of " + inp + " ";
            var capital = c;
            var possibs = ptree[c];
            // look ahead one
            if (i + 1 >= inp.length) {
                // uh oh an elem wont fit and we reached the end
                // if at the end, then it signals a single capital at the end - for example H2O.
                if (possibs.includes('')) {
                    elemt.push(capital);
                }
                else { // error
                    throw "bad query";
                }
                // we're at the end so 
                return sliceUpTo(i + 1);
            }
            var next = inp[i + 1];
            if (_isLower(next)) {
                if (possibs.includes(next)) {
                    elemt.push('' + capital + next);
                    i++;
                    continue;
                }
                else if (capital == 'U' && next == 'u') { // // special case for Uue
                    if (i + 2 >= inp.length) // uh oh an elem wont fit and we reached the end
                        throw "bad query"; // and 'Uu' is not a possible elem
                    if (inp[i + 2] == 'e') {
                        elemt.push('Uue');
                        i += 2; // the incrementer adds one at the end
                        continue;
                    }
                    else { // then 'Uux' is not a possible elem
                        throw "bad query";
                    }
                }
                else {
                    throw "bad query";
                    // what to do
                    // the lower case letter is not in 
                }
            }
            else {
                // if not a lower case, then it might be a number or it just might be the empty char ie. oxygen - O
                if (possibs.includes('')) {
                    elemt.push(capital);
                }
                else {
                    // error
                    throw "bad query";
                }
            }
        }
        else if (_isLower(c)) {
            // this should never happen! Only if it's a weird lower letter
            // actually this happens when we don't have a capital or when it is not a valid Symbol
            // ie if you query "ethanol (l)"
            // or "sodium acetate (aq)"
        }
        else if (_isNumeric(c)) {
            var _a = numberTknr(inp, i, 0), number = _a[0], newidx = _a[1];
            elemt.setLastQty(parseInt(number)); // TODO sanitation
            i = newidx - 1;
        }
        else if (c === '(') {
            // throw "unimplemented";
            var _b = parenthesizer(inp, i), parens = _b[0], newidx = _b[1];
            if (parens == '')
                continue; // if nothing to parenthesize then let's just move on and ignore it
            if (!(parens[0] === '(' && parens[parens.length - 1] === ')'))
                throw "parenthesizer returned a fragment that doesn't both start and end with parentheses: " + parens;
            var insides = parens.slice(1, parens.length - 1);
            if (insides === 's') {
                // It could be a lone sulfur as a polyatomic ion
                // although wtf
                // Al2(S)3 7mL 
                // bdr.formula = inp.slice(startidx, i);
                // we reached a state of matter. we can stop now
                bdr.state = 's';
                return sliceUpTo(newidx); // [inp.slice(startidx, newidx), newidx];
            }
            else if (insides === 'l' || insides === 'L') {
                bdr.state = 'l';
                return sliceUpTo(newidx); //[inp.slice(startidx, newidx), newidx];
            }
            else if (insides === 'g' || insides === 'G') {
                bdr.state = 'g';
                return sliceUpTo(newidx); //[inp.slice(startidx, newidx), newidx];
            }
            else if (insides.toLowerCase() === 'aq') {
                bdr.state = 'aq';
                return sliceUpTo(newidx); //[inp.slice(startidx, newidx), newidx];
            }
            else {
                // then it's probably a polyatomic ion
                // like Mg(OH)2g
                bdr.elemt.push(parens);
                i = newidx - 1;
                continue;
            }
        }
        else if (c === ' ') {
            // ooh this is tough. Should we ignore whitespace or treat it as a delimiter?
            // well certain situations it's important to terat it as a delim
            // ie. H2O 5ml
            // but in other circumstances we should look ahead before returning
            // ie. H2O (g) 5mol
            // let next = inp[i+1];
            // if(next)
            var _c = whitespaceTknr(inp, i), __ = _c[0], newidx = _c[1];
            if (newidx >= inp.length)
                return sliceUpTo(i); // [inp.slice(startidx, i), i]; // if we reach the end then return and ignore the whitesp
            var c2 = inp[newidx];
            if (c2 == '(') {
                // go run the parenthesizer
                i = newidx - 1;
                // this will get incremented at the end of the loop so
                // i = (newidx-1)++ = newidx
                // at the next inp[i] = inp[newidx] = '(' --  there's NO infinite loop
                // TODO this means that you can do something like 
                // Mg        (OH)2
                // or Al2         (SO4)3
                // eh intended behavior
            }
            else if (_isNumeric(c2)) {
                // in these circumstances it's probably safe to assume that that number is a quantity
                // ie. CH3OH 2mL
                // although that means that we can't accept spaces between the element and its (subscript) quantity
                // ie. `H2O 2` wouldn't be parsed as H2O2
                // although that means `Al 2 (SO4) 3` would be illegal
                return [sliceUpTo(i), newidx];
            }
        }
        else {
        }
    }
    return sliceUpTo(i); //[inp.slice(startidx, i), i];
}
/**
 * You must include the starting parenthesis in the idx
 * // ie. if you tokenize Mg(OH)2 you must start on
 * index 2 which is the opening paren '('.
 * @param inp
 * @param startidx
 */
function parenthesizer(inp, startidx) {
    if (startidx === void 0) { startidx = 0; }
    if (inp[startidx] !== '(')
        throw "You must include the starting parenthesis in the idx! " + inp + "[" + startidx + "] === " + inp[startidx];
    var parenlvl = 1;
    for (var i = startidx + 1; i < inp.length; i++) {
        var c = inp[i];
        if (c === '(') {
            parenlvl++;
        } // check for monoatomic ions
        else if (c === ')') {
            parenlvl--;
        }
        if (parenlvl === 0) {
            return [inp.slice(startidx, i + 1), i + 1];
        }
    }
    // the parenthesis was never closed
    return ["", startidx];
}
/**
 * You must include the starting string opener (either '' or "") in the idx
 * // ie. if you tokenize Mg(OH)2 you must start on
 * index 2 which is the opening paren '('.
 * @param inp
 * @param startidx
 * @param escape_char
 * leave as empty string or undefined to not have an escape char
 */
function stringTknr(inp, startidx, escape_char) {
    if (startidx === void 0) { startidx = 0; }
    if (escape_char === void 0) { escape_char = "\\"; }
    var sc = undefined;
    if (inp[startidx] === '"') {
        sc = '"';
    }
    else if (inp[startidx] === "'") {
        sc = "'";
    }
    else
        throw "First char must be either ' or \"! " + inp + "[" + startidx + "] === " + inp[startidx];
    // let parenlvl = 1;
    var isEscaped = false;
    for (var i = startidx + 1; i < inp.length; i++) {
        var c = inp[i];
        if (c === escape_char) {
            isEscaped = !isEscaped; // use the fact that two escapes cancel each other out.
        }
        else {
            if (c === sc && !isEscaped) {
                return [inp.slice(startidx, i + 1), i + 1];
            }
            isEscaped = false;
        }
    }
    // the string was never closed
    return ["", startidx];
}
function numberTknr(inp, startidx, max_dots) {
    if (startidx === void 0) { startidx = 0; }
    if (max_dots === void 0) { max_dots = 1; }
    var nums = '0123456789';
    var num_dots = 0;
    for (var i = startidx; i < inp.length; i++) {
        var c = inp[i];
        if (nums.includes(c)) {
            continue;
        }
        else if (c === '.') {
            num_dots++;
            if (num_dots > max_dots)
                return [inp.slice(startidx, i), i];
            // } else if(c === 'e') {
            // TODO: support scientific notation
            // ie. 7.384e9
            // or  4.106*10^-4
            // return [inp.slice(startidx, i), i];
        }
        else {
            return [inp.slice(startidx, i), i];
            // on anything else, break
        }
    }
    // if we get here, then we must have successfully ran until the end
    return [inp.slice(startidx), inp.length];
}
function sciNumberTknr(inp, startidx, max_dots) {
    if (startidx === void 0) { startidx = 0; }
    if (max_dots === void 0) { max_dots = 1; }
    var _a = numberTknr(inp, startidx, max_dots), numstr = _a[0], newidx = _a[1];
    if (newidx < inp.length) {
        if (numstr == '')
            return ['', startidx];
        // only if there's a numeral do we continue looking for e
        // ie. just a simple "e10" will not do, it has to be "4.683e10"
        if (inp[newidx] === 'e' || inp[newidx] === 'E') {
            var _b = numberTknr(inp, newidx, 0), mantissa = _b[0], new2 = _b[1];
            return [inp.slice(startidx, new2), new2];
        }
        else if (inp.slice(newidx).startsWith('*10^')) {
            // TODO allow spaces
            throw "unimplemented";
        }
        // this is a sci notated number
    }
    return [numstr, newidx]; // the numeral is at the end of the string and completely fills it. just return that numeral
    //  ['', startidx];
}
function whitespaceTknr(inp, startidx) {
    if (startidx === void 0) { startidx = 0; }
    var spaces = ' \n\t';
    for (var i = startidx; i < inp.length; i++) {
        var c = inp[i];
        if (spaces.includes(c)) {
            continue;
        }
        else {
            return [inp.slice(startidx, i), i];
            // on anything else, break
        }
    }
    // if we get here, then we must have successfully ran until the end
    return [inp.slice(startidx), inp.length];
}
function matchTknr(inp, rfncstr, startidx) {
    if (rfncstr === void 0) { rfncstr = ''; }
    if (startidx === void 0) { startidx = 0; }
    if (rfncstr === '')
        throw "rfncstr must not be empty!";
    var j = 0;
    var i = startidx;
    for (; j < rfncstr.length;) {
        if (i > inp.length) {
            // then we ran out on our tape
            throw "not enough space in inp to accomodate rfncstr! inp:" + inp + " rfncstr:" + rfncstr + " idx:" + startidx;
        }
        if (inp[i] === rfncstr[j]) {
            i++;
            j++;
            continue;
        }
        else {
            // discrepancy detected
            return ['', startidx];
        }
    }
    // we continued the entire time
    var sliced = inp.slice(startidx, i);
    if (sliced !== rfncstr)
        throw ReferenceError("AssertionError: " + sliced + " should equal " + rfncstr + "! " + inp + " " + startidx + " " + i);
    return [sliced, i];
    // the inp ran out before rfncstr
}
var QuantitiesBuilder = /** @class */ (function () {
    function QuantitiesBuilder() {
        this.qtys = [];
        this.units = [];
    }
    QuantitiesBuilder.prototype.push = function (qty, unit) {
        this.qtys.push(qty);
        this.units.push(unit);
    };
    return QuantitiesBuilder;
}());
var gqbdr = new QuantitiesBuilder();
function qtyTknr(inp, startidx, qbdr) {
    if (startidx === void 0) { startidx = 0; }
    if (qbdr === void 0) { qbdr = gqbdr; }
    // notice that "mL L g aq kg mol mmol" all can't be formed by chemical symbols
    // However Mg can 
    // return ['', 0]; // TODO
    var _a = whitespaceTknr(inp, startidx), __ = _a[0], idx = _a[1];
    if (_isNumeric(inp[idx])) {
        // ah good
        var _b = numberTknr(inp, idx), num = _b[0], idx2 = _b[1];
        if (num === '') {
            // if we don't find a number
            return ['', startidx];
        }
        var _c = whitespaceTknr(inp, idx2), __1 = _c[0], idx3 = _c[1];
        var _d = SI_tknr(inp, idx3), si = _d[0], idx4 = _d[1];
        if (si === '') {
            // if we don't find a SI unit
            return ['', startidx];
        }
        qbdr.push(parseFloat(num), si);
        return [inp.slice(startidx, idx4), idx4];
        /*
        let reader = inp.slice(idx3);
        if(reader.slice(0,2).toLowerCase() === "ml") {

        } else if(reader.slice(0,1).toLowerCase() === 'l') {

        } else if (reader.slice(0, 1) === 'g') {
            
        } else if (reader.slice(0, 2).toLowerCase() === 'kg') {

        } else if (reader.slice(0, 3).toLowerCase() === 'mol') {

        } else if (reader.slice(0, 4).toLowerCase() === 'mmol') {

        }
        */
    }
    else {
        // if there's no number then
        // either it's the currently unimplemented method
        // V=3mL etc.
        // or it's not a quantity
        return ['', startidx];
        // throw "quantity tokenizer didn't find a ";
    }
}
/**
 * Parses and tokenizes SI Units
 */
function SI_tknr(inp, startidx, base_units) {
    if (startidx === void 0) { startidx = 0; }
    if (base_units === void 0) { base_units = ['g', 'L', 'mol', 'M', 'm', 'J', 'V', 'W-h']; }
    var si_prefixes = ['n', 'µ', 'm', 'c', 'd', '', 'k'];
    // for(let i=startidx;i<inp.length;i++) {
    var c = inp[startidx];
    var i2 = 0;
    var s2 = '';
    if (si_prefixes.includes(c)) {
        // we're not in the clear yet. We have to find a matching base unit
        i2 = startidx + 1;
    }
    else {
        // we don't have a prefix, it's just the regular base unit
        i2 = 1;
    }
    var max = i2 + 3 > inp.length ? inp.length : i2 + 3;
    s2 = inp.slice(i2, max); // max length of base_units = 3
    for (var _i = 0, base_units_1 = base_units; _i < base_units_1.length; _i++) {
        var base = base_units_1[_i];
        if (s2.startsWith(base)) {
            // first check for a closing condition - no letters behind
            var nextidx = startidx + 1 + base.length;
            if (nextidx < inp.length) {
                // if there's more characters, we need to check that
                // there aren't any additional letters
                // for example, `cLasp` shouldn't be recognized as `cL`
                if (_isCapital(inp[nextidx]) || _isLower(inp[nextidx]))
                    continue;
            }
            return [inp.slice(startidx, 1 + base.length), 1 + base.length];
        }
    }
    // no match
    return ['', startidx];
    // }
}

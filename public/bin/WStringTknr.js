"use strict";
function WStringTknr(inp, startidx = 0) {
    if (startidx >= inp.length)
        throw ReferenceError("bruh"); // really?
    if (_isNumeric(inp[startidx])) {
        let qbdr = new QtyUnitList();
        let [qty, idx] = quantitiesTknr(inp, startidx, qbdr);
        let [__, idx2] = whitespaceTknr(inp, idx);
        let fbdr = new SaveCustomChemicalInput();
        let [formula, idx3] = formulaTknr(inp, idx2, fbdr);
        return [fbdr, qbdr];
    }
    else {
        let fbdr = new SaveCustomChemicalInput();
        let [formula, idx] = formulaTknr(inp, startidx, fbdr);
        let qbdr = new QtyUnitList();
        let [qty, idx2] = quantitiesTknr(inp, idx, qbdr);
        let [__, idx3] = whitespaceTknr(inp, idx2);
        return [fbdr, qbdr];
    }
}
function tang(s, addToGlobal = true, pos, size) {
    let ret = phys(s);
    if (addToGlobal) {
        if (ret instanceof Substance) {
            // glob.substances.push(ret);
            glob.addSubst(ret);
        }
        else if (ret instanceof SubstGroup) {
            glob.subsystems.push(ret);
        }
        else
            throw "s " + ret + "not instanceof System nor Substance!";
    }
    // console.log('disp!')
    Wdispatch('substanceCreated', { 'substance': s });
    return ret;
}
let W = function (inp, display = true) {
    let subst;
    let [chem, qty] = WStringTknr(inp);
    // form.formula
    let formula = chem.formula;
    let protos = undefined;
    if (chemicals.has(formula)) {
        protos = chemicals.get(formula);
    }
    else {
        protos = chemicals.saveCustom(chem);
        console.log(`formula ${formula} not found in list of chemicals. autogenerating...`);
    }
    if (protos) {
        // let pargs = protos.args();
        // let qbuild = qty.toBuilder();
        subst = protos.amt(qty.computed(), chem.state);
    }
    else {
        throw protos;
    }
    // } else {
    if (display) {
        tang(subst);
        updateZIndex();
        redraw();
        return subst;
    }
    else {
        return subst;
    }
    // TODO: with a greedy algorithm, we can
    // actually attempt to process formulas that
    // are 'lazily' in all lower case. for
    // example kmno4. 
    // although by definition it won't always work - see no
    // or hga - HGa
};
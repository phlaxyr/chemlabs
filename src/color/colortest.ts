// let spectra_kmno4 = [[260.0, 38.225853516194924], [270.0, 22.760431864604612], [280.0, 18.52932594105632], [290.0, 39.10125474175665], [300.0, 59.38138313393639], [310.0, 70.6156988619784], [320.0, 67.40589436825212], [330.0, 60.98628538079953], [340.0, 58.06828129559382], [350.0, 56.17157864021011], [360.0, 50.33557046979866], [370.0, 40.41435658009922], [380.0, 30.493142690399765], [390.0, 22.760431864604612], [400.0, 17.6539247154946], [410.0, 14.444120221768312], [420.0, 12.255617157864021], [430.0, 12.547417566384594], [440.0, 12.839217974905164], [450.0, 14.444120221768312], [460.0, 17.362124306974028], [470.0, 23.781733294426612], [480.0, 30.201342281879196], [490.0, 41.727458418441785], [500.0, 53.253574555004384], [510.0, 63.758389261744966], [520.0, 75.72220601108842], [530.0, 78.49430989203385], [540.0, 73.67960315144441], [550.0, 73.09600233440327], [560.0, 47.12576597607237], [570.0, 44.20776189086665], [580.0, 23.344032681645757], [590.0, 11.23431572804202], [600.0, 8.608112051356873], [610.0, 7.732710825795157], [620.0, 7.003209804493728], [630.0, 6.419608987452582], [640.0, 6.127808578932011], [650.0, 5.398307557630581], [660.0, 4.522906332068866], [670.0, 3.793405310767435], [680.0, 2.9180040852057196], [690.0, 2.6262036766851473], [700.0, 2.1885030639042893], [710.0, 2.1885030639042893], [720.0, 1.6049022468631455], [730.0, 1.6049022468631455], [740.0, 1.6049022468631455]];

import { f_daylight } from "./color";

// let spectra_kmno4 = [[260.0, 38.225853], [270.0, 22.760431], [280.0, 18.529325], [290.0, 39.101254], [300.0, 59.381383], [310.0, 70.615698], [320.0, 67.405894], [330.0, 60.986285], [340.0, 58.068281], [350.0, 56.171578], [360.0, 50.335570], [370.0, 40.414356], [380.0, 30.493142], [390.0, 22.760431], [400.0, 17.653924], [410.0, 14.444120], [420.0, 12.255617], [430.0, 12.547417], [440.0, 12.839217], [450.0, 14.444120], [460.0, 17.362124], [470.0, 23.781733], [480.0, 30.201342], [490.0, 41.727458], [500.0, 53.253574], [510.0, 63.758389], [520.0, 75.722206], [530.0, 78.494309], [540.0, 73.679603], [550.0, 73.096002], [560.0, 47.125765], [570.0, 44.207761], [580.0, 23.344032], [590.0, 11.234315], [600.0, 8.608112], [610.0, 7.732710], [620.0, 7.003209], [630.0, 6.419608], [640.0, 6.127808], [650.0, 5.398307], [660.0, 4.522906], [670.0, 3.793405], [680.0, 2.918004], [690.0, 2.626203], [700.0, 2.188503], [710.0, 2.188503], [720.0, 1.604902], [730.0, 1.604902], [740.0, 1.604902]];
export let spectra_kmno4_f = function() {
    let spectra_kmno4 = [[260.0, 0.262], [270.0, 0.156], [280.0, 0.127], [290.0, 0.268], [300.0, 0.407], [310.0, 0.484], [320.0, 0.462], [330.0, 0.418], [340.0, 0.398], [350.0, 0.385], [360.0, 0.345], [370.0, 0.277], [380.0, 0.209], [390.0, 0.156], [400.0, 0.121], [410.0, 0.099], [420.0, 0.084], [430.0, 0.086], [440.0, 0.088], [450.0, 0.099], [460.0, 0.119], [470.0, 0.163], [480.0, 0.207], [490.0, 0.286], [500.0, 0.365], [510.0, 0.437], [520.0, 0.519], [530.0, 0.538], [540.0, 0.505], [550.0, 0.501], [560.0, 0.323], [570.0, 0.303], [580.0, 0.16], [590.0, 0.077], [600.0, 0.059], [610.0, 0.053], [620.0, 0.048], [630.0, 0.044], [640.0, 0.042], [650.0, 0.037], [660.0, 0.031], [670.0, 0.026], [680.0, 0.02], [690.0, 0.018], [700.0, 0.015], [710.0, 0.015], [720.0, 0.011], [730.0, 0.011], [740.0, 0.011]];
    let spectra_kmno4_f = function(x: number) {
        // linear interpolation
        if(x > 740) x = 740;
        if(x < 260) x = 260;

        let floored = Math.floor(x / 10);
        let diff = x - 10 * floored;
        let idx = floored - 26;//(floored > 46 ? 46 : floored) - 26;

        // let factor = // 1 / 46/(149 * 10 ^ -6);
        let divisor  = 46 * 149 * 10e-6;
        // return spectra_kmno4[idx][1];
        if (diff === 0) return spectra_kmno4[idx][1] / divisor;

        return ((spectra_kmno4[idx + 1][1] - spectra_kmno4[idx][1]) / 10 * diff + spectra_kmno4[idx][1]) / divisor; // normalize it somewhat by dividing by 72

        // return spectra_kmno4[(y > 46 ? 46 : y) - 26][1];
    };
    return spectra_kmno4_f;
}();
export let transmittance = function(molar_absorbt: num, concen: any =1 , length_traveled: num = 1): num {
    return Math.pow(10, -molar_absorbt * length_traveled * concen);
}
//rgb_from_xyz(xyz_from_spectrum(x => transmittance(spectra_kmno4_f(x), 1)));
export let rgb_from_spectrum_concen = function(spectra_f:(wl: num) => num, concen:num) {
    return rgb_from_spectrum(x => f_daylight(x) * transmittance(spectra_f(x), concen));

}


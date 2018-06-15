let variable = null;
/**
 *
 * Key: variable name
 *
 * Value: {
 *           variableLink: urlVariable,
 *           attributes: []
 *        }
 *
 */
let variablesMap = new Map();

/**
 *
 * Elements with form of:
 * {
 *    name: 'chart1',
 *    test: 'maximum',
 *    testAttr: 'seplen',
 *    attr: 'class',
 *    testOrig: 'max',
 *    chart: 'barchart'
 *    xLabel: {
 *       family: 'serif',
 *       color: 'red',
 *       weight: 'bold',
 *       size: '12'
 *    },
 *    yLabel: {
 *       family: 'serif',
 *       color: 'red',
 *       weight: 'bold',
 *       size: '12'
 *    }
 * }
 *
 */
let charts = [];

module.exports = {
    variable,
    variablesMap,
    charts
};

module.exports.createEntitiesArray = (arrIn, arrOut=[]) => {
    arrIn.forEach((element) => {
            arrOut.push({
               "value": `${element}`,
                "synonyms":[
                    `${element}`
                ]
            });
        });

    return arrOut;
};
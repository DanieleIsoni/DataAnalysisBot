let variable = null;
/**
 * Key: variable name
 *
 * Value: {
 *           variableLink: urlVariable,
 *           attributes: []
 *        }
 */
let variablesMap = new Map();

module.exports = {
    variable,
    variablesMap
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
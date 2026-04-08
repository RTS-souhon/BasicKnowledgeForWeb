const utils = {
    cssCalc: (value) => value,
    isColor: () => true,
    isGradient: () => false,
    splitValue: (value) => value.split(/\s+/),
};

function resolve(input) {
    return { type: 'color', format: 'mock', value: input };
}

module.exports = { resolve, utils };

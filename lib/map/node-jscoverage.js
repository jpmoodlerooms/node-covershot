exports.map = function (coverageMap, options) {
    var ret = {
        files: [],
        hits: 0,
        misses: 0,
        sloc: 0,
        instrumentation: 'node-jscoverage'
    };

    for (var filename in coverageMap) {
        if (coverageMap.hasOwnProperty(filename)) {
            var data = coverage(filename, coverageMap[filename]);
            if (passFilter(filename, options)) {
                ret.files.push(data);
                ret.hits += data.hits;
                ret.misses += data.misses;
                ret.sloc += data.sloc;
            }
        }
    }

    ret.coverage = (ret.hits / ret.sloc) * 100;

    return ret;
};

function passFilter(filename, options) {
    var result = true;

    if (options) {
        if (options.include && (options.include.startsWith || options.include.endsWith || options.include.equals)) {
            result = result && computeOptions(filename, options.include);
        }
        if (options.exclude && (options.exclude.startsWith || options.exclude.endsWith || options.exclude.equals)) {
            result = result && !computeOptions(filename, options.exclude);
        }
    }

    return result;
}

function computeOptions(filename, options) {
    var result = false;
    var startsWith = options.startsWith;
    var endsWith = options.endsWith;
    var equals = options.equals;

    if (startsWith) {
        if (Array.isArray(startsWith)) {
            result = result || startsWith.some(function(val) { return computeStartsWith(filename, val); });
        } else {
            result = result || computeStartsWith(filename, startsWith);
        }
    }
    if (endsWith) {
        if (Array.isArray(endsWith)) {
            result = result || endsWith.some(function(val) { return computeEndsWith(filename, val); });
        } else {
            result = result || computeEndsWith(filename, endsWith);
        }
    }
    if (equals) {
        if (Array.isArray(equals)) {
            result = result || equals.some(function(val) { return computeEquals(filename, val); });
        } else {
            result = result || computeEquals(filename, equals);
        }
    }

    return result;
}

function computeStartsWith(filename, startsWith) {
    return filename.substring(0, startsWith.length) === startsWith;
}

function computeEndsWith(filename, endsWith) {
    return filename.substring(filename.length - endsWith.length) === endsWith;
}

function computeEquals(filename, equals) {
    return filename === equals;
}

function coverage(filename, data) {
    var ret = {
        filename: filename,
        coverage: 0,
        hits: 0,
        misses: 0,
        sloc: 0,
        source: {}
    };

    data.source.forEach(function (line, num) {
        num++;

        if (data[num] === 0) {
            ret.misses++;
            ret.sloc++;
        } else if (data[num] !== undefined) {
            ret.hits++;
            ret.sloc++;
        }

        ret.source[num] = { line: line, coverage: (data[num] === undefined ? '' : data[num]) };
    });

    ret.coverage = (ret.hits / ret.sloc) * 100;

    return ret;
}

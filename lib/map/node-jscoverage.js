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
            if (passFilter(filename, options.filters)) {
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

function passFilter(filename, filters) {
    var result = true;

    if (filters && filters.length) {
        filters.forEach(function(filter) {
            if (filter.include) {
                result = result && applyFilter(filename, filter.include);
            } else if (filter.exclude) {
                result = result && !applyFilter(filename, filter.exclude);
            }
        });
    }

    return result;
}

function applyFilter(filename, filter) {
    if (filter.match) {
        return applyFilterPart(filename, filter.match, computeMatch);
    } else if (filter.startsWith) {
        return applyFilterPart(filename, filter.startsWith, computeStartsWith);
    } else if (filter.endsWith) {
        return applyFilterPart(filename, filter.endsWith, computeEndsWith);
    } else if (filter.equals) {
        return applyFilterPart(filename, filter.equals, computeEquals);
    }
    return false;
}

function applyFilterPart(filename, filter, compare) {
    if (Array.isArray(filter)) {
        return filter.some(function(val) { return compare(filename, val); });
    }
    return compare(filename, filter);
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

function computeMatch(filename, rx) {
    return filename.match(rx) ? true : false;
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

(function (exports) {

    var sum, mean, deviation, variance, standardDeviation, standardize, correlation;

 // @param {[number]} x Array of numbers.
    exports.sum = sum = function (x) {
        return x.reduce(function (previousValue, currentValue) {
            return previousValue + currentValue;
        });
    };

 // @param {[number]} x Array of numbers.
    exports.mean = mean = function (x) {
        return sum(x) / x.length;
    };

 // @param {[number]} x Array of numbers.
    exports.deviation = deviation = function (x) {
        var xBar;
        xBar = mean(x);
        return x.map(function (xi) {
            return xi - xBar;
        });
    };

 // Calculates the sample variance.
 // @param {[number]} x Array of numbers.
    exports.variance = variance = function (x) {
        return sum(deviation(x).map(function (xi) {
            return Math.pow(xi, 2);
        })) / (x.length - 1);
    };

 // Calculates the sample standard deviation.
 // @param {[number]} x Array of numbers.
    exports.standardDeviation = standardDeviation = function (x) {
        return Math.sqrt(variance(x));
    };

 // @param {[number]} x Array of numbers.
    exports.standardize = standardize = function (x) {
        var sd;
        sd = standardDeviation(x);
        return deviation(x).map(function (xi) {
            return xi / sd;
        });
    };

 // Calculates the Pearson correlation coefficient for two variables.
 // @param {[number]} x Array of numbers.
 // @param {[number]} y Array of numbers.
    exports.correlation = correlation = function (x, y) {
        x = standardize(x);
        y = standardize(y);
        return sum(x.map(function (xi, i) {
            return xi * y[i];
        })) / (x.length - 1);
    };

}(typeof exports === "undefined" ? this["stats"] = {} : exports));
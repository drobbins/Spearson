(function (exports) {
    "use strict";

    var sort, round, min, max, range, sum, mean, deviation, variance, standardDeviation, standardize,
        rank, correlation, distance, pairwiseDistance, hierarchicalClustering;

 // @param {[number]} x Array of numbers.
    exports.sort = sort = function (x) {
        return x.sort(function (a, b) {
            return a - b;
        });
    };

 // @param {number} x Number to round.
 // @param {number} [n] Number of decimal places.
    exports.round = round = function (x, n) {
        n = typeof n === "number" ? n : 0;
        return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
    };

 // @param {[number]} x Array of numbers.
    exports.min = min = function (x) {
        var min;
        min = Infinity;
        x.map(function (xi) {
            if (xi < min) {
                min = xi;
            }
        });
        return min;
    };

 // @param {[number]} x Array of numbers.
    exports.max = max = function (x) {
        var max;
        max = -Infinity;
        x.map(function (xi) {
            if (xi > max) {
                max = xi;
            }
        });
        return max;
    };

 // @param {number} start Start value.
 // @param {number} stop Stop value.
    exports.range = range = function (start, stop) {
        var len, range, idx;
        len = stop - start;
        range = new Array(len);
        for (idx = 0; idx < len; idx++) {
            range[idx] = start++;
        }
        return range;
    };

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

 // Calculates the variance.
 // @param {[number]} x Array of numbers.
 // @param {boolean} [bias] If true, the biased sample variance is used.
    exports.variance = variance = function (x, bias) {
        bias = typeof bias === "boolean" ? bias : false;
        return sum(deviation(x).map(function (xi) {
            return Math.pow(xi, 2);
        })) / (x.length - (bias === false ? 1 : 0));
    };

 // Calculates the sample standard deviation.
 // @param {[number]} x Array of numbers.
 // @param {boolean} [bias] If true, the biased sample variance is used.
    exports.standardDeviation = standardDeviation = function (x, bias) {
        bias = typeof bias === "boolean" ? bias : false;
        return Math.sqrt(variance(x, bias));
    };

 // @param {[number]} x Array of numbers.
    exports.standardize = standardize = function (x) {
        var sd;
        sd = standardDeviation(x);
        return deviation(x).map(function (xi) {
            return xi / sd;
        });
    };

 // @param {[number]} x Array of numbers.
    exports.rank = rank = function (x) {
        var ranks;
     // Copy array.
        ranks = x.slice();
     // Sort array.
        ranks = sort(ranks);
     // Calculate ranks.
        return x.map(function (xi) {
            var rank, first, last;
         // Handle tied ranks.
            first = ranks.indexOf(xi);
            last = ranks.lastIndexOf(xi);
            if (first === last) {
                rank = first;
            } else {
                rank = (first + last) / 2;
            }
         // Add 1 because ranks start with 1.
            return rank + 1;
        });
    };

 // Calculates the correlation coefficient for two variables.
 // @param {[number]} x Array of numbers.
 // @param {[number]} y Array of numbers.
    exports.correlation = correlation = {
        pearson: function (x, y) {
            x = standardize(x);
            y = standardize(y);
            return sum(x.map(function (xi, i) {
                return xi * y[i];
            })) / (x.length - 1);
        },
        spearman: function (x, y) {
            var xDeviation, yDeviation;
            x = rank(x);
            y = rank(y);
            xDeviation = deviation(x);
            yDeviation = deviation(y);
            return sum(xDeviation.map(function (xi, i) {
                return xi * yDeviation[i];
            })) / Math.sqrt(sum(xDeviation.map(function (xi) {
                return Math.pow(xi, 2);
            })) * sum(yDeviation.map(function (yi) {
                return Math.pow(yi, 2);
            })));
        }
    };

 // @param {[number]} x Array of numbers.
 // @param {[number]} y Array of numbers.
    exports.distance = distance = {
        euclidean: function (x, y) {
            return Math.sqrt(sum(x.map(function (xi, i) {
                return Math.pow(xi - y[i], 2);
            })));
        },
        manhattan: function (x, y) {
            return sum(x.map(function (xi, i) {
                return Math.abs(xi - y[i]);
            }));
        }
    };

 // @param {[[number]]} x Array of array of numbers.
 // @param {(x, y)} distanceMetric Distance metric.
 // TODO: Save memory by throwing away upper or lower triangle and diagonal.
    exports.pairwiseDistance = pairwiseDistance = function (x, distanceMetric) {
        var pairwiseDistances, distance, i, j;
        pairwiseDistances = [];
        for (i = 0; i < x.length; i++) {
            pairwiseDistances[i] = [];
            for (j = 0; j <= i; j++) {
                if (i === j) {
                    pairwiseDistances[i][j] = 0;
                } else {
                    distance = distanceMetric(x[i], x[j]);
                    pairwiseDistances[i][j] = distance;
                    pairwiseDistances[j][i] = distance;
                }
            }
        }
        return pairwiseDistances;
    };

 // @param {[[number]]} pairwiseDistances Pairwise distance matrix.
 // @param {string} linkage Linkage criterion.
 // Inspired by Heather Arthur's clusterfck: https://github.com/harthur/clusterfck
    exports.hierarchicalClustering = hierarchicalClustering = function (pairwiseDistances, linkage) {
        var clusters, minDistance, clusterA, clusterB, distance, distanceA,
            distanceB, candidates, mergedCluster, i, j;
        clusters = [];
     // Initialize one cluster per observation.
        for (i = 0; i < pairwiseDistances.length; i++) {
            clusters.push({
                label: i,
                key: i,
                index: i,
                size: 1
            });
        }
        while (true) {
         // Stop if all clusters have been merged into a single cluster.
            if (clusters.length === 1) {
                delete clusters[0].index;
                delete clusters[0].key;
                break;
            }
         // Find closest clusters.
            minDistance = Infinity;
            for (i = 0; i < clusters.length; i++) {
                clusterA = clusters[i];
                for (j = 0; j < clusters.length; j++) {
                    if (i !== j) {
                        clusterB = clusters[j];
                        distance = pairwiseDistances[clusterA.key][clusterB.key];
                        if (distance < minDistance) {
                            minDistance = distance;
                            candidates = [clusterA, clusterB];
                        }
                    }
                }
            }
         // Merge clusters.
            mergedCluster = {
                children: candidates,
                key: candidates[0].key,
                distance: minDistance,
                size: candidates[0].size + candidates[1].size
            };
         // Replace first cluster with merged cluster in list of clusters.
            clusters[candidates[0].index] = mergedCluster;
         // Remove second cluster from list of clusters.
            clusters.splice(candidates[1].index, 1);
         // Recompute distances from merged cluster to all other clusters.
            for (i = 0; i < clusters.length; i++) {
                if (clusters[i].key === candidates[0].key) {
                    distance = 0;
                } else {
                    distanceA = pairwiseDistances[candidates[0].key][clusters[i].key];
                    distanceB = pairwiseDistances[candidates[1].key][clusters[i].key];
                    switch (linkage) {
                        case "single":
                            if (distanceA < distanceB) {
                                distance = distanceA;
                            } else {
                                distance = distanceB;
                            }
                            break;
                        case "complete":
                            if (distanceA > distanceB) {
                                distance = distanceA;
                            } else {
                                distance = distanceB;
                            }
                            break;
                        case "upgma":
                            distance = ((distanceA * candidates[0].size) + (distanceB * candidates[1].size)) / (candidates[0].size + candidates[1].size);
                            break;
                    }
                }
                pairwiseDistances[candidates[0].key][clusters[i].key] = distance;
                pairwiseDistances[clusters[i].key][candidates[0].key] = distance;
            }
         // Remove column of second cluster from pairwise distance matrix.
            for (i = 0; i < pairwiseDistances.length; i++) {
                pairwiseDistances[i].splice(candidates[1].key, 1);
            }
         // Remove row of second cluster from pairwise distance matrix.
            pairwiseDistances.splice(candidates[1].key, 1);
         // Update keys of clusters to reflect removal of the column.
            for (i = candidates[1].key; i < clusters.length; i++) {
                clusters[i].key--;
            }
         // Remove obsolete key and index of merged clusters.
            delete candidates[0].key;
            delete candidates[0].index;
            delete candidates[1].key;
            delete candidates[1].index;
         // Reindex clusters.
            for (i = 0; i < clusters.length; i++) {
                clusters[i].index = i;
            }
        }
        return clusters;
    };

}(typeof exports === "undefined" ? this.spearson = {} : exports));

/* Javascript version of cntdn
 *
 * Countdown game solver
 *
 * James Stanley 2014
 */

// Letters part of original file is now found in the file letters.js

/*
 This javascript can be run as a standalone file from command line when using
 a command line javascript interpreter (JavaScript shell) like nodejs

 In addition, this file can be part of a html/javascript web server installation.
 If so, a global variable, 'run_from_browser' must in defined in another javascript file.
 The effect of that is that the variable 'use_console' becomes false (see below).
 */

var use_console = (typeof(run_from_browser) === 'undefined');

function debug_log(text) {
//  if (use_console) console.log(text);
}

var bestdiff;
var bestvalsums;
var allresults = [];
var bestresult;

var OPS = {
    "+": function(n1, n2) { if (n1 < 0 || n2 < 0) return false; return n1+n2; },
    "-": function(n1, n2) { if (n2 >= n1) return false; return n1-n2; },
    "_": function(n2, n1) { if (n2 >= n1) return false; return n1-n2; },
    "*": function(n1, n2) { return n1*n2; },
    "/": function(n1, n2) { if (n2 == 0 || n1%n2 != 0) return false; return n1/n2; },
    "?": function(n2, n1) { if (n2 == 0 || n1%n2 != 0) return false; return n1/n2; },
};

var OPCOST = {
    "+": 1,
    "-": 1.05,
    "_": 1.05,
    "*": 1.2,
    "/": 1.3,
    "?": 1.3,
};

function _recurse_solve_numbers(numbers, searchedi, was_generated, target, levels, valsums, trickshot) {
    levels--;
//    debug_log("REC " + levels);
//    debug_log(numbers);
    for (var i = 0; i < numbers.length-1; i++) {
        var ni = numbers[i];

        if (ni === false)
            continue;

        numbers[i] = false;

        for (var j = i+1; j < numbers.length; j++) {
            var nj = numbers[j];

            if (nj === false)
                continue;

            if (i < searchedi && !was_generated[i] && !was_generated[j])
                continue;

            for (var o in OPS) {
                var r = OPS[o](ni[0], nj[0]);
                if (r === false)
                    continue;

                if (o == '/' && nj[0] == 1)
                    continue;
                if (o == '?' && ni[0] == 1)
                    continue;
                if (o == '*' && (ni[0] == 1 || nj[0] == 1))
                    continue;
                if (r == ni[0] || r == nj[0])
                    continue;

                var op_cost = Math.abs(r);
                while (op_cost % 10 == 0 && op_cost != 0)
                    op_cost /= 10;
                if ((ni[0] == 10 || nj[0] == 10) && o == '*') // HACK: multiplication by 10 is cheap
                    op_cost = 1;
                op_cost *= OPCOST[o];

                var newvalsums = valsums + op_cost;

                if (allresults.length == 0 || Math.abs(r-target) < Math.abs(allresults[0].answer[0]-target))
                    allresults = [];
                if (allresults.length == 0 || Math.abs(r-target) <= Math.abs(allresults[0].answer[0]-target))
                    allresults.push(JSON.parse(JSON.stringify({valsums: valsums, answer: [r,o,ni,nj]})));

                if ((Math.abs(r - target) < Math.abs(bestresult[0] - target))
                        || (Math.abs(r - target) == Math.abs(bestresult[0] - target) && (trickshot || newvalsums < bestvalsums))) {
                    bestresult = [r,o,ni,nj];
                    bestvalsums = newvalsums;
                }

                numbers[j] = [r, o, ni, nj];
                var old_was_gen = was_generated[j];
                was_generated[j] = true;

                if (levels > 0)
                    _recurse_solve_numbers(numbers, i+1, was_generated, target, levels, newvalsums, trickshot);

                was_generated[j] = old_was_gen;
                numbers[j] = nj;
            }
        }

        numbers[i] = ni;
    }
}

function tidyup_result(result) {
    var mapping = {
        "?": "/", "_": "-"
    };

    var swappable = {
        "*": true, "+": true
    };

    debug_log("tidyup_result=====================");
    debug_log(result);
    if (result.length < 4)
        return result;

    for (var i = 2; i < result.length; i++) {
        var child = result[i];

        child = tidyup_result(child);

        if (child[1] == result[1] && swappable[result[1]]) {
            result.splice(i--, 1);
            result = result.concat(child.slice(2));
        } else {
            result[i] = child;
        }
    }

    if (result[1] in mapping) {
        result[1] = mapping[result[1]];
        var j = result[2];
        result[2] = result[3];
        result[3] = j;
    } else if (swappable[result[1]]) {
        childs = result.slice(2).sort(function(a,b) { return b[0] - a[0]; });
        for (var i = 2; i < result.length; i++)
            result[i] = childs[i-2];
    }

    debug_log("------transformed-----------");
    debug_log(result);
    debug_log("------transformed-----------");
    return result;
}

function fullsize(array) {
    if (array.constructor != Array)
        return 0;

    var l = 0;

    for (var i = 0; i < array.length; i++)
        l += fullsize(array[i]);

    return l + array.length;
}

function serialise_result(result) {
    var childparts = [];
    debug_log("---result---");
    debug_log(result);
    debug_log("---result---");

    for (var i = 2; i < result.length; i++) {
        var child = result[i];

        if (child.length >= 4) {
          debug_log("---child---");
          debug_log(child);
          debug_log("---child---");
          if (!isNaN(child[0])) {
              debug_log('!isNaN')
              debug_log(child[0])
              child[0] = child[0] + '_';
              debug_log(child[0])
          }
          childparts.push(serialise_result(child));
        }
    }

    childparts = childparts.sort(function(a,b) { return fullsize(b) - fullsize(a); });
    debug_log("---childparts---");
    debug_log(childparts);
    debug_log("---childparts---");
    var parts = [];
    for (var i = 0; i < childparts.length; i++) {
        parts = parts.concat(childparts[i]);
    }

    var sliced = result.slice(2).map(function(l) {
       if ((l.length == 2) && (l[1] == false))
          return l[0];
      if (isNaN(l[0])) {
        res = l[0].split('_');
        return '_' + res[0];
      } else {
        return '_' + l[0];
      }
     });
    var thispart = [result[0], result[1]].concat(sliced);
    var ret_val = parts.concat([thispart]);
    debug_log("---ret_val---");
    debug_log(ret_val);
    debug_log("---ret_val---");
    return ret_val;
}

function stringify_result(serialised, target) {
    var output = [];

    serialised = serialised.slice(0);
    var result = serialised[serialised.length-1][0];

    for (var i = 0; i < serialised.length; i++) {
        var x = serialised[i];

        var args = x.slice(2);
        output.push(args.join(' ' + x[1] + ' ') + ' = ' + x[0]);
    }
    deviation = ''
    if (result != target)
        deviation = ' (' + (Math.abs(result - target)) + ' off)';
    return output.join(' | ') + deviation;
}

function _solve_numbers(numbers, target, trickshot) {
    debug_log("Numbers before map");
    debug_log(numbers);
    numbers = numbers.map(function(x) { return [x, false] });
    debug_log("Numbers after map");
    debug_log(numbers);
    var was_generated = [];
    for (var i = 0; i < numbers.length; i++) {
      was_generated.push(false);
      debug_log("was_generated");
      debug_log(was_generated);
    }

    bestresult = [0, 0];

    /* attempt to solve with dfs */
    _recurse_solve_numbers(numbers, 0, was_generated, target, numbers.length, 0, trickshot);

    return bestresult;
}

function solve_numbers(numbers, target, trickshot) {
    numbers.sort(function(a, b) {
      return a - b;
    });    bestresult = [numbers[0], numbers[0]];

    /* see if one of these numbers is the answer; with trickshot you'd rather
     * have an interesting answer that's close than an exact answer
     */
    if (!trickshot) {
        for (var i = 1; i < numbers.length; i++) {
            if (Math.abs(numbers[i] - target) < Math.abs(bestresult[0] - target)) {
                bestresult = [numbers[i], numbers[i]];
                bestvalsums = numbers[i];
            }
        }
        if (bestresult[0] == target)
            return target + " = " + target+"\n";
    }

    //return stringify_result(serialise_result(tidyup_result(_solve_numbers(numbers, target, trickshot))), target);
    allresults = [];
    debug_log("Numbers input to _solve_numbers");
    debug_log(numbers);
    _solve_numbers(numbers, target, trickshot);

    var s = [];
    var got = {};
    console.log("length =", allresults.length);
     for (var i = 0; i < allresults.length; i++) {
        var this_str = stringify_result(serialise_result(tidyup_result(allresults[i].answer)), target);
        if (!got[this_str]) {
            got[this_str] = true;
            s.push(this_str);
        }
     }
     s.sort(function(a,b) {
          return b.length - a.length;
     });

    return s.join("\n");
}

if (use_console) {
  input = [0,0,1,1,1,1,1,1,1,0];
  for (n in process.argv) input[n] = parseInt(process.argv[n]);
  var trickshot = input.pop();
  var target = input.pop();
  input.shift();
  input.shift();
  console.log('Input', input, '  target:', target, '  trickshot:', trickshot == 1);
  console.log(solve_numbers(input, target, trickshot == 1));
}

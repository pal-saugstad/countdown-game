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
var allresults = [];
var abs_diff;
var calculations = 0;

var OPS = {
    "+": function(n1, n2) { return n1+n2; },
    "-": function(n1, n2) { if (n2 >= n1) return false; return n1-n2; },
    "_": function(n2, n1) { if (n2 >= n1) return false; return n1-n2; },
    "*": function(n1, n2) { if (n2 < 2 || n1 < 2) return false; return n1*n2; },
    "/": function(n1, n2) { if (n2 < 2 || n1%n2 != 0) return false; return n1/n2; },
    "?": function(n2, n1) { if (n2 < 2 || n1%n2 != 0) return false; return n1/n2; },
};

function _recurse_solve_numbers(numbers, searchedi, was_generated, target, levels) {
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
                var new_abs_diff = Math.abs(r-target);
                calculations++;
                if (new_abs_diff < abs_diff) {
                  allresults = [];
                  abs_diff = new_abs_diff;
                }
                if (new_abs_diff == abs_diff)
                  allresults.push(JSON.parse(JSON.stringify({answer: [r,o,ni,nj]})));

                if (levels > 1) {
                  numbers[j] = [r, o, ni, nj];
                  var old_was_gen = was_generated[j];
                  was_generated[j] = true;
                  _recurse_solve_numbers(numbers, i+1, was_generated, target, levels-1);
                  was_generated[j] = old_was_gen;
                  numbers[j] = nj;
                }
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

    return result;
}

function serialise_result(result) {
    var childparts = [];

    for (var i = 2; i < result.length; i++) {
        var child = result[i];

        if (child.length >= 4) {
          if (!isNaN(child[0])) {
              child[0] = child[0] + '_';
          }
          childparts.push(serialise_result(child));
        }
    }

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

    return parts.concat([thispart]);
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
    numbers = numbers.map(function(x) { return [x, false] });

    var was_generated = [];
    for (var i = 0; i < numbers.length; i++)
      was_generated.push(false);


    /* attempt to solve with dfs */
    _recurse_solve_numbers(numbers, 0, was_generated, target, numbers.length);

}

function solve_numbers(numbers, target, trickshot) {

    abs_diff = target;

    /* see if one of these numbers is the answer; with trickshot you'd rather
     * have an interesting answer that's close than an exact answer
     */
     allresults = [];
     var s = [];
        for (var i = 1; i < numbers.length; i++) {
            var new_abs_diff = Math.abs(numbers[i] - target)
            if (new_abs_diff < abs_diff) {
              allresults = [];
              abs_diff = new_abs_diff;
            }
            if (new_abs_diff == 0)
              s.push(numbers[i] + ' = ' + target);
        }

    //return stringify_result(serialise_result(tidyup_result(_solve_numbers(numbers, target, trickshot))), target);
    _solve_numbers(numbers, target, trickshot);

    var got = {};
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
     no_of_same_res = s.length;
     if (!trickshot) {
       s = [ s[s.length - 1] ];
     }
     s.push("Calculations = " + calculations + " Result pool = " + allresults.length+ " Results = " + no_of_same_res );
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

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

var allresults = [];
var abs_diff;
var calculations = 0;

var OPS = [
    function(n1, n2) { return [n1[0]+n2[0], '+', n2, n1]; },
    function(n1, n2) { if (n2[0] >= n1[0]) return false; return [n1[0]-n2[0], '-', n1, n2]; },
    function(n2, n1) { if (n2[0] >= n1[0]) return false; return [n1[0]-n2[0], '-', n1, n2]; },
    function(n1, n2) { if (n2[0] < 2 || n1[0] < 2) return false; return [n1[0]*n2[0], '*', n2, n1]; },
    function(n1, n2) { if (n2[0] < 2 || n1[0]%n2[0] != 0) return false; return [n1[0]/n2[0], '/', n1, n2]; },
    function(n2, n1) { if (n2[0] < 2 || n1[0]%n2[0] != 0) return false; return [n1[0]/n2[0], '/', n1, n2]; },
];

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
                var r = OPS[o](ni, nj);
                if (r === false)
                    continue;
                var new_abs_diff = Math.abs(r[0]-target);
                calculations++;
                if (new_abs_diff < abs_diff) {
                  allresults = [];
                  abs_diff = new_abs_diff;
                }
                if (new_abs_diff == abs_diff)
                  allresults.push(JSON.stringify(r));

                if (levels > 1) {
                  numbers[j] = r;
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

    if (swappable[result[1]]) {
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
          child[0] = '_' + child[0];
          childparts.push(serialise_result(child));
        }
    }

    var parts = [];
    for (var i = 0; i < childparts.length; i++) {
        parts = parts.concat(childparts[i]);
    }

    var sliced = result.slice(2).map(function(l) {
       return l[0];
     });
     var r = result[0];
     if (isNaN(r))
         r = r.split('_')[1]+'_';
    var thispart = [r, result[1]].concat(sliced);

    return parts.concat([thispart]);
}

function stringify_result(serialised) {
    var output = [];

    var result = serialised[serialised.length-1][0];

    for (var i = 0; i < serialised.length; i++) {
        var x = serialised[i];

        var args = x.slice(2);
        output.push(args.join(' ' + x[1] + ' ') + ' = ' + x[0]);
    }
    return output.join(' | ');
}

function stringify_result2(result, outer_op='+') {

    var parts = [];
    for (var i = 2; i < result.length; i++) {
        var child = result[i];
        var send_op = result[1];
        if (child.length == 1)
              parts.push(child[0]);
        else {
            if ((i == 2) && send_op == '-') send_op = '+';
            parts.push(stringify_result2(child, send_op));
        }
    }

    if (outer_op != '+' && result[1] != '*') {
        return '(' + parts.join(' ' + result[1] + ' ') + ')';
    }
    return parts.join(' ' + result[1] + ' ');
}

function _solve_numbers(numbers, target) {
    numbers = numbers.map(function(x) { return [x] });

    var was_generated = [];
    for (var i = 0; i < numbers.length; i++)
      was_generated.push(false);


    /* attempt to solve with dfs */
    _recurse_solve_numbers(numbers, 0, was_generated, target, numbers.length);

}

function solve_numbers(numbers, target, show_all) {

    abs_diff = Math.abs(numbers[0] - target) + 1;
    calculations = 0;

    allresults = [];
    _solve_numbers(numbers, target);

    var s = [];
    var got = {};
    for (var val of numbers) {
        var new_abs_diff = Math.abs(val - target);
        if (new_abs_diff == 0) {
          s.push(val.toString());
          got[val.toString()] = val + ' = ' + val;
          abs_diff = new_abs_diff;
          break;
        }
    }

    if (allresults.length > 0) {
      var equals = JSON.parse(allresults[0])[0];
      for (const result of allresults) {
        var tidied_result = tidyup_result(JSON.parse(result));
        var this_str = stringify_result2(tidied_result);
        if (!got[this_str]) {
          got[this_str] = stringify_result(serialise_result(tidied_result));
          s.push(this_str);
        }
      }
    }
    no_of_same_res = s.length;
    if (use_console) {
      s.sort(function(a,b) {
        return b.length - a.length
      });
      if (!show_all) s = [ s[s.length - 1] ];
      tab_length = s[0].length;
      s.forEach(function (value, i) {
         len = tab_length - s[i].length;
         var space = '';
         for (j = 0; j < len; j++) space += ' ';
         s[i] = value + space + '   since: '+ got[value];
      });
      var conclusion = "\nResults: " + no_of_same_res + ". Calculations: " + calculations + ".";
      if (abs_diff)
         conclusion = "\nResults: NONE. Calculations: " + calculations + ". Found " + no_of_same_res + " equations, off by " + abs_diff;
      return s.join("\n") + conclusion;
    } else {
      s.sort(function(a,b) {
        return a.length - b.length;
      });
      tab_length = s[s.length - 1].length;
      var val = s[0];
      var res_best = val + "\nsince: " + got[val];
      s.forEach(function (value, i) {
         len = tab_length - s[i].length;
         var space = '';
         for (j = 0; j < len; j++) space += ' ';
         s[i] = value + space + '   since: '+ got[value];
      });
      var ret_val = '';
      if (abs_diff)
        ret_val = "<div>Results: NONE. Off by " + abs_diff + '</div>' +
                  '<div class="res_stats">Found ' + no_of_same_res + ' equations</div>';
      else
        ret_val = '<div class="res_stats">Results: ' + no_of_same_res + '</div>';
      ret_val +=  '<div class="res_best">' + res_best + '</div>' +
                  '<div class="res_all">' + s.join("\n") + '</div>';
      return ret_val;
    }
}

if (use_console) {
  input = [0,0,'-h',1,1,1,1,1,1,0];
  for (n in process.argv) if (n < 10) input[n] = parseInt(process.argv[n]);
  var show_all = input.pop();
  var target = input.pop();
  input.shift();
  input.shift();
  var help = input[0] == '-h';
  if (!help) {
    for (val of input) {
      if (isNaN(val)) {
        help = true;
        console.log("\nCheck input syntax!")
      } else if (val < 0) {
        help = true;
        console.log("\nNegative number not allowed");
      }
    }
  }
  input.sort(function(a,b) {
      return a - b;
    }
  );
  slice_start = 0;
  for (val of input) {
    if (val > 0) break;
    slice_start ++;
  }
  if (slice_start) {
    if (slice_start > 3) {
      help = true;
      console.log("\nToo few positive numbers to work with");
    }
    input = input.slice(slice_start);
  }
  if (help) {
    console.log("\nCountdown Solver\n");
    console.log("First six parameters: Input values");
    console.log("Seventh parameter:    Target value");
    console.log("Eight parameter:      If 0 or absent: Show best solution, if 1: Show all solutions");

  } else {
    console.log('');
    console.log(solve_numbers(input, target, show_all == 1));
    console.log('Input:', input, ', Target:', [target], ', Show:', [show_all == 1 ? 'All results' : 'Best result' ]);
    console.log('');
  }
}

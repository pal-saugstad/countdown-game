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

/**
 * _calc()
 *
 * Calcualte the result of arrayified input string of the form
 * ['(', '(', 38, '-', 8, ')', '+', 33, ')']
 */
function _calc(vals, show_partial) {
  vals.push('.');
  //console.log('Input to _calc ---------');
  var more = true;
  var big_return = ''
  while (more) {
    more = false;
    for (idx = 0; idx < vals.length-3 && !more; idx++) {
      if (!isNaN(vals[idx]) && !isNaN(vals[idx+2])) {
        if (vals[idx+1] == '*') {
          vals[idx] *= vals[idx+2]; more = true;
        } else if (vals[idx+1] == '/') {
          vals[idx] /= vals[idx+2]; more = true;
        } else if (vals[idx+3] != '*' && vals[idx+3] != '/') {
          if (vals[idx+1] == '+') {
            vals[idx] += vals[idx+2]; more = true;
          } else if (vals[idx+1] == '-') {
            vals[idx] -= vals[idx+2]; more = true;
          }
        }
      } else if (vals[idx] == '(' && vals[idx+2] == ')') {
        vals[idx] = vals[idx+1]; more = true;
      }
    }
    if (vals.length == 2 && !isNaN(vals[0])) {
      if (show_partial) return big_return;
      return vals[0];
    }
    vals.splice(idx, 2);
    if (show_partial) {
      var nice_print = '  =  ';
      var use = true;
      var gap = '';
      for (i = 0; i < vals.length - 1 ; i++) {
        if (vals[i] == '(') {
          if (vals[i+2] == ')') use = false;
        }
        if (vals[i] == ')') gap = '';
        nice_print += gap + vals[i];
        gap = vals[i] == '(' ? '' : ' ';
      }
      if (use) big_return += nice_print;
    }

    }
  return "Couldn't interpret that";
}

/**
 * calcualte_formula()
 *
 * Calcualte the result of input strings of the form
 * ((38 - 8) + 33)
 * if an input array is defined, check that only numbers found in that array is used
 * if input array is [], write result as many reduced versions of the input formula
 */
function calculate_formula(input, formula='') {

  formula += ' ';
  var in_number = false;
  var number = 0;
  var arrayed = [];
  while (formula.length) {
    letter = formula.substring(0,1);
    formula = formula.substring(1);
    if (letter >= '0' && letter <= '9') {
      number = number * 10 + parseInt(letter);
      in_number = true;
    } else {
      if (in_number) {
        arrayed.push(number);
        in_number = false;
        number = 0;
      }
      switch(letter) {
        case '(':
        case ')':
        case '+':
        case '-':
        case '*':
        case '/':
          arrayed.push(letter);
          break;
        case ' ':
          break;
        default:
          return "Illegal character found: '" + letter + "' (Legal: '()+-*/ and numbers')"
      }
    }
  }
  if (input.length > 0) {
    var my_inputs = input.slice();
    for (val of arrayed) {
      var found = false;
      if (isNaN(val)) continue;
      for (i in my_inputs) {
        if (my_inputs[i] == val) {
          found = true;
          my_inputs[i] = '.';
          break;
        }
      }
      if (!found) {
        return "Undefined input value in use: '" + val + "'";
      }
    }
  }
  return _calc(arrayed, input.length == 0);
}

var got = {};
var abs_diff;
var calculations = 0;

/**
 * OPS basic calculation operations (+ - * /)
 * Input: two arrays: Either one number or a number formula like the output in each array
 * Return array:
 * [calculated_result, operation, first_inverse_operator_input, input, input]
 * The inverse operator of + is - and of * is /
 * Example:
 *  sum  of [4] and [3, '+', 5, [1], [2]]
                        has return array [7, '+', 5, [4], [3, '+', 5, [1], [2]]]
 *  diff of [4] and [3] has return array [1, '+', 4, [4], [3]] since index 4 of this array should be subtracted
 *  mult of [4] and [3] has return array [12, '*', 5, [4], [3]]
 *  div  of [3] and [6] has return array [2, '*', 4, [6], [3]] since index 4 of this array is a divisor
 */
var OPS = [
    // sum of n1 and n2
    function(n1, n2) {
      return [n1[0]+n2[0], '+', 5, n1, n2];
    },
    // diff of the biggest and the smallest, if not zero
    function(n1, n2) {
      if (n2[0] == n1[0]) return false;
      if (n1[0] >  n2[0]) return [n1[0]-n2[0], '+', 4, n1, n2];
      return [n2[0]-n1[0], '+', 4, n2, n1];
    },
    // n1 * n2, unless the result is the same as one of the inputs
    function(n1, n2) {
      if (n2[0] < 2 || n1[0] < 2) return false;
      return [n1[0]*n2[0], '*', 5, n2, n1];
    },
    // the biggest divided by the smallest, if a whole number and different from both inputs
    function(n1, n2) {
      if (n2[0] < 2 || n1[0] < 2) return false;
      if (n1[0]%n2[0] == 0) return [n1[0]/n2[0], '*', 4, n1, n2];
      if (n2[0]%n1[0] == 0) return [n2[0]/n1[0], '*', 4, n2, n1];
      return false;
    }
];

/**
 * _recurse_solve_numbers()
 *
 * Search through all possible combinations of input values and math operations
 * using them.
 * The input 'numbers' consists of all the input numbers as arrays with one element each:
 *    [[3], [4], [6], ...]
 * However, for each recursive iteration, this array decreases in length but increases in depth:
 *    [[7, '+', 5, [3], [4]], [6], ...]
 * so here, the 3 and the 4 are combined to (3 + 4) as one number.
 * While running recursively, the result collector named 'got' will be filled with possible results.
 * If a closer match is detected, all previous results in 'got' are forgotten (and new are inserted instead)
 */
function _recurse_solve_numbers(numbers, searchedi, target) {
    for (var i = 0; i < numbers.length-1; i++) {
        for (var j = i+1; j < numbers.length; j++) {
            if (i < searchedi && numbers[i].length == 1 && numbers[j].length == 1)
                continue;

            for (var op of OPS) {
                var r = op(numbers[i], numbers[j]);
                if (r === false)
                    continue;
                var new_abs_diff = Math.abs(r[0]-target);
                calculations++;
                if (new_abs_diff < abs_diff) {
                  got = {};
                  abs_diff = new_abs_diff;
                }
                if (new_abs_diff == abs_diff) {
                  got[stringify_result2(tidyup_result(r))] = 1;
                }
                if (new_abs_diff == 0) break;
                if (numbers.length > 2) {
                  var numbers_out = numbers.slice();
                  numbers_out[j] = r;
                  numbers_out.splice(i, 1);
                  _recurse_solve_numbers(numbers_out, i, target);
                }
            }
        }
    }
}

/**
 * tidyup_result(): Flatten the formula stack
 *
 * Try include all of the same operations into a longer linear array than before
 * Example1:
 *     [63, '+', 5, [30, '+', 5, [14], [16]], [33]] means ((14 + 16) + 33) = 63
 *  and will be flattened to
 *     [63, '+', 6, [14], [16], [33]]
 *  index 2 has value 6 since none of the indexes shall be subtracted
 *
 * Example2:
 *     [63, '+', 5, [30, '+', 4, [38], [8]], [33]] means ((38 - 8) + 33) = 63
 *  and will be flattened to
 *     [63, '+', 5, [38], [33], [8]]
 *  index 2 has value 5 since the [8] shall be subtracted
 */
function tidyup_result(result_in) {
    var children = [result_in.slice(3, result_in[2]), result_in.slice(result_in[2])];
    var result = result_in.slice(0, 3);
    for (var pol = 0; pol < 2; pol++) {
      for (var i = 0; i < children[pol].length; i++) {
        var child = children[pol][i];
        if (child.length > 3) {
          child = tidyup_result(child);
          if (child[1] == result[1]) {
            children[pol].splice(i--, 1);
            children[pol] = children[pol].concat(child.slice(3, child[2]));
            children[1-pol] = children[1-pol].concat(child.slice(child[2]));
          } else {
            children[pol][i] = child;
          }
        }
      }
    }
    children[0].sort(function(a,b) { return (b[0] << 3) + b.length > (a[0] << 3) + a.length; });
    children[1].sort(function(a,b) { return (b[0] << 3) + b.length > (a[0] << 3) + a.length; });
    result = result.concat(children[0]);
    result[2] = result.length;
    result = result.concat(children[1]);

    return result;
}

/**
 * stringify_result2(): Make a human readable output from the formula stack
 *
 * Example:
 *     [63, '+', 5, [38], [33], [8, '*', 4, [32], [4]]] will be converted to
 *     38 + 33 - 32 / 4
 */
function stringify_result2(result, outer_op='+') {

    var alt_d = {'+': '-', '*': '/'};
    var parts = [];
    for (var i = 3; i < result.length; i++) {
        var child = result[i];
        var send_op = result[1];
        if (child.length == 1)
            parts.push(child[0]);
        else
            parts.push(stringify_result2(child, send_op));
    }
    var opart = []; // output parts
    var neg_split = result[2] - 3; // border index where the negative/inverted part of the equation starts
    opart.push(parts.slice(0, neg_split).join(' ' + result[1]  + ' '));
    var neg_opart = parts.slice(neg_split);

    if (neg_opart.length > 1 && result[1] == '*') {
      opart.push('(' + neg_opart.join(' ' + result[1]  + ' ') + ')');
    } else if (neg_opart.length > 0) {
      opart.push(neg_opart.join(' ' + alt_d[result[1]] + ' '));
    }

    var txt = opart.join(' ' + alt_d[result[1]] + ' ');

    if (outer_op != '+' && result[1] != '*') {
        return '(' + txt + ')';
    }
    return txt;
}

var spaces = '                                                ';

function solve_numbers(numbers, target, show_all) {

    abs_diff = Math.abs(numbers[0] - target) + 1;
    calculations = 0;

    for (var val of numbers) {
        var new_abs_diff = Math.abs(val - target);
        calculations++;
        if (new_abs_diff < abs_diff) {
          got = {};
          abs_diff = new_abs_diff;
        }
        if (new_abs_diff == abs_diff) {
          got[val.toString()] = val + ' = ' + val;
        }
    }

    numbers = numbers.map(function(x) { return [x] });
    numbers.sort(function(a,b) {
      return a[0] > b[0];
    });

    /* attempt to solve with dfs */
    _recurse_solve_numbers(numbers, 0, target);

    var s = [];
    for (var key in got) s.push(key);
    no_of_same_res = s.length;
    s.sort(function(a,b) {
      return a.length - b.length;
    });
    var val = s[0];
    tab_length = s[s.length - 1].length + 3;
    s.forEach(function (value, i) {
      s[i] = value + spaces.substring(0, tab_length - s[i].length) + calculate_formula([], value);
    });
    var res_best = val + "\n\n" + calculate_formula([], val);
    var no_of_num = 0;
    var analyze_res = val.split('');
    var prev_is_digit = false;
    while (analyze_res.length > 0) {
      check_digit = analyze_res.pop();
      is_digit = check_digit >= '0' && check_digit <= '9';
      if (is_digit && !prev_is_digit) no_of_num++;
      prev_is_digit = is_digit;
    }
    if (use_console) {
      if (!show_all) s = [ res_best ];
      var conclusion = "\nResults: " + no_of_same_res + ". Calculations: " + calculations + ".";
      if (abs_diff)
         conclusion = "\nResults: NONE. Calculations: " + calculations + ". Found " + no_of_same_res + " equations, off by " + abs_diff;
      return s.reverse().join("\n") + conclusion;
    } else {
      var ret_val = '';
      if (abs_diff)
        ret_val = '<div>NO results. Found ' + no_of_same_res + ' equations which are Off by ' + abs_diff + '</div>';
      else
        ret_val = '<div>Found ' + no_of_same_res + ' equations. The best result is using ' + no_of_num + ' input values</div>';
      ret_val +=  '<div>&nbsp;</div>'
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
  if (help) {
    console.log("\nCountdown Solver\n");
    console.log("First six parameters: Input values");
    console.log("Seventh parameter:    Target value");
    console.log("Eight parameter:      If 0 or absent: Show best solution, if 1: Show all solutions");

  } else {
    console.time('Time');
    console.log('');
    console.log(solve_numbers(input, target, show_all == 1));
    console.log('Input:', input, ', Target:', [target], ', Show:', [show_all == 1 ? 'All results' : 'Best result' ]);
    console.timeEnd('Time');
    console.log('');
  }
}

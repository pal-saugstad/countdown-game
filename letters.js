/* Javascript version of cntdn
 *
 * Countdown game solver
 *
 * James Stanley 2014
 */

// First part of original cntdn.js file
var dbg = [];

function _recurse_solve_letters(letters, node, used_letter, cb, answer) {
    if (node[0])
        cb(answer, node[0]);

    if (answer.length == letters.length)
        return;

    var done = {};

    for (var i = 0; i < letters.length; i++) {
        var c = letters.charAt(i);

        if (used_letter[i] || done[c])
            continue;

        if (node[c]) {
            used_letter[i] = true;
            done[c] = true;
            _recurse_solve_letters(letters, node[c], used_letter, cb, answer+c);
            used_letter[i] = false;
        }
    }
}

function solve_letters(letters, cb) {
    _recurse_solve_letters(letters, dictionary, {}, cb, '');
}

function sufficient_letters(word, letters) {
    var count = {};

    for (var i = 0; i < letters.length; i++) {
        if (!count[letters.charAt(i)])
            count[letters.charAt(i)] = 0;
        count[letters.charAt(i)]++;
    }

    for (var i = 0; i < word.length; i++) {
        if (!count[word.charAt(i)])
            return false;
        count[word.charAt(i)]--;
        if (count[word.charAt(i)] < 0)
            return false;
    }

    return true;
}

function word_in_dictionary(word) {
    var node = dictionary;
    var idx = 0;

    while (idx < word.length) {
        node = node[word.charAt(idx)];
        idx++;
        if (!node)
            return false;
    }

    if (!node[0])
        return false;
    return true;
}

function solve_letters_matrix(letters) {

  var result = [];
  var res = [];

  solve_letters(letters.toLowerCase(), function(word, c) { result.push([word, c]); });

  result.sort(function(a, b) {
    return a > b;
  });

  var out_matrix = [[],[],[],[],[],[],[],[],[],[]];
  var no_of_words = [0,0,0,0,0 ,0,0,0,0,0];
  var max_word_length = 0;
  for (value of result) {
    no_of_words[value[0].length] += 1;
    out_matrix[value[0].length].push(value[0]);
  }
  for (i = 9; i > 0; i--) {
    if (no_of_words[i] > 0) {
      max_word_length = i;
      break;
    }
  }

  var spaces = '                                                                        ';

  var stats_best = '<div>Found '
        + result.length
        + ' words of which '
        + no_of_words[max_word_length]
        + ' words have '
        + max_word_length
        + ' letters\n</div>'
        + '<div class="res_best">\n';
  for (i = 0; i < no_of_words[max_word_length]; i ++ ) {
    stats_best += out_matrix[max_word_length][i] + " ";
  }
  stats_best += '</div><div class="res_all">\n1    2    3      4      5        6        7          8          9';
  res.push(stats_best);
  var row = 'init';
  for (i = 0; row.length > 0; i++) {
    row = '';
    var blanks = 0;
    for (j = 1; j <= 9; j++) {
      if (out_matrix[j].length > i) {
        row += spaces.substring(0,blanks) + out_matrix[j][i];
        blanks = 3;
      } else {
        blanks += j + 3;
      }
    }
    res.push(row);
  }
  res.push('</div>');
  return res.join('\n');
}

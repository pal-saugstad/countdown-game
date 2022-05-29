/* Javascript version of cntdn
 *
 * Countdown game solver
 *
 * James Stanley 2014
 */

// First part of original cntdn.js file

function solve_letters(letters, cb) {
  const length = letters.length;
  const la = letters.split('');
  let used = {};
  let answer = '';

  function _recurse(node) {

    if (node[0]) cb(answer);

    if (answer.length < length) {
      let done = {0: true};

      for (const [i, c] of la.entries()) {
        if (used[i] || done[c] || !node[c]) continue;
        used[i] = done[c] = true;
        let prev = answer;
        answer += c;
        _recurse(node[c]);
        used[i] = false;
        answer = prev;
        }
    }
}

  _recurse(dictionary);
}

function sufficient_letters(word, letters) {

    let la = letters.split('').sort();

    for (const c of word.split('').sort()) {
        let found;
        do {
          if (la.length == 0) return false;
          found = (c == la[0]);
          la.shift();
        } while (!found);
    }

    return true;
}

function word_in_dictionary(word) {
    let node = dictionary;
    for (c of word.split('')) {
        node = node[c];
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

  solve_letters(letters.toLowerCase(), function(word) { result.push(word); });

  result.sort();

  var out_matrix = [[],[],[],[],[],[],[],[],[],[]];
  var no_of_words = [0,0,0,0,0 ,0,0,0,0,0];
  var max_word_length = 0;
  for (value of result) {
    no_of_words[value.length] += 1;
    out_matrix[value.length].push(value);
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

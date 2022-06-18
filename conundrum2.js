
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function* give_words(size=3, skip=0) {
  function* _give(node, answer) {
    if (answer.length < size) {
      for (c in node) yield * _give(node[c], answer+c);
    } else if (node[0]) {
      if (skip > 0) skip--;
      else skip = yield answer;
    }
  }
  while (true) yield * _give(dictionary, '');
}

function random_word(size=3, wn=-1) {
  let skip;
  if (wn < 0) {
    skip = Math.floor(Math.random() * dictionary_word_lengths[size]);
  } else {
    skip = wn % dictionary_word_lengths[size];
  }
  let res = '';
  let start = '';
  function _next(node, answer) {
    if (res) return;
    if (answer.length < size) {
      for (c in node) _next(node[c], answer+c);
    } else if (node[0]) {
      if (skip > 0) {
        skip--;
      } else {
        res = answer;
        return;
      }
    }
  }
  let fast = dictionary_word_fast[size];
  let tot = 0;
  let use = 0;
  for (const i in fast) {
    start = i;
    use = tot;
    tot += fast[i];
    if (tot > skip) break;
  }
  skip -= use;
  let start_node = dictionary;
  for (let idx = 0; idx < start.length; idx++) start_node = start_node[start.substring(idx,idx+1)];
  _next(start_node, start);
  return res;
  //console.log(fast);
}

function generate_conundrum2(input = '') {
  while (true) {
    let highest_score = 0;
    let best_candidate;
    const letters = random_word(9);
    const five = [];
    const nine = [];

    solve_letters(letters, function(word) {
      if (word.length == 5) five.push(word);
      else if (word.length == 9) nine.push(word);
    });
    shuffle(nine);
    shuffle(five);
    const nine_sorted = nine[0].split('').sort();
    for (const five_word of five) {
      let five_sorted = five_word.split('').sort();
      let four_sorted = nine_sorted.slice();
      let i = 0;
      for (let c of five_sorted) {
        while (c != four_sorted[i]) {
          i++;
          if (!four_sorted[i]) this_cannot_happen();
        }
        four_sorted[i] = '';
      }
      let four_word_input = four_sorted.join('');
      let four_solve = [];
      solve_letters(four_word_input, function(word) {
        if (word.length == 4) four_solve.push(word);
      });
      shuffle(four_solve);
      let candidate = '';
      for (const four_word of four_solve) {
        if (true) {
          candidate = four_word + five_word;
          candidates = [candidate, five_word + four_word];
          let best_local_score = 100;
          for (const nine_word of nine) {
            for (const cand of candidates) {
              let score = levenshtein(cand, nine_word);
              if (score < best_local_score) best_local_score = score;
            }
          }
          if (best_local_score > 5) {
            nine.unshift(candidate);
            return nine;
          }
          if (best_local_score > highest_score) {
            highest_score = best_local_score;
            best_candidate = candidate;
          }
        }
      }
      if (highest_score > 4) {
        nine.unshift(best_candidate);
        return nine;
      }
    }
  }
}

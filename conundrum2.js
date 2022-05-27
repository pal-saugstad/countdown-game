
function _recurse_find_9letter_words(node, cb, answer) {
    if (node[0] && answer.length == 9) {
          cb(answer);
          return;
    }

    for (c in node) {
        _recurse_find_9letter_words(node[c], cb, answer+c);
    }
}


function find_9letter_words() {
  let result = [];
  _recurse_find_9letter_words(dictionary, function(word) { result.push(word); }, '');
  return result;
}

function generate_conundrum() {

  const long_words = find_9letter_words();
  while (true) {
    const letters = long_words[Math.floor(Math.random() * long_words.length)];
    const five = [];
    const nine = [];

    solve_letters(letters, function(word, c) {
      if (word.length == 5) five.push(word);
      else if (word.length == 9) nine.push(word);
    });
    if (nine.length != 1) {
      console.log("Redo since several 9 letter permutations " + nine);
      continue;
    }
    if (five.length < 1) {
      console.log("Redo since no word with five letters found ");
      continue;
    }
    const five_word = five[Math.floor(Math.random() * five.length)];
    let elim = [0,0,0,0,0,0,0,0,0];
    for (i = 0; i < 5; i++) {
      target = five_word.charAt(i);
      for (j = 0; j < 9; j++) {
        if (letters.charAt(j) == target && elim[j] == 0) {
          elim[j] = 1;
          break;
        }
      }
    }
    let four_word_input = '';
    for (i = 0; i < 9; i++) {
      if (elim[i] == 0) four_word_input += letters.charAt(i);
    }
    let four_solve = [];
    solve_letters(four_word_input, function(word, c) {
      if (word.length == 4) four_solve.push(word);
    });
    if (four_solve.length < 1) {
      console.log("Redo since no word with four letters found ");
      continue;
    }
    const four_word = four_solve[Math.floor(Math.random() * four_solve.length)];
    if (letters == four_word + five_word || letters == five_word + four_word) {
      console.log("Redo since too easy >>>>>>>>>>>>>>>>> " + [four_word, five_word, letters]);
      continue;
    }
    const question = Math.random() > 0.5 ? five_word + four_word : four_word + five_word;
    return [ question, letters ];
  }
}


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let nine_letters_found = false;

function _recurse_find_9letter_word(node, cb, answer) {
  if (node[0] && answer.length == 9) {
    nine_letters_found = true;
    cb(answer);
    return;
  }

  if (!nine_letters_found) {
    let carr = [];
    for (c in node) carr.push(c);
    shuffle(carr);
    for (c of carr) _recurse_find_9letter_word(node[c], cb, answer+c);
  }
}

function find_9letter_random_word() {
  let result = '';
  nine_letters_found = false;
  _recurse_find_9letter_word(dictionary, function(word) { result = word; }, '');
  return result;
}

function generate_conundrum() {

  while (true) {
    const letters = find_9letter_random_word();
    const five = [];
    const nine = [];

    solve_letters(letters, function(word) {
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
    solve_letters(four_word_input, function(word) {
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

const vm = require('vm');
const fs = require('fs');

var input=process.argv[2];

if (input) {
  var letters = input.toLowerCase();
  var clean_letters = '';
  for (i = 0; i < letters.length && clean_letters.length < 9; i++) {
    letter = letters.charAt(i);
    if (letter >= 'a' && letter <= 'z') clean_letters += letter;
  }
  console.debug("Solve Letters for input '" + clean_letters + "'");

  const context = { input_letters: clean_letters};
  vm.createContext(context);

  const files = ['dictionary.js', 'letters.js']
  let code = '';
  for (let file of files) code += fs.readFileSync(file, 'utf-8');
  code += 'var outp = solve_letters_matrix(input_letters);';

  vm.runInContext(code, context);
  console.debug(context.outp);
} else {
  console.debug("Give me letters");
}

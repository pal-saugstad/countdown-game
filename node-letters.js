if (typeof(in_vm) === 'undefined') {

  // set up and run vm with the required files
  const vm = require('vm');
  const fs = require('fs');

  const context = { console: { log: (...args) => { console.log(...args); } }, input_args: process.argv };
  vm.createContext(context);

  const code = 'var in_vm = true;\n' +
    fs.readFileSync('dictionary.js',  'utf-8') +
    fs.readFileSync('letters.js',     'utf-8') +
    fs.readFileSync( process.argv[1], 'utf-8');
  vm.runInContext(code, context);

} else {

  // code to run in vm as the last "included" file (see readFileSync above)
  if (input_args[2]) {
    let letters = input_args[2].toLowerCase();
    let clean_letters = '';
    for (i = 0; i < letters.length && clean_letters.length < 9; i++) {
      letter = letters.charAt(i);
      if (letter >= 'a' && letter <= 'z') clean_letters += letter;
    }
    console.log("Solve Letters for input '" + clean_letters + "'");
    console.log(solve_letters_matrix(clean_letters));
  } else {
    console.log("Give me some letters");
  }

}

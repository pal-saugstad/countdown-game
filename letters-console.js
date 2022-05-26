
var input=process.argv[2];

if (input) {
  var letters = input.toLowerCase();
  var clean_letters = '';
  for (i = 0; i < letters.length && clean_letters.length < 9; i++) {
    letter = letters.charAt(i);
    if (letter >= 'a' && letter <= 'z') clean_letters += letter;
  }
  console.debug("Solve Letters for input '" + clean_letters + "'");
  console.debug(solve_letters_matrix(clean_letters));
} else {
  console.debug("Give me letters");
}

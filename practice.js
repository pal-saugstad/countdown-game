function shuffle(a) {
    var n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
}

function str_shuffle(s) {
    var a = s.split("");
    shuffle(a);
    return a.join("");
}

let field_names = {seed: false, suggest: false};
let inputs_arr = [];
let inputs_str = '';
let is_numbers = false;
var is_conundrum = false;
var conundrum_result = [];
var conundrum_clue = '';

$(document)
.on('keypress',function(e) {
    if(e.which == 13) ret_button();
})
.ready(function(){

    $('input')
    .focusout(function() {
        field_names[this.id] = false;
        ret_button(this.id);
    })
    .focus(function() {
        field_names[this.id] = true;
    });
    $('.vowels').click(function() { addletter($(this).html()); });
    $('.large').click(function() { gennumbers($(this).html()); });
    $('#conundrum-button').click(conundrum);
    $('#reset-button').click(reset);
    $('#show-answers-button').click(showanswer);
    $('#conundrum-clue').click(show_conundrum_clue);

});

function ret_button(field = '') {
    if (!field) field = field_names.seed ? 'seed' : (field_names.suggest ? 'suggest' : '');
    console.log(`You entered ${field}`);
    if (field == 'seed') {
        is_conundrum = false;
        pretty_print();
    } else if (field == 'suggest') {
        checksolution();
    }
}

function gennumbers(large) {
    clean();
    is_numbers = true;

    var largenums = [25, 50, 75, 100];
    var smallnums = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];

    shuffle(largenums);
    shuffle(smallnums);

    let number_str = '';

    for (let i = 0; i < 6; i++)
        number_str += ` ${i < large ? largenums[i] : smallnums[i-large]}`;

    number_str += ` ${Math.floor(Math.random() * (899)) + 101}`;
    $('#seed').val(number_str);
    pretty_print();
}

function addletter(vowels) {
    clean();
    console.log(vowels);
    const basevowels = "AAAAAAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIOOOOOOOOOOOOOUUUUU";
    const basecons = "BBCCCDDDDDDFFGGGHHJKLLLLLMMMMNNNNNNNNPPPPQRRRRRRRRRSSSSSSSSSTTTTTTTTTVWXYZ";
    reset();
    is_numbers = false;
    is_conundrum = false;
    let letters = str_shuffle(str_shuffle(basevowels).substring(0, vowels) + str_shuffle(basecons).substring(vowels, 9));
    $('#seed').val(letters);
    pretty_print();
}

function conundrum() {
    reset();
    is_numbers = false;
    is_conundrum = true;
    let returned_data  = generate_conundrum2();
    conundrum_clue = [];
    $('#seed').val(returned_data.shift());
    pretty_print();
    conundrum_result = returned_data;
    $('#conundrum-clue').css('visibility', 'visible');
}

function show_conundrum_clue() {
    reveal_idx = conundrum_clue.length;
    if (reveal_idx < 9) {
        conundrum_clue[reveal_idx] = conundrum_result[0].charAt(reveal_idx);
    }
    $('#suggest').val(conundrum_clue.join(''));
}

function clean() {
    $('#conundrum-clue').css('visibility', 'hidden');
    $('#answer').html("");
    $('input').val('');
    $('#check-suggestion').html('');
    is_conundrum = false;
}

function reset() {
    clean();
    inputs_str = '';
    inputs_arr = [];
}

function pretty_print(answer_text = '') {
    $('#conundrum-clue').css('visibility', 'hidden');
    $('#answer').html(answer_text);
    $('#check-suggestion').html('');
    let raw_num = [];
    let inputs = [];
    let istring = $('#seed').val().toLowerCase().trim();
    let numbs = false;
    let letts = false;
    let letts_str = '';
    console.log(`go ${istring}`);
    for (i=0; i < istring.length; i++) {
      let char = istring.charAt(i);
      if (!isNaN(char) && char != ' ') {
        numbs = true;
      } else if (/^[a-z]$/i.test(char)) {
        letts = true;
        letts_str += char;
      }
    }
    if (letts == numbs) {
        if (numbs)
          $('#answer').text("Wrong input format - '" + istring + "'" +
            "\nEither use numbers or letters, not both, please");
        return !numb;
    }
    is_numbers = numbs;
    if (is_numbers) {
      raw_num = istring.trim().split(' ');
      inputs = [];
      var bad_input = false;
 
      for (let val of raw_num) {
        if (isNaN(val) || val.length == 0) continue;
        inputs.push(val);
        if (val < 1) bad_input = true;
        if (inputs.length >= 7) break; 
      }
      if (inputs.length < 2) bad_input = true;
      console.log(inputs);

      if (bad_input) {
        $('#answer').text("Wrong input format - '" + istring + "'" +
                         "\nFormat: 7 positive numbers where the latter is the target" +
                         "\nExample: '25 75 7 11 13 3 563'");
        return false;
      }
    } else {
      inputs_str = letts_str.substring(0, 9);
      console.log(`Letters! ${inputs_str}`)
    }
  if (is_numbers) {
    number_str = '      ';
    for (let i = 0; i < inputs.length - 1; i++)
        number_str += `${inputs[i].toString().padStart(4)}`;
    number_str += `        | ${inputs[inputs.length - 1]} |`;
    $('#seed').val(number_str); 
  } else {
    inputs = inputs_str.toUpperCase().split('');
    $('#seed').val('           ' + inputs.join('  '));
  }
  inputs_arr = inputs;
  return true;
}

function showcore() {
    let res;
    if (is_numbers) {
        res = solve_numbers(inputs_arr);
    } else if (is_conundrum) {
        res = inputs_str + ' -> ' + conundrum_result.join(' or ');
    } else {
        res = solve_letters_matrix(inputs_str);
    }
    $('#answer').html(res);
}

function showanswer() {
  if (pretty_print("Calculating ...")) setTimeout(showcore, 0);
}

function checksolution() {
    var input_line = $('#suggest').val();
    if (input_line == '') return;
    var errors = '';
    if (is_numbers) {
      let inputs = inputs_arr.slice();
      let target = parseInt(inputs.pop());
      console.log(`INPUTS ${inputs} target ${target}`);
      answer_from_calc = calculate_formula(inputs, input_line);
      if (isNaN(answer_from_calc)) {
        $('#check-suggestion')
            .html(answer_from_calc);
      } else {
        diff = target - answer_from_calc;
        if (diff) {
          if (diff < 0) diff = -diff;
          $('#check-suggestion')
              .html(answer_from_calc + ' is ' + diff + ' off from target');
        } else {
          $('#check-suggestion')
              .html(answer_from_calc + ' is correct, well done!');
        }
      }
    } else {
      if (!sufficient_letters(input_line.toLowerCase(), inputs_str.toLowerCase()))
          errors += "Wrong letters. "; /* TODO: be more specific */
      if (!word_in_dictionary(input_line.toLowerCase()))
          errors += "Word not in dictionary.";

      if (errors.length > 0) {
          $('#check-suggestion')
              .html(errors);
      } else {
          $('#check-suggestion')
              .html('Nice word!');
      }
    }
}

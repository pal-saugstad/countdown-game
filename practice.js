$('#letters-switch').click(letters_switch);
$('#numbers-switch').click(numbers_switch);

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

var clockstep = 100;
var basevowels = "AAAAAAAAAAAAAAAEEEEEEEEEEEEEEEEEEEEEIIIIIIIIIIIIIOOOOOOOOOOOOOUUUUU";
var basecons = "BBCCCDDDDDDFFGGGHHJKLLLLLMMMMNNNNNNNNPPPPQRRRRRRRRRSSSSSSSSSTTTTTTTTTVWXYZ";

var target;
var numbers;
var numbersteps;
var numbertimeout;

var is_conundrum;
var conundrum_result;
var conundrum_clue;
var letteridx;
var clockinterval;
var clockrunning;
var clockpaused;
var clocksecs = clocktotal();
var clockstarted;
var flashes;
var buttonflashes;
var nvowels;
var ncons;
var vowels, cons;
var letters;
var needreset;
var best_result = true;
var seed = '';
$('#vowel-button').click(function() {
    addletter(true);
});
$('#consonant-button').click(function() {
    addletter(false);
});
$('#conundrum-button').click(conundrum);
$('#reset-button').click(reset_all);
$('#show-answers-button').click(showanswer);
$('#halt-clock').click(stopclock);

$('#0large').click(function() { gennumbers(0); });
$('#1large').click(function() { gennumbers(1); });
$('#2large').click(function() { gennumbers(2); });
$('#3large').click(function() { gennumbers(3); });
$('#4large').click(function() { gennumbers(4); });
$('#random-button').click(function() {
  if (window.location.hash == '#numbers') {
    gennumbers(Math.floor(Math.random() * 5));
  } else {
    autofill();
  }
});

$('#conundrum-clue').click(show_conundrum_clue);

$('#enable-music').change(function() {
    if (!$('#enable-music').prop('checked')) {
        $('#music')[0].pause();
        if (clockrunning)
            $('#enable-music').prop('disabled', true);
    }
});

function check_best_result() {
  var best_result = $('#best-result').prop('checked');
  if (best_result) {
    $('.res_best').show();
    $('.res_all').hide();
  } else {
    $('.res_best').hide();
    $('.res_all').show();
  }
}

$('#best-result').change(function() {
  check_best_result();
});

$('#seed-form').submit(seedform);
function seedform(evt) {
    evt.preventDefault();
    var istring = $('#seed').val().toUpperCase();
    if (window.location.hash == '#numbers') {
      var inputs = istring.trim().split(' ');
      var bad_input = false;
      if (inputs.length == 7) {
        for (i in inputs) {
          if (isNaN(inputs[i])) inputs[i] = 0;
          if (inputs[i] < 1) bad_input = true;
        }
      } else {
        bad_input = true;
      }
      if (bad_input) {
        $('#answer').text("Wrong input format - '" + istring + "'" +
                         "\nFormat: 7 positive numbers where the latter is the target" +
                         "\nExample: '25 75 7 11 13 3 563'");
      } else {
        var targ = inputs.pop();
        defined_numbers(inputs, targ);
      }
    } else {
      seed = istring;
      autofill();
    }
}

$('#stats-result').change(function() {
  check_best_result();
});

$('#clock-start').click(function() {
    clearInterval(clockinterval);
    $('#music')[0].currentTime = 0;
    startclock();
});
$('#clock-reset').click(function() {
    clearInterval(clockinterval);
    $('#music')[0].pause();
    $('#music')[0].currentTime = 0;
    clockpaused = true;
    $('#suggest-input').prop('disabled', false);
    $('#suggest-solution-button').prop('disabled', false);
    clocksecs = clocktotal();
    renderclock();
});
$('#clock-pauseresume').click(function() {
    if (clockpaused) {
        $('#clock-pauseresume').text('Pause clock');
        clearInterval(clockinterval);
        clockinterval = setInterval(tickclock, clockstep);
        $('#music')[0].play();
        clockpaused = false;

        $('#suggest-input').prop('disabled', true);
        $('#suggest-solution-button').prop('disabled', true);
    } else {
        $('#clock-pauseresume').text('Resume clock');
        clearInterval(clockinterval);
        $('#music')[0].pause();
        clockpaused = true;

        $('#suggest-input').prop('disabled', false);
        $('#suggest-solution-button').prop('disabled', false);
    }
});

$('#automatic-timer').change(function() {
    if ($('#automatic-timer').prop("checked"))
        $('#timer-controls').hide();
    else
        $('#timer-controls').show();
});
if ($('#automatic-timer').prop("checked"))
    $('#timer-controls').hide();
else
    $('#timer-controls').show();

$('input[name="clocktime"]').change(retime);
retime();

if (window.location.hash == '#numbers') {
  numbers_switch();
} else {
  letters_switch();
}

function clocktotal() {
    return parseInt($('input[name="clocktime"]:checked').val());
}

function retime() {
    clocksecs = clocktotal();
    $('#music').attr('src', 'music' + clocksecs + '.mp3');
    $('#music')[0].pause();
    $('#music')[0].load();
    $('#music')[0].pause();
    renderclock();
}

function defined_numbers(inputs, targ) {
    reset();
    numbers = inputs;
    target = targ;
    numbersteps = 30;
    addnumber();
}

function gennumbers(large) {
    reset();

    var largenums = [25, 50, 75, 100];
    var smallnums = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10];

    shuffle(largenums);
    shuffle(smallnums);

    numbers = [];

    for (var i = 1; i <= large; i++)
        numbers.push(largenums[i-1]);

    for (var i = large+1; i <= 6; i++)
        numbers.push(smallnums[i-(large+1)]);

    target = Math.floor(Math.random() * (899)) + 101;

    numbersteps = 30;
    addnumber();
}

function addnumber() {
    numbersteps--;

    if (numbers.length > 0) {
        $('#number' + numbers.length).html(numbers[numbers.length-1]);
        numbers = numbers.slice(0, numbers.length-1);
        numbertimeout = setTimeout(addnumber, 400);
    } else if (numbersteps > 0) {
        gentarget();
        numbertimeout = setTimeout(addnumber, 50);
    } else {
        $('#numbers-target').html(target);
        if ($('#automatic-timer').prop("checked"))
            startclock();
    }
}

function gentarget() {
    $('#numbers-target').html(Math.floor(Math.random() * (899)) + 101);
}

function letters_switch() {
    $('#letters-switch').removeClass('btn-light').addClass('btn-primary');
    $('#numbers-switch').removeClass('btn-primary').addClass('btn-light');
    $('#letters-game,#letter-buttons').css('display', 'block');
    $('#numbers-game,#number-buttons').css('display', 'none');
    if (window.location.hash)
        window.location.hash = '';
    clocksecs = clocktotal();
    stopclock();
    reset_all();
}

function numbers_switch() {
    $('#numbers-switch').removeClass('btn-light').addClass('btn-primary');
    $('#letters-switch').removeClass('btn-primary').addClass('btn-light');
    $('#numbers-game,#number-buttons').css('display', 'block');
    $('#letters-game,#letter-buttons').css('display', 'none');
    window.location.hash = 'numbers';
    clocksecs = clocktotal();
    stopclock();
    reset();
    reset_all();
}

function addletter(vowel, predef='') {
    if (needreset)
        reset();

    var letter = predef ? predef : (vowel ? getvowel() : getconsonant());

    $('#letter' + letteridx).html(letter);
    letters += letter;
    letteridx++;

    if (letteridx > 9) {
        if ($('#automatic-timer').prop("checked"))
            startclock();
    }

    /* at most 6 consonants; at most 5 vowels */
    if (vowel)
        nvowels++;
    else
        ncons++;
    if (ncons == 6)
        $('#consonant-button').prop('disabled', true);
    if (nvowels == 5)
        $('#vowel-button').prop('disabled', true);
}

function getvowel() {
    var c = vowels.substring(0, 1);
    vowels = vowels.substring(1);
    return c;
}

function getconsonant() {
    var c = cons.substring(0, 1);
    cons = cons.substring(1);
    return c;
}

function autofill() {
    if (needreset)
        reset();

    if (letteridx <= 9) {
        var letter = '';
        while (seed.length) {
            var test_letter = seed.substring(0,1);
            seed = seed.substring(1);
            if (test_letter >= 'A' && test_letter <= 'Z') {
                letter = test_letter;
                break;
            }
        }
        if (ncons >= 6) {
            addletter(true, letter);
        } else if (nvowels >= 5) {
            addletter(false, letter);
        } else {
            if (Math.random() < 0.5)
                addletter(true, letter);
            else
                addletter(false, letter);
        }

        if (letteridx <= 9) {
            setTimeout(autofill, 250);
        } else {
            seed = '';
        }
    }
}

function conundrum() {
    var data = generate_conundrum();
    reset();
    result = [];
    solve_letters(data.toLowerCase(), function(word) { if (word.length == 9) result.push(word); });
    if (result.length == 1) {
        conundrum_result = result[0];
        conundrum_clue = ".........".split('');
        seed = data.toUpperCase();
        is_conundrum = true;
        autofill();
        $('#conundrum-clue').css('visibility', 'visible');
    } else {
        conundrum();
    }
}

function show_conundrum_clue() {
    let stillneed = [];
    for (let i = 0; i < 9; i++) {
        if (conundrum_clue[i] == '.')
            stillneed.push(i);
    }
    if (stillneed.length > 0) {
        let reveal_idx = stillneed[Math.floor(Math.random() * stillneed.length)];
        conundrum_clue[reveal_idx] = conundrum_result.charAt(reveal_idx);
    }
    $('#answer').text(conundrum_clue.join(''));
}

function startclock() {
    $('#vowel-button').prop('disabled', true);
    $('#consonant-button').prop('disabled', true);
    $('#conundrum-button').prop('disabled', true);
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', true);
    $('#halt-clock').prop('disabled', false);

    if ($('#enable-music').prop('checked'))
        $('#music')[0].play();
    else
        $('#enable-music').prop('disabled', true);

    clockpaused = false;
    $('#clock-pauseresume').text('Pause clock');
    $('#suggest-input').prop('disabled', true);
    $('#suggest-solution-button').prop('disabled', true);
    clockinterval = setInterval(tickclock, clockstep);
    clockstarted = Date.now();
    clocksecs = clocktotal();
    clockrunning = true;
    needreset = true;
    renderclock();
}

function stopclock() {
    $('#vowel-button').prop('disabled', false);
    $('#consonant-button').prop('disabled', false);
    $('#conundrum-button').prop('disabled', false);
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', false);
    $('#suggest-input').prop('disabled', false);
    $('#suggest-solution-button').prop('disabled', false);
    clearInterval(clockinterval);

    $('#music')[0].currentTime = 0;
    $('#music')[0].pause();

    $('#halt-clock').prop('disabled', true);

    if (clocksecs != clocktotal())
        buttonflash();

    clockrunning = false;
    $('#enable-music').prop('disabled', false);
}

function screenflash() {
    $('#flash').css({ 'width': $(document).width(), 'height': $(document).height() }).show();
    setTimeout(function(){ $("#flash").hide(); }, 250);
}

function buttonflash() {
    buttonflashes = 6;
    togglebuttonflash();
}

function togglebuttonflash() {
    if (buttonflashes % 2 == 0) {
        $('#show-answers-button').addClass('btn-warning');
        $('#show-answers-button').removeClass('btn-success');
    } else {
        $('#show-answers-button').addClass('btn-success');
        $('#show-answers-button').removeClass('btn-warning');
    }
    buttonflashes--;
    if (buttonflashes > 0)
        setTimeout(togglebuttonflash, 250);
}

function tickclock() {
    clocksecs = clocktotal() - (Date.now() - clockstarted) / 1000;
    renderclock();

    if (clocksecs <= 0) {
        clocksecs = 0;
        stopclock();
        screenflash();
    }
}

function renderclock() {
    var canvas = $('#clock-canvas');
    var c = canvas.get()[0];
    var ctx = c.getContext("2d");

    // only count down the analogue clock when < 30 secs remain
    let secs = clocksecs;
    //if (secs > 30)
    //    secs = 30;

    $('#digitalclock').text(Math.round(clocksecs));

    /* parameters */
    var dim = canvas.width();
    var mid = dim/2;

    ctx.clearRect(0, 0, dim, dim);

    /* outer rings */
    ctx.beginPath();
    ctx.arc(mid, mid, mid-5, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(127, 127, 127)'; // grey
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mid, mid, mid-7, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(34, 81, 103)'; // dark blue
    ctx.fillStyle = 'rgb(255, 255, 218)'; // light yellow
    ctx.lineWidth = 7;
    ctx.fill();
    ctx.stroke();

    /* lit-up area */
    var insideClock = 11;

    ctx.strokeStyle = 'rgb(251, 245, 88)'; // bright yellow
    ctx.lineWidth = 7;
    for (var a = 0; a <= (30 - secs); a++) {
        if (a % 15 == 0)
            continue;
        ctx.beginPath();
        ctx.moveTo(
            mid + (mid - insideClock - 2) * Math.sin(Math.PI * 2 * a / 60),
            mid - (mid - insideClock - 2) * Math.cos(Math.PI * 2 * a / 60));
        ctx.lineTo(
            mid + (mid - insideClock - 40) * Math.sin(Math.PI * 2 * a / 60),
            mid - (mid - insideClock - 40) * Math.cos(Math.PI * 2 * a / 60));
        ctx.stroke();
    }

    /* pips */
    ctx.strokeStyle = 'rgb(59, 56, 56)'; // grey
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgb(255, 255, 255, 0.7)'; // white
    for (var a = 0; a < 60; a += 5) {
        // grey line
        ctx.beginPath();
        ctx.moveTo(
            mid + (mid - insideClock - 1) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - insideClock - 1) * Math.cos(Math.PI * 2 * a / 60));
        ctx.lineTo(
            mid + (mid - insideClock - 40) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - insideClock - 40) * Math.cos(Math.PI * 2 * a / 60));
        ctx.stroke();
        // white dot
        ctx.beginPath();
        ctx.arc(
            mid + (mid - 7) * Math.sin(Math.PI * 2 * a / 60),
            mid + (mid - 7) * Math.cos(Math.PI * 2 * a / 60),
            2,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }

    /* weird cross thing */
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(mid, insideClock);
    ctx.lineTo(mid, dim - insideClock);
    ctx.moveTo(insideClock, mid);
    ctx.lineTo(dim - insideClock, mid);
    ctx.stroke();

    /* hand */
    ctx.fillStyle = 'rgb(31, 71, 132)'; // blue
    ctx.strokeStyle = 'rgb(127, 121, 109)'; // grey
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      mid,
      mid,
      8,
      Math.PI * 2 * (-secs + 10) / 60,
        Math.PI * 2 * (-secs + 20) / 60,
      true
    );
    ctx.lineTo(
        mid + (mid - insideClock - 5) * Math.sin((Math.PI * 2 * secs) / 60),
        mid + (mid - insideClock - 5) * Math.cos((Math.PI * 2 * secs) / 60)
    );
    ctx.fill();
    ctx.stroke();
}

function reset_input() {
    $('#seed').val('');
    seed = '';
}

function reset() {
    clearTimeout(numbertimeout);

    needreset = false;
    is_conundrum = false;

    clocksecs = clocktotal();
    stopclock();
    clearInterval(clockinterval);
    renderclock();

    letters = '';
    nvowels = 0;
    ncons = 0;
    vowels = str_shuffle(basevowels);
    cons = str_shuffle(basecons);

    $('#vowel-button').prop('disabled', false);
    $('#consonant-button').prop('disabled', false);
    $('#conundrum-button').prop('disabled', false);
    $('#conundrum-clue').css('visibility', 'hidden');

    for (var i = 1; i <= 9; i++)
        $('#letter' + i).html('');
    letteridx = 1;

    $('#answer').html("");
    $('#working').val('');
    $('#suggest-input').val('');
    $('#suggest-solution-output').html('');
    $('#suggest-solution-output').removeClass('alert alert-danger alert-success');
    $('#suggest-input').prop('disabled', true);
    $('#suggest-solution-button').prop('disabled', true);

    for (var i = 1; i <= 6; i++)
        $('#number' + i).html('');
    $('#numbers-target').html('000');
    for (var i = 0; i <= 4; i++)
        $('#' + i + 'large').prop('disabled', false);

    $('#show-answers-button').addClass('btn-success');
    $('#show-answers-button').removeClass('btn-warning');
}

function reset_all() {
    reset();
    reset_input();
}

function showlettersanswer() {
    if (clocksecs > 0)
        stopclock();

    if (is_conundrum) {
        $('#answer').html(conundrum_result);
        best = conundrum_result.toUpperCase();
        if (best.length >= 9)
            for (var i = 0; i < 9; i++)
                $('#letter' + (i+1)).html(best.charAt(i));
    } else {
        $('#answer').html(solve_letters_matrix(letters));
    }
    check_best_result();
}

function shownumbersanswer() {
    if (clocksecs > 0)
        stopclock();

    var numbers = [];
    var target = $('#numbers-target').html();

    for (var i = 1; i <= 6; i++)
        numbers.push(parseInt($('#number' + i).html()));

    $('#answer').html(solve_numbers(numbers, target, false));
    check_best_result();
}

function showanswer() {
  if (window.location.hash == '#numbers') {
    shownumbersanswer();
  } else {
    showlettersanswer();
  }
}

$('#suggest-solution').submit(checksolution);
function checksolution(evt) {
    evt.preventDefault();
    var input_line = $('#suggest-input').val();

    var errors = '';
    if (window.location.hash == '#numbers') {
      var my_numbers = [];
      for (var i = 1; i <= 6; i++)
          my_numbers.push(parseInt($('#number' + i).html()));
      var target = $('#numbers-target').html();
      answer_from_calc = calculate_formula(my_numbers, input_line);
      if (isNaN(answer_from_calc)) {
        $('#suggest-solution-output')
            .html(answer_from_calc + numbers)
            .addClass('alert alert-danger')
            .removeClass('alert-success');
      } else {
        diff = target - answer_from_calc;
        if (diff) {
          if (diff < 0) diff = -diff;
          $('#suggest-solution-output')
              .html(answer_from_calc + ' is ' + diff + ' off from target')
              .addClass('alert alert-danger')
              .removeClass('alert-success');
        } else {
          $('#suggest-solution-output')
              .html(answer_from_calc + ' is correct, well done!')
              .addClass('alert alert-success')
              .removeClass('alert-danger');
        }
      }
    } else {
      if (!sufficient_letters(input_line.toLowerCase(), letters.toLowerCase()))
          errors += "Wrong letters. "; /* TODO: be more specific */
      if (!word_in_dictionary(input_line.toLowerCase()))
          errors += "Word not in dictionary.";

      if (errors.length > 0) {
          $('#suggest-solution-output')
              .html(errors)
              .addClass('alert alert-danger')
              .removeClass('alert-success');
      } else {
          $('#suggest-solution-output')
              .html('Nice word!')
              .addClass('alert alert-success')
              .removeClass('alert-danger');
      }
    }
}

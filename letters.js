/* Javascript version of cntdn
 *
 * Countdown game solver
 *
 * James Stanley 2014
 */

// First part of original cntdn.js file

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

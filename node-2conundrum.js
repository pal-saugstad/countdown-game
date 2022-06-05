if (typeof(in_vm) === 'undefined') {

  // set up and run vm with the required files
  const vm = require('vm');
  const fs = require('fs');

  const context = { console: { log: (...args) => { console.log(...args); } }, input_args: process.argv };
  vm.createContext(context);

  const code = 'var in_vm = true;\n' +
    fs.readFileSync('dictionary.js',      'utf-8') +
    fs.readFileSync('dictionary-stats.js','utf-8') +
    fs.readFileSync('letters.js',         'utf-8') +
    fs.readFileSync('conundrum2.js',      'utf-8') +
    fs.readFileSync( process.argv[1],     'utf-8');
  vm.runInContext(code, context);

} else {

  // code to run in vm as the last "included" file (see readFileSync above)
  function word_stats() {

    let count = [0];
    let fast = [0];
    for (let i = 1; i < 22; i++) {
      const sslen = 2;
      const words = give_words(i);
      const first = words.next(0).value;
      let cnt = 0;
      let firstcnt = 0;
      let relcnt = 0;
      let another;
      let start = first.substring(0,sslen);
      let firstletter = first.substring(0,1);
      //console.log(i + ' ' + relcnt + ' ' + cnt + ' ' + start + ' ' + first);
      let inside = {};
      let inside2 = {};
      do {
        cnt++;
        firstcnt++;
        relcnt++;
        another = words.next(0).value;
        if (another.substring(0,sslen) != start) {
          inside2[start] = relcnt;
          start = another.substring(0,sslen);
          //console.log(i + ' ' + relcnt + ' ' + cnt + ' ' + start + ' ' + another);
          relcnt= 0;
          if (another.substring(0,1) != firstletter) {
            if (firstcnt < 100)            inside[firstletter] = firstcnt;
            else for (let ltrs in inside2) inside[ltrs] = inside2[ltrs];
            firstletter = another.substring(0,1);
            inside2 = {};
            firstcnt = 0;
          }
        }
        //console.log(another);
      } while (first != another);
      //console.log("For words with " + i + " letters, we found " + cnt);
      count.push(cnt);
      fast.push('{'+Object.keys(inside).map((key) => [key, inside[key]].join(':')).join(',')+'}');
    }
    count.push(0);
    console.log("const dictionary_word_lengths = [" + count.join(',') + "];");
    console.log("const dictionary_word_fast = [" + fast.join(',') + "];");
  }

  function show_words() {
    let t0 = new Date().getTime();
    for (let wlength = 1; wlength < 22; wlength++) {
      //console.log('Fast index for words with ' + wlength + ' letters');
      //console.log(dictionary_word_fast[wlength]);
      console.log('Show ' + dictionary_word_lengths[wlength] + ' words with ' + wlength + ' letters. Stop if different using two different algorithms (takes long time)');
      let words = give_words(wlength, 0);
      let was_diff = '';
      for (cnt = 0; cnt < dictionary_word_lengths[wlength]; cnt++) {
        let letters = words.next(0).value;
        let fast = random_word(wlength, cnt);
        if (fast != letters) {
          was_diff = 'yes';
          console.log('DIFF ' + cnt +' letters|fast| ' + letters + '|' + fast + '|');
          return;
        } else if (was_diff) {
          was_diff = '';
          console.log('same ' + cnt +' ' + fast);
        }
  //      console.log(letters);
      }
      let t1 = new Date().getTime();
      console.log("Used " + (t1 - t0) + ' ms, ' + (t1 - t0)/dictionary_word_lengths[wlength] + ' ms per word\n');
      t0 = t1;
    }
  }

  let start = new Date().getTime();
  let times = 1;
  let show_time = true;
  if (input_args[2]) {
    times = input_args[2];
    if (isNaN(times)) {
      if (times == "stats") {
        word_stats();
        show_time = false;
      } else if (times == "show") {
          show_words();
      } else {
        console.log("Nothing to do, try 'stats' or 'show'");
      }

    } else {
      console.log("Show " + times + " conundrums");
      for (let i = 0; i < times; i++) console.log(generate_conundrum());
    }
  } else {
    console.log("Show just one conundrums since no spesific number was given");
    console.log(generate_conundrum());
  }
  let stop = new Date().getTime();
  if (times > 1) {
    let duration_per_iteration = (stop - start) / times;
    console.log('Duration: ' + (stop - start) + ' ms, ' + duration_per_iteration.toFixed(1) + ' ms per iteration, ' + times + ' iterations');
  } else if (show_time) console.log('Duration: ' + (stop - start) + ' ms');
}

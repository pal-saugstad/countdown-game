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

  let start = new Date().getTime();
  let times = 1;
  let show_time = true;
  if (input_args[2]) {
    times = input_args[2];
    if (isNaN(times)) {
      if (times == "stats") {
        word_stats();
        show_time = false;
      } else {
        console.log("Nothing to do, try 'stats'");
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

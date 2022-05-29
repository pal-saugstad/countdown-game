if (typeof(in_vm) === 'undefined') {

  // set up and run vm with the required files
  const vm = require('vm');
  const fs = require('fs');

  const context = { console: { log: (...args) => { console.log(...args); } }, input_args: process.argv };
  vm.createContext(context);

  const code = 'var in_vm = true;\n' +
    fs.readFileSync('dictionary.js',      'utf-8') +
    fs.readFileSync('letters.js',         'utf-8') +
    fs.readFileSync('conundrum2.js',      'utf-8') +
    fs.readFileSync( process.argv[1],     'utf-8');
  vm.runInContext(code, context);

} else {

  // code to run in vm as the last "included" file (see readFileSync above)
  function word_stats() {

    let count = [0];
    for (let i = 1; i < 22; i++) {
      const words = give_words(i);
      const first = words.next(0).value;
      let cnt = 0;
      let another;
      do {
        cnt++;
        another = words.next(0).value;
        //console.log(another);
      } while (first != another);
      //console.log("For words with " + i + " letters, we found " + cnt);
      count.push(cnt);
    }
    count.push(0);
    console.log("const dictionary_word_lengths = [" + count.join(',') + "];");
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

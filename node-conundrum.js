if (typeof(in_vm) === 'undefined') {

  // set up and run vm with the required files
  const vm = require('vm');
  const fs = require('fs');

  const context = { console: { log: (...args) => { console.log(...args); } }, input_args: process.argv };
  vm.createContext(context);

  const code = 'var in_vm = true;\n' +
    fs.readFileSync('dictionary.js',      'utf-8') +
    fs.readFileSync('conundrum-data.js',  'utf-8') +
    fs.readFileSync('letters.js',         'utf-8') +
    fs.readFileSync('conundrum.js',       'utf-8') +
    fs.readFileSync( process.argv[1],     'utf-8');
  vm.runInContext(code, context);

} else {

  // code to run in vm as the last "included" file (see readFileSync above)
  let start = new Date().getTime();
  if (input_args[2]) {
    let times = input_args[2];
    if (isNaN(times)) times = 1;
    console.log("Show " + times + " conundrums");
    for (i = 0; i < times; i++) console.log(generate_conundrum());
  } else {
    console.log("Show just one conundrums since no spesific number was given");
    console.log(generate_conundrum());
  }
  let stop = new Date().getTime();
  console.log('Duration: ' + (stop - start) + ' ms');
}

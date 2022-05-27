if (typeof(in_vm) === 'undefined') {

  // set up and run vm with the required files
  const vm = require('vm');
  const fs = require('fs');

  const context = { console: { log: (...args) => { console.log(...args); } }, input_args: process.argv };
  vm.createContext(context);

  const code = 'var in_vm = true;\n' +
    fs.readFileSync('cntdn.js',       'utf-8') +
    fs.readFileSync( process.argv[1], 'utf-8');
  vm.runInContext(code, context);

} else {

  // code to run in vm as the last "included" file (see readFileSync above)
  input = [0,0,'-h',1,1,1,1,1,1,0];
  for (n in input_args) if (n < 10) input[n] = parseInt(input_args[n]);
  var show_all = input.pop();
  var target = input.pop();
  input.shift();
  input.shift();
  var help = input[0] == '-h';
  if (!help) {
    for (val of input) {
      if (isNaN(val)) {
        help = true;
        console.log("\nCheck input syntax!")
      } else if (val < 0) {
        help = true;
        console.log("\nNegative number not allowed");
      }
    }
  }
  if (help) {
    console.log("\nCountdown Solver\n");
    console.log("First six parameters: Input values");
    console.log("Seventh parameter:    Target value");
    console.log("Eight parameter:      If 0 or absent: Show best solution, if 1: Show all solutions");

  } else {
    let start = new Date().getTime();
    console.log('');
    console.log(solve_numbers(input, target, show_all == 1));
    console.log('Input:', input, ', Target:', [target], ', Show:', [show_all == 1 ? 'All results' : 'Best result' ]);
    let stop = new Date().getTime();
    console.log('Duration: ' + (stop - start) + ' ms');
  }

}

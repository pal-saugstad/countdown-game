# Countdown game

This repo is forked from 'jes'!

I looked for implementations of the Numbers Countdown game, and came across
https://incoherency.co.uk/countdown/

I was impressed! It is super fast and accurate.
I found the github repo for it. This is my fork of that repo.

From before, I have forked another repo which has a python implementation of the same game.
https://github.com/pal-saugstad/8-10_does_countdown

This works fine too, but it is based on randomized iteration of equations, and it is very slow compared to this implementation.

So far, I know that this implementation is scanning through all possible equations and displays the best solution(s).

I want to understand the implementation better, and if possibly optimize it further like for instance:

- Add option for running the Javascript file `cntdn.js` in a terminal under Ubuntu.
- Rewrite the output format so that it is clearer which are the input numbers and which are the intermediate calculation results.
- Sort the results from the most complex to the simplest.
- Display some statistics regarding the calculations.

#!/bin/bash

function do_test {
  echo $'\n'"$2 (result should be $3 away). Trying same input again if more that $3 away"$'\n'
  while read -r line ; do
    while : ; do
      # show=$(node ../cntdn.js $line | tail -2 | head -1)
      node ../cntdn.js $line
      #printf "%-25s|         | %s\n" "$line" "$show"
      #show=$(python3 ../../8-10_does_countdown/script.py $line | tail -2 | head -1)
      #[ $3 -eq 0 ] && want=$(echo "$show" | grep -v 'away') ||  want=$(echo "$show" | grep " $3 away")
      #[ "$want" ] && failed='' || failed=' FAILED '
      #printf "%-25s|%s%s\n" "$line" "$failed" "$show"
      #[ "$want" ] && break
      break
    done
  done < $1
}

do_test test-file "These have a solution" 0
do_test test-one-away "These haven't got a solution" 1

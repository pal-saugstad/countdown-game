#!/bin/bash

# Compare otput from different versions (or check last version only)

# Preparation (starting from folder tests)

#  mkdir js
#  git checkout HEAD~12 ../cntdn.js
#  cp ../cntdn.js js/_12.js
#  git checkout HEAD ../cntdn.js

# So, the cntdn.js of 12 commits behind was copied to js/_12.js in tests folder

# Output: the version is shown after the -> and then its output.
# The header is "assumed no of solutions | i i i i i i target"

# -----------------------------------
#  1 | 1 1 2 3 4 25 560
# -----------------------------------
# ->  js/_12.js Input [ 1, 1, 2, 3, 4, 25 ]   target: 560   show all results (1/0): false
# 25 * 2 = 50_ | _50 + 1 = 51_ | 4 * 3 = 12_ | _12 - 1 = 11_ | _51 * _11 = 561 (off by 1)
# Calculations = 228426 Result pool = 8 Results = 1
# ->  ../cntdn.js Input [ 1, 1, 2, 3, 4, 25 ] , Target: 560 , Show: Best result
# (25 * 2 + 1) * (4 * 3 - 1)   since: 25 * 2 = 50_ | _50 + 1 = 51_ | 4 * 3 = 12_ | _12 - 1 = 11_ | _51 * _11 = 561 (off by 1)
# Calculations: 228426. Results: None. Found 1 equations, off by 1
# -----------------------------------
#  10 | 50 25 75 8 8 2 230
# -----------------------------------
# ->  js/_12.js Input [ 50, 25, 75, 8, 8, 2 ]   target: 230   show all results (1/0): false
# 25 + 8 + 2 = 35_ | _35 * 8 = 280_ | _280 - 50 = 230
# Calculations = 680459 Result pool = 86 Results = 10
# ->  ../cntdn.js Input [ 2, 8, 8, 25, 50, 75 ] , Target: 230 , Show: Best result
# (25 + 8 + 2) * 8 - 50   since: 25 + 8 + 2 = 35_ | _35 * 8 = 280_ | _280 - 50 = 230
# Calculations: 680151. Results: 10
# (...)

while read -r cnt codes ; do
  echo "-----------------------------------"
  echo " $cnt | $codes"
  echo "-----------------------------------"

  while read -r p_js ; do
    [ "$p_js" ] || continue
    echo -n "->  $p_js "; node ${p_js} $codes
  done <<< "$([ -d js ] && find js -type f | grep '_')
../cntdn.js"
done < codes

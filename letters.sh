#!/bin/bash
tf=$(mktemp)
cat dictionary.js letters.js letters-console.js >$tf
node $tf $@
rm $tf

#!/bin/bash -i

echo "Generujem dokumentáciu JavaScript kódu"

if [ -d ./jsdocs ]; then
    rm -r ./jsDocs
fi

npx jsdoc -c "./jsDocConf.json"

echo "Generujem dokumentaciu PHP kodu"

phpdoc --config phpDocConf.xml
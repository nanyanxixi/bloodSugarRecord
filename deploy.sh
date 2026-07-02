#!/bin/bash

npm run build

cd dist

git init
git add -A
git commit -m 'deploy'

git push -f https://github.com/nanyanxixi/bloodSugarRecord.git master:gh-pages

cd -
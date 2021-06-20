cd $1
npm install ../../ --save
npm uninstall hiraeth
sed -i 's/"hiraeth"/"@eeue56\/coed"/g' src/index.ts
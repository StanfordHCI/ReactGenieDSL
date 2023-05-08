ReactGenieDSL: language parser and interpreter for ReactGenie
=========================================================
Jackie Yang (jackie@jackieyang.me)
----------------------------------

before run:

```bash
npm ci
peggy lib/dsl/parser.pegjs -o lib/dsl/parser.gen.js
```

test:

```bash
export api_key=sk-***** # your api key here
npx jest
```
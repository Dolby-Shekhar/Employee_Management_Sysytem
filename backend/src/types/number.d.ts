// NOTE: this file previously declared `declare const Number: (value: any) => number;`
// which shadowed the JavaScript global `Number` and broke `res.status(...).json(...)`.
// It has been emptied; do not redeclare globals here.

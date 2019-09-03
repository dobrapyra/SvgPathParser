# SVG path parser
Simple SVG path parser

## Example
```js
var pathD = 'M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z';

(new SvgPathParser({
  precision: 100000,
  outputMode: 'array'
})).parse(pathD).result();
```

## Constructor
Create the new parser object.
```js
new SvgPathParser({/* options */})
```

## Options
* `precision` - {integer} rounding precision
* `outputMode` - {string} mode of output formatting
  * `array`
  ```js
    [[0, 0], [0, 1], [1, 1], [1, 0]]
  ```
  * `object`
  ```js
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}]
  ```

## Methods
* `parse(d)` - parse `d` string from attribute and create list of commands and points, return parser object
* `result()` - round & format points, return result object
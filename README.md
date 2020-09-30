# readhub-cli
[![Actions Status](https://github.com/aerycat/readhub-cli/workflows/action/badge.svg)](https://github.com/aerycat/readhub-cli/actions)
> a cli tool for [readhub.cn](https://readhub.cn)

## Install
```
$ npm install -g git+https://github.com/aerycat/readhub-cli.git
```

## Usage
```
$ readhub
```

## Options
| argv           | type               | effect                                |
| -------------- | ------------------ |-------------------------------------- |
| -s, --size     | number(1 ~ 100)    | Set the number of list items          |
| -i, --interval | number(s, >= 1)     | Set refresh interval                  |
| -r, --reverse  | boolean            | Set the reverse direction of the list |
<br />

> ### Example:
```
$ readhub -s 20 -i 50000 -r
```

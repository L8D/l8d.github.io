---
layout: post
title: "Introducing ku.js"
date: 2014-08-24 11:10 PM
---

ku.js is a JavaScript library providing functional bindings for everyday
JavaScript operations inspired by [Underscore](https://underscorejs.org) and
[wu.js](https://fitzgen.github.io/wu.js).

> **DISCLAIMER**:
> ku is in very early stages of development. Some statements
> made below are refering to the goal of the project and not the current state
> of it. It is not recommended to use ku in any production environments yet as
> it may be unstable.

The project started as an implementation of Brian Lonsdorf's psuedo-code seen
in his [talk](https://youtu.be/m3svKOdZijA)[s](https://youtu.be/ww2Z1URx-G0)
given at HTML5DevConf last year, "Hey Underscore, you're doing it wrong!"
In this presentation, Brian goes over how Underscore isn't truly "functional"
and the basics of functional programming. The point behind the talk is to show
how a truly-composable functional toolset would work in JavaScript, in
addition to showing functional programming patterns.

To jump to the point, ku.js intends to be an Underscore alternative that
provides a slew of features to aid declarative programming structures:

- ku.js will have a much smaller library. I am aiming to keep it under 4k after
  all lodash features are implemented. For now it is relying on
  Underscore/LoDash for a lot of fallback behavior.

- All ku methods automatically curry.

- Functions like `map`, `filter`, `reduce`, `first` and `split` take their data
  argument last.

- Nearly all operators are built-in to ku. `ku.add(1, 2)` is the same as
  `1 + 2`. They can be also be curried such that `ku.add(1)` is the same as
  `function(y) { return 1 + y; }`.

# The obligatory example(s)
```javascript
var getBanList = function() {
  return Users.fetch().then(function(users) {
    return _.filter(users, function(user) {
      return user.banned;
    });
  }).then(function(users) {
    return _.pluck('username', users).join('\n');
  });
};
```

beomces

```javascript
var getBanList = function() {
  Users.fetch()
    .then(ku.filter(ku.attr('banned')))
    .then(ku.pluck('username'))
    .then(ku.method('join', '\n'));
};
```

or alternatively

```javascript
var getBanList = function() {
  Users.fetch()
    .then(ku.filter(ku.attr('banned')))
    .then(ku.compose(ku.method('join', '\n'), ku.pluck('username')));
};
```

If you're interested, checkout the [GitHub repo](https://github.com/L8D/ku) but
outside of this really short blog post there won't be any documentation until
tomorrow.

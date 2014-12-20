---
layout: post
title: JavaScript Behind Us
date: 2014-12-18 4:10 AM
published: no
---

The JavaScript community has thrived on the philosophy that jQuery catalyzed.
JavaScript has a thin "standard" library with an extreme amount of flexibility.
You can take the simplicity behind strings, arrays and objects and create
wonderfully beautiful APIs, but there are several costs to them.

First, I would say that the underlying implementations behind "fancy" APIs
rely on many odd-but-leveragable features of the language which are also used
inconsistently. For example, think about how often prototypal inheritance is
used over copying objects key-by-key. You might have your own opinion on when
and where to use the two, but in most cases either method will do fine.

In reality, there are subtle differences that can cascade through your code and
libraries because of assumptions that browsers and vendors make about
"idiomatic" JavaScript. Using function hoisting gives you function names and
a usually-faster static analysis check, but is inconsistent with scoping laws
and the "functions are just variables" notion. Imperatively assigning object
properties give consistency to some code structures and allow for clean
inheritance in objects, but can lead to performance issues when properties are
assigned out of order, and prevents certain static analysis guarantees and
code conciseness.

I could go on and on but the point is that the world of JavaScript is
incredibly diverse. All breeds of developers starting to work with the
language. These different opinions impact things in such a way that many of us
oversee. This is why we have frameworks like Ember.js, AngularJS, Polymer and
the many more you can see [here](http://todomvc.com/).

Another point to make is that all of these "features" getting introduced are
being implemented at **runtime**. Using a fancy library that lets you get
elements with CSS selectors means that you are incurring its cost on your
product in terms of runtime efficiency, file size and bloat. Many don't care
about performance. Many rely on the speed of our modern engines to compensate
for our ignorance towards performance.

I believe that using large (and likely bloated) frameworks can introduce an
extreme penalty to your page load. They incur a cost not only in size (which
shouldn't matter in most cases) but they also incur a runtime speed cost. When
your app depends on establishing a web socket, grabbing initial data from an
Ajax call or parsing, serializing and rendering a template on every page load,
you quickly end up with 300-500ms of delay that your JavaScript is responsible
for.

Every time you use a library like LoDash or jQuery to make your life easier,
when you could've just written out that for-loop or used that native query,
you could've instead used a compiler which provides these abstractions at a
much smaller cost, and compiles everything down to for loops and native DOM
selectors. This is the largest argument I have against writing JavaScript by
hand. The majority of abstractions that we use in our apps such as promises,
data binding, templates, etc. are implemented in JavaScript, and could probably
be implemented as part of a compiler.

Techniques like dirty checking or explicit update events could be thrown away
with the use of some static analysis, type signatures and a compiler. The same
goes for the abstractions provided by jQuery, LoDash, Mustache templates and
even module loaders.

However, our current solutions are either too primitive (i.e. transpilers or
imperative languages in general) or too out-of-reach for the common developer.
(i.e. functional/declarative languages like Clojure, Haskell, Elm) The latter
I consider to be powerful enough and the associated compilers of JavaScripts
for them will only get better going forward.

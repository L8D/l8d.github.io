---
layout: post
title: JavaScript is Behind Us
date: 2014-12-18 4:10 AM
published: no
---

The JavaScript community has thrived on the philosophy that jQuery catalyzed.
JavaScript has a thin "standard" library with an extreme amount of flexibility.
You can take the simplicity behind strings, arrays and objects and create
wonderfully beautiful API's, but there are several costs to them.

First, I would say that the underlying implementations behind "fancy" API's
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
your application depends on establishing a web socket, grabbing initial data
from an Ajax call or parsing, serializing and rendering a template on every
page load, you quickly end up with 300-500ms of delay that your JavaScript is
responsible for.

Every time you use a library like LoDash or jQuery to make your life easier,
when you could've just written out that for-loop or used that native query,
you could've instead used a compiler which provides these abstractions at a
much smaller cost, and compiles everything down to for loops and native DOM
selectors. This is the largest argument I have against writing JavaScript by
hand. The majority of abstractions that we use in our applications such as
promises, data binding, templates, etc. are implemented in JavaScript, and
could probably be implemented as part of a compiler.

Techniques like dirty checking or explicit update events could be thrown away
with the use of some static analysis, type signatures and a compiler. The same
goes for the abstractions provided by jQuery, LoDash, Mustache templates and
even module loaders.

However, our current solutions are either too primitive or too out-of-reach for
the common developer. The latter I consider to be powerful enough and the
associated compilers of JavaScripts for them will only get better going
forward. To elaborate, the former "too primitive" compilers would be the
transpilers such as CoffeeScript, TypeScript, PureScript (another blog post on
that eventually) as well as the OOP-influenced imperative languages such as
Opal, Dart, GWT, etc.

The latter would be the declarative functional languages such as Clojure,
Haskell, Elm, etc. which are only high-enough-level to allow for incredible
app optimizations, but can also be used for writing entire front-ends which
allows for full-app optimizations including the templates, markup, CSS and
more. Writing user interfaces in a declarative style gives a lot of room for
custom underlying *optimizable* implementations.

The problem is, many people aren't prepared to jump the gun and start writing
client-side JavaScript applications in Haskell. Many project managers aren't
aware of or simply don't trust the technologies. Many developers are already
comfortable working with Angular or Ember and don't understand the benefits
behind working with a compiled and/or statically typed language. And, of
course, many think that using a library like React with Immutable.js data
structures is enough to be called "functional" and that it is the most
practical way to write JavaScript.

With Elm, you write 'widgets' which are then rendered on the document body.
Elm has knowledge and control over how those widgets are rendered, what
resources and events they rely on, the starting state of the element and even
the entry point location when you let it generate html.

ClojureScript (although I haven't legitimately used it) optimizes output
specifically for Closure compiler advanced compilation (i.e. function call
in-lining, dead-code elimination and more). With this, in addition to the rich
ecosystem of meta-programming and DSL's, you can produce incredibly speedy
applications.

With Haskell you have to choose between GHCJS and Haste. I would not recommend
using PureScript for production applications for various reasons. In my
opinion, GHCJS is more useful for running Haskell programs in JavaScript, and
Haste is more useful for writing JavaScript programs in Haskell. Haste has
closer semantics to JavaScript, with a thin FFI and usually small output. GHCJS
feels closer to GHC, with very few instances where the JavaScript aspect truly
shows.

Either way, I would recommend using Elm over GHCJS or Haste for building
front-end applications due to both maturity, and the priorities that the
communities around them seem to have. Haste has Blaze templates which means you
have the same limitations as building applications with Backbone and Mustache
templates. On the other hand, [Shade](https://github.com/takeoutweight/shade/),
which hasn't been officially released, seems to provides a promising
React-style interface with some FRP capabilities (in a similar vein of Elm).
GHCJS does have a [React wrapper](https://github.com/iand675/ghcjs-react) but
it doesn't seem to be going anywhere.

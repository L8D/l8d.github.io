---
title: React on Both Sides
layout: post
date: 2014-09-27 5:00 PM
description: A how-to on writing isomorphic React apps
published: false
---

React is an relatively-new view engine library from Facebook that has seen a
large influx of popularity since it came out. There are several things about it
that haven't really been tried or seen in any modern framework or engine
before. In this post I will be covering one of those features: isomorphism.

One of the many uniques features that React provides is near-complete
implementation of the DOM in JavaScript. This includes everything from element
properties to HTML5-specific events. This is used both to provide polyfills for
anything that could be missing in an environment, and as a means for a "Virtual
DOM" that Facebook advertises as one of React's core features.

Because of this pure implementation, we can use React is a variety of
environments without needing an actual DOM, including Node.js, which means
that we can use React to generate our client-side views on the server in
addition to the client. So how do we do this? Well there are two solutions: the
naive approach and the truly-isomorphic approach.

Before we move on, I should start with how I do isomorphism.

## Browserify

After taking inspiration from
[Airbnb's Isomorhpic JavaScript article](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/),
I've taken to using James Halliday's amazing
[Browserify](http://browserify.org/) module for writing client-side JavaScript
in CommonJS format. The hopefully-obvious reason for this is so that I can
easily interact with and require client-side code from my server-side Node.js
code (and vice-versa). In addition to that, I'll be using
[Reactify](https://github.com/andreypopp/reactify) and
[node-jsx](https://github.com/petehunt/node-jsx) in order to use Facebook's
[JSX](http://facebook.github.io/jsx/) syntax for writing my React components.

The configuration will look something like this:

`./package.json`

```javascript
{
  // ...
  "browserify": {
    "transform": [
      ["reactify", {"extension": "jsx"}]
    ]
  }
  // ...
}
```

`./server.js`

```javascript
// ...
require('node-jsx').install({extension: '.jsx'});
// ...
```

I'll assume you know or will follow the guides on how to setup Browserify.

## Everything is a Component

In order for us to have complete control over how every part of our site is
rendered, we'll need to use React for **everything**. This means we will use
React to render every element in our markup, all the way to the `<html>` tag
itself. We'll start with this (forgive the unfortunate syntax highlighting of
pygments):

`./app/page.jsx`

```javascript
/** @jsx React.DOM */
'use strict';

var Router = require('./router.jsx')
  ,  React = require('react')
  ;

module.exports = React.createClass({
  render: function() {
    return (
      <html>
        <head>
          <meta encoding="utf-8"/>
          <title>MyApp</title>
          <link rel="stylesheet" href="main.css"/>
        </head>

        <body>
          // we'll get to this part later
          {Router(this.props.route)}

          <script src="bundle.js"/>
        </body>
      </html>
    );
  };
});
```

## Rendering

React alone has three different methods for rendering your components.
`renderComponent` is for rendering directly to a DOM node, in which React will
perform DOM diffing and such to perform updates. Secondly,
`renderComponentToString` is used for doing a one-time render of the component
and returning the resulting markup. More confusingly,
`renderComponentToStaticMarkup` essentially does the same as the latter, but
will result in markup without any React-related metadata.

### Client

In our client-side code it is pretty straight-forward to setup the initial page
render. We just need to `renderComponent` on `document` like so:

`./app/app.js`

```javascript
'use strict';

var  Page = require('./page')
  , React = require('react')
  ;

document.addEventListener('ready', function() {
  React.renderComponent(Page(), document);
});
```

### Server

Performing this action on the server-side might seem just as trivial initially.
The `renderComponentToString` is specifically meant for server-side rendering,
and is said so in React's
[API documentation](http://facebook.github.io/react/docs/top-level-api.html#react.rendercomponenttostring).
So here's the naive approach (using [Express](http://expressjs.com/) for route
handling):

`./renderer.js`

```javascript
'use strict';

var  Page = require('../app/page.jsx')
  , React = require('react')
  ;

module.exports = function(req, res) {
  var markup = React.renderComponentToString(Page());

  res.send('<!doctype html>' + markup);
};
```

Now the above example can work fine, but there are a few small problems. First,
if there are any errors in our React component that get thrown during initial
rendering, then they will throw inside node too, meaning we can't handle them
without a try-catch block. Secondly, and more subtlely, if we want to have
isomorphic rendering, we would need to perform all of our asynchronous
operations in the above code. This would force us to pass all data in through
the component properties, and avoid using component state in React.

To solve this problem, we will use the [React
Async](https://github.com/andreypopp/react-async) library, which includes both
an asynchronous replacement for `renderComponentToString` and a React mixin we
can use to define React components that need asynchronous state generation.
Here's how we'll use it:

`./renderer.js`

```javascript
'use strict';

var  Page = require('../app/page.jsx')
  ,    RA = require('react-async')
  ;

module.exports = function(req, res) {
  RA.renderComponentToStringWithAsyncState(Page(),
    function(err, markup) {
      res.write('<!doctype html>\n');
      res.write(markup);
      res.end();
    });
};
```

## Routing

Now that we have the basics behind our server-side rendering covered, let's go
deeper into the isomorphism with app routing! For this we'll be using the
excellent [React Router](https://github.com/rackt/react-router) library to
define and traverse our routes.

However, you might come to a dilemma on what parts of your app you need to keep
as they are, and what parts you need to put into your React app and it's
router. The answer is, like said above, make **everything** a component, since
you can just write your entire app in React and have it work as a lean
JavaScript single-page-application and also work fine when JavaScript is
disabled or a search engine wants to index your pages.

Again, when I say everything, I mean everything. Your splash page, login form,
preferences menu, "About Us" tab, everything will be written in a React
component.

### Client

Using the React Router library is quite simple:

`./app/router.jsx`

```javascript
'use strict';

var   Splash = require('./pages/splash.jsx')
  ,  AboutUs = require('./pages/about.jsx')
  , NotFound = require('./pages/404.jsx')
  ,   Router = require('react-router')
  ,     Main = require('./main.jsx')
  ;

var Routes = Router.Routes
  , DefaultRoute = Router.DefaultRoute
  , Route = Router.Route
  ;

module.exports = function(route) {
  return (
    {/* if a route is supplied use it */}
    {/* otherwise use the browser history */}
    <Routes location={route ? null : 'history'} fixedPath={route}>
      <Route name="main" path="/" handler={Main}>
        <DefaultRoute handle={Splash} />
        <Route name="about" handler={AboutUs} />
      </Route>

      <NotFoundRoute handle={NotFound} />
    </Routes>
  );
};
```

`./app/app.jsx`

```javascript
/** @jsx React.DOM */
'use strict';

var React = require('react')
  ;

module.exports = React.createClass({
  render: function() {
    return (
      <div class="main">
        <header>
          <nav>
            <Link to="main">Home</Link>
            <Link to="about">About Us</Link>
          </nav>
        </header>

        {/* where the rest of the markup of the route goes */}
        <this.props.activeRouteHandler/>
      </div>
    );
  }
});
```

### Server

From this point forward, any HTML-written page that has any relevance to the
app will be written as a commonJS module that exports a React component. We
will then just rely on the router to handle the routing for us on both the
client and server. Also, since this is handling our 404 pages, we can just put
this at the end of our Express app to handle anything that doesn't get caught
by middleware.

This allows us to give the client a complete version of the app that works
completely independently of the server. It also means that we could (or should)
re-order the position of our router and move what we have in `page.jsx` into
the App component, just so that we can have full access to the HTML if we need
precise responses like with 404 or 500 page.

Anyways, the code is also relatively straight forward:

`./renderer.js`

```javascript
'use strict';

var  Page = require('../app/page.jsx')
  ,    RA = require('react-async')
  ;

module.exports = function(req, res) {
  RA.renderComponentToStringWithAsyncState(Page({
    route: req.path
  }), function(err, markup) {
    res.write('<!doctype html>\n');
    res.write(markup);
    res.end();
  });
};
```

`./app.js`

```javascript
var renderer = require('./renderer')
  ;

// ...

app.use(renderer);
```

Now that we have the server rendering the same markup with the same code as the
client, we get to this grey area where are no longer writing "client-side code"
or "server-side code". Although we can still make a distinction between
"front-end code" and "back-end code" because the two parts to our codebase will
be the REST API and the corresponding React app.

We can come to the conclusion of "How do we write isomorphic JavaScript?" or in
lamen terms: "How can we write code that works on both the client and the
server?"

## Isomorphism

So at this point I would go on in the rest of the article about isomorphic
JavaScript and how to use Browserify and Superagent and npm library X that
provides a unified API to do something. But right now I am tired. I just want
to publish this. So to continue on this stuff for now, go read
[Airbnb's Isomorhpic JavaScript article](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/)
that I mentioned earlier.

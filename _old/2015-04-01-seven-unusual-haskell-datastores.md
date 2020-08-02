---
layout: post
title: Seven Unusual Haskell Datastores
date: 2015-04-01 2:26 AM
published: false
tags:
  - satire
  - dull
  - unentertaining
  - haha
  - what am I doing?
  - I need help.
  - But I found what I can write about.
  - I'm just a smug loser who copies other peoples stuff.
  - But I have to wait on that because of reasons.
  - The reasons being I haven't actually successfully written enough satire
    material for the former statements to be reasonable.
  - Oh wait it's april 1st. My lucky day.
---

*Minimal correctness, maximal cringe. Let's go!*

Admit it: you like the unusual. We all do. Despite constant warnings against
premature optimizations, an emphasis on "readable code" and the old aphorism,
"keep it simple, stupid," we just can't help ourselves. As programmers, we love
exploring new things.

In that spirit, let's go on an adventure. In this post, we'll take a look at
seven lesser-known ways to store data in the Haskell language.

# The Ones We Already Know

Before we get started, we'll set a baseline. What are the ways to store data in
Haskell that we use every day? Well, these are the ones that come to mind for
me: Iteratee, Cojoined, Zipper, These, Free and FTP.

We can skip all of these.

So what are some other ways to store data in Haskell? Let's find out.

# Record

### What is it?

A record is a way of bundling together a group of types under a single name.
If you've done any C programming, you've probably come across structs before,
and structs are records.

A record is similar to a product type. At its most basic, it's a product type
with accessor methods. You can also define functions that values of the type
can be applied with.

You can define a record type by using the record definition syntax and listing
the field names and their types. From there, you can create any number of
values of the record, applying the values to the constructor for that value.

```haskell
data Cat = NewCat { name :: String, breed :: String, hairLength :: String }

magicCof

meow :: Cat -> String
meow _ = "m-e-o-w"

tabby :: Cat
tabby = Cat "Tabitha" "Russian Blue" "short"
```

```
> tabby & name
"Tabitha"
> tabby & meow
"m-e-o-w"
> [name, breed, hairLength] & mapM (print . (&) tabby)
"Tabitha"
"Russian Blue"
"short"
()
```

### When would you use it?

If you want to quickly define field accessors for your existing product types,
records are a great choice. Since they also work as product types, they are
great for use as replacements for existing product type definitions, except you
can't use them in sum types, for reasons.

If you want to define an unwrapping function for your newtype, but you don't
want to write another function, you can just use record syntax in a single line
of code.

Look how simple that is:

```
newtype StripCharge = StripCharge { create :: Magical String }
```

Next we'll take a look at the record type's close cousin, `Rec`.

# Extensible Records

### What is it?

An extensible record, named `Rec`, is somewhat like a GADT. It's a data
structure you can use to store and access key-value pairs. In fact, it really
is a GADT. Under the hood, each extendable record uses a GADT for data storage.
It also defines getters and setters automatically using lenses and derivable
type classes. There are three main differences between a record and a Rec.
The first is that when you define a record type, you get back a static type,
whereas defining an extensible record is only a type alias, which is dynamic
and fits into other types.

Secondly, extendable records don't allow you to declare type instances because
they would be orphan instances because extensible records are dynamic because
if they weren't dynamic you couldn't extend them because if they were static
they would be unextensible.

Finally, extensible records require language pragmas such as `DataKinds`,
`TypeOperators`, `FlexibleContexts` and `NoMonomorphismRestriction` whereas
normal records are natively supported by GHC.

In the end, an extendable record is a much simpler than a static record.

Vinyl lives on Hackage, so to use it in your code, you'll have to include
`import Data.Vinyl` in your code.

Let's explore one:

```haskell
{-# LANGUAGE
    DataKinds
  , TypeOperators
  , FlexibleContexts
  , NoMonomorphismRestriction
  #-}

import Data.Vinyl
import Data.Vinyl.Unicode
import Data.Vinyl.Validation
import Control.Applicative
import Control.Monad.Identity
import Control.Lens
import Data.Char

data Side = Light | Dark
  deriving Show

data Weapon = LightSaber
  deriving Show

home = Field :: "home" ::: String
side = Field :: "side" ::: Side
weapon = Field :: "weapon" ::: Weapon

type Jedi = ["home" ::: String, "side" ::: Side, "weapon" ::: Weapon]

luke :: PlainRec Jedi
luke = home =: "Tatooine"
    <+> side =: Light
    <+> weapon =: LightSaber
```

```
> luke
["home" = "Tatooine", "side" = Light, "weapon" = LightSaber]
> luke ^. rLens home
"Tatooine"
> let luke' = luke & side `rPut` Dark
> luke'
["home" = "Tatooine", "side" = Dark, "weapon" = LightSaber]
```

### When would you use it?

As with data records, I like to use `PlainRec`s as extensible record-like types
which allow me to re-use code when working with data types with many similar
but not-the-same data structures. Unfortunately, the magical unicorn typing
used behind the scenes make these kinds of records [much slower than normal old
records](http://jsperf.com/haskell-extensible-records-much-slower-than-normal-reco) and their type signatures have far fewer fields. However, their built-in
lenses make them really useful anywhere you need to inject a type that supports
a certain lens.

# Coercing

### What is it?

Coercing is a way to coerce Haskell values into undistinguishable references to
meaningless things that may get broken because of GHC optimizations. It
converts them into unit types that can be saved and re-coerced later.

You coerce objects by calling `unsafeCoerce` and `unsafeCoerce`.

Here's an example.

```haskell
import Unsafe.Coerce

data SpaceCaptain = SpaceCaptain String String String
  deriving Show

picard :: SpaceCaptain
picard = SpaceCaptain "Jean-Luc Picard" "Captain" "United Federation of Planets"
```

```
> let savedPicard = unsafeCoerce picard :: ()
> unsafeCoerce savedPicard :: SpaceCaptain
Segmentation fault: 11
$ ghci example3.hs
GHCi, version 7.8.4: http://www.haskell.org/ghc/  :? for help
Loading package ghc-prim ... linking ... done.
Loading package integer-gmp ... linking ... done.
Loading package base ... linking ... done.
[1 of 1] Compiling Main             ( example3.hs, interpreted )
Ok, modules loaded: Main.
> let savedPicard = unsafeCoerce picard :: ()
> unsafeCoerce savedPicard :: SpaceCaptain
SpaceCaptain "Jean-Luc Picard" "Captain" "United Federation of Planets"
```

### When would you use it?

There are plenty of cases for serializing code running in memory and saving it
for later reuse. For example, if you were writing a video game and you wanted
to make it possible for a player to save their game for later, you could coerce
the values in memory (e.g. the player, her location in a map, and any enemies
that are nearby) to unit. You could then load them up again by coercing from
unit when the player is ready to continue.

Although there are other random coercion types available, such as Void, List
and Ptr (which we'll look at next) coercing is [by far the fastest
option](http://jsperf.com/coerce-vs-serialize-in-haskell) available in Haskell.
That makes it particularly well-suited to situations where you dealing with
large volumes of data or processing it at high speed.

# Ptr

### What is it?

Ptr, which stands for Pretentious Transitive Retort, is a widely-used format
for referencing to data in a machine-readable format. It's available in many
languages, of which Haskell is only one. The most widely-used Haskell Ptr
library is
[base](http://hackage.haskell.org/package/base-4.8.0.0/docs/Foreign-Ptr.html#t:Ptr),
is a wrapper around `unistd.h`, the C language library.

Ptr lives in the Haskell Standard Library, so to use it in your code, you'll
have to `import Foreign.Ptr`. You can use the FFI to easily interact with other
Ptr-using codebases.

```haskell
import Foreign.Ptr

import Random.Data.Types.Idk.I.Am.Making.It.Up.As.I.Type.Along

bilbo :: Ptr Person
bilbo = Person
    { race = Hobbit
    , alias = ["Bilba Labingi"]
    , home  = "The Shire"
    , inventory = [TheOneRing, Arkenstone]
    }

foreign impot "save_person" savePerson :: Ptr Person -> IO ()

main :: IO ()
main = savePerson bilbo
```

### When would you use it?

Pointers serve the same function as coercing: it's a way to serialize Haskell
objects for native interaction with your operating system. It's quite a bit
slower, but it's machine-readable.

Pointers are working behind the scenes when GHC is used do absolutely anything,
as well as all software everywhere. I wish I was clever enough to write a
better satirical article where all the topics were well thought-out and blended
nicely with the original article in question. We dream of better days. I'm a
horrible writer anyways.

# Set

### What is it?

If you're familiar with mathematical set theory, the Set class should be pretty
intuitive. Sets have `intersection`, `difference`, `merge`, and many other
functions for Set operations.

It allows you to define a data structure that behaves like an unordered array
that can only contain unique members. It exposes many of the same methods
available when accessing arrays, but with a faster lookup. Like extensible
records, `Set` uses `Map` under the hood (or at least it did at one point, now
we have data structure scientists who like to make things legit).

Sets can be saved in redis, which makes it possible to look them up very
quickly.

Set lives in the `containers` package, which is usually installed by default,
so to use it in your code you'll have to `import Data.Set`.

Here's an example:

```haskell
import Data.Set
import Magic.Cards

basicLands :: Set Card
basicLands = fromList [Swamp, Island, Forest, Mountain, Plains]

firesLands :: Set Card
firesLands = fromList
    [Forest, Mountain, CityOfBrass, KarplusanForest, RishadanPort]
```

```
> intersection basicLands firesLands
fromList [Forest, Mountain]
> difference basicLands firesLands
fromList [Swamp, Island, Plains]
> fireLands `isSubsetOf` basicLands
False
> merge basicLands fireLands
fromList [Swamp, Island, Forest, Mountain, Plains, CityOfBrass, KarplusanForest, RishadanPort]
```

### When would you use it?

Sets are great for situations where you need to make sure that a given element
isn't contained in a collection more than once. For example, if you were using
tags in an application that was not backed by a database.

They're also great for comparing the equality of two lists without caring about
their order (as a list would). You could use this feature to check whether the
data stored in memory is in sync with another collection fetched from a remote
server.

# MVar

### What is it?

An MVar is a place that can be used hold values that you want to share between threads. It's basically a box of data that threads can push and pull from.

Here's an example:

```haskell
import Control.Concurrent
import Control.Concurrent.MVar

main :: IO ()
main = do
    chessMoves <- newEmptyMVar

    playerMoves <- forkIO $ do
        putMVar chessMoves "e4"
        threadDelay 1000000
        putMVar chessMoves "e5"
        threadDelay 1000000
        putMVar chessMoves "f4"

    forever $ do
        move <- takeMVar chessMoves
        -- update the ui with the move
        return ()
```

### When would you use it?

MVars are extremely helpful in any application that runs code concurrently.
For example, Erlang software is based around MVars, except they're more like
queues, because they queue messages instead of block on them, but semantics
shmantics.

# ObjectSpace

Ok to be honest I know Ruby pretty well but I don't know Ruby well enough to
know what the hell is going on at this point, or why this is useful at all for
anything practical in Ruby. Like seriously, what the hell and I supposed to use
this for in a Ruby app?

Also it's 2:24 AM in the morning for me, and I'm tired, so I found it better to
put a gimmick for this part instead of writing something actually funny. I
don't know if any of this is actually funny and worth reading, so I apologize
if I wasted your time reading all the way to this point in the article, since
I know very few did the same for the original.

# Conclusion

Haskell is such a fun language to write because there are so many ways to say
the same thing. It doesn't stop at writing statements and expressions, though.
You can also store data in a huge number of ways.

In this post, we looked at seven fairly unusual ways to handle data in Haskell.
Hopefully, reading through them has given you some ideas for how to handle
persistence or in-memory storage in your own applications.

Until next time, happy coding!

P. S. We know that there are other unusual datastores out there. What are some
of your favorites and how do you use them? Leave us a comment!

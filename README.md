# loudo-elements

Easily produce [El](https://github.com/p-jack/loudo-bind) instances with
inline CSS from TypeScript.

Here's a quick example:

```TypeScript
import { styled } from "loudo-styled"
    
const h1 = styled("h1")`
  font-family: impact;
  font-size: 72pt;`

const element = h1("Hello, world!")
document.body.appendChild(element.dom)
```

## `styled`

The `styled` function dynamically adds a CSS class with the specified
CSS and returns a factory function that makes HTML elements with that
class applied. The CSS classes are added to a `<style>` element that
is dynamically added to the document's `<head>` when `styled-elements`
is loaded.

The simplest way to use the `styled` function is to specify a (valid!)
HTML tag and the CSS rules as a trailing template string:

```TypeScript
import { styled } from "@pjack/styled-elements"

const h1 = styled("h1", `
  font-size: 24pt;`)
```

The above example adds the following rule to the dynamic `<style>`
element:

```css
.h1-1 {
  font-size: 24pt;
}
```

Note the trailing `-1`. Each class is numbered, so multiple classes for
the same element type can co-exist without issue.

The `styled` function returns a factory that you can use to produce
styled `El` instances:

```TypeScript
el(document.body).add(h1("Hello, world!"))
```

The above code adds the following to the DOM:

```html
<body>
  <h1 class="h1-1">Hello, world!</h1>
</body>
```

### Specifying Class Prefixes

Some elements (like `<div>`) will have dozens or hundreds of classes,
so you can specify a second string to be used as the class prefix.
The actual class name will still be numbered, but manually specifying
prefixes can make it easier to debug styles in a browser:

```TypeScript
const veil = styled("div", "veil", `
  background-color: rgba(0, 0, 0, 50%);`)
```

The above example would add the following to the dynamic `<style>`:

```css
.veil-2 {
  background-color: rgba(0, 0, 0, 50%);
}
```

You'd use the factory just like before:

```TypeScript
el(document.body).add(veil())
```

Which would add the following to the DOM:

```html
<body>
  <div class="veil-2"></div>
</body>
```

## Using the Factories

### Inner Text

You can specify inner text when you call the factory returned by
`styled`:

```TypeScript
const h1 = styled("h1", `
  font-size: 24pt;`)
el(document.body).add(h1("Hello, world!"))
```

### Attributes

You can also specify attributes when you call the factory:

```TypeScript
const emailField = styled("input", `font-family: monospaced;`)
const cached = localStorage.get("email") ?? ""
document.body.appendChild(emailField({ type:"email", value: cached }))
```

### Getting the Generated Class Name

Again, the `styled` function appends a number to the class names it
generates to keep them unique. If you need the class name (including
the unique numeric suffix), you can just use the `className` property
on the factory:

```TypeScript
const h1 = styled("h1", ``)
console.log(h1.className) // prints h1-1
```

You _can_ use this to add pseudo-selector behavior to the elements,
but it's better to use the `with` function instead.

### Using `with`

The factories produced by `styled` have a `with` function that can
be used to add sub-rules based on the unique class.

For example, the following code uses `with` to highlight a button on
hover:

```TypeScript
const button = styled("button", `background-color: lightgray;`)
button.with(":hover", `background-color: white;`)
```

The above example produces the following two rules:

```css
button-1 {
  background-color: lightgray;
}
button-1:hover {
  background-color: white;
}
```

## `keyframed`

The `keyframed` function adds both a set of `@keyframes` to the dynamic
style sheet and a CSS class that uses those keyframes. It returns the
(unique, suffixed) name of the class.

The `keyframed` function takes one parameter, the `animation` property
value for the returned class. The keyframes are specified as a
template string.

Here's an example that uses `keyframed` to fade the document in:

```TypeScript
import { keyframed } from "@pjack/styled-elements"

const fadeIn = keyframed("500ms ease forwards fadeIn", `
  from { opacity: 0; }
  to { opacity: 1; }`)
document.body.classList.add(fadeIn)
```

The above example produces the following CSS:

```css
@keyframes fadeIn-1 {
  from { opacity: 0; }
  to { opacity: 1; }  
}

.fadeIn-1 {
  animation: 500ms ease forwards fadeIn-1;
}
```

Note that the input parameter to `keyframed` specified the value `fadeIn`
as the name for the keyframes, but the function added a unique numeric
suffix (`fadeIn-1`).

_This only works when the keyframe names comes last in the animation value!_
In the above example, we named the keyframes "fadeIn", and that appeared
as the last token in the animation value we supplied.

## `nextSuffix`

The `nextSuffix` function simply increments and returns the internal
number used to automatically append suffixes to the CSS class names
used by `styled` and `keyframed`. You can use `nextSuffix` to ensure
that any custom rules you add yourself use unique names.

## `addRule`

The `addRule` function simply adds a global rule to the dynamic style
sheet. You can use it to provide CSS for things not covered by
`styled` or `keyframes`, such as global CSS properties.

Here's an example that does just that:

```TypeScript
import { addStyle } from "@pjack/styled-elements"

addStyle(":root", `
  --bgNormal: white;
  --bgInverse: black;
`)
```

The above example produces the following CSS:

```css
:root {
  --bgNormal: white;
  --bgInverse: black;
}
```

Note that the selector passed to `addStyle` is *not* suffixed with a
unique number (because that won't work for things like `:root`.) You
can use the `nextSuffix` to make a unique selector if you need one.

## `setLog`

The `setLog` function enables or disabled verbose logging. It's off
by default. Turning it on can help troubleshoot malformed CSS.

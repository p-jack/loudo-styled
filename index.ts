import { El, el } from "loudo-bind"

const style = document.createElement("style")
style.id = "loudo-styled"
document.head.appendChild(style)

let log = false
export function setLog(on:boolean) {
  log = on
}

function insert(rule:string) {
  const sheet = style.sheet
  /* v8 ignore next */
  if (sheet === null) throw new StyleError("unavailable")
  const r = sheet.insertRule(rule, sheet.cssRules.length)
  if (log) {
    const inserted = sheet.cssRules[r]
    console.log("loudo-styled: " + inserted?.cssText)
  }
}

export class StyleError extends Error {}

type A = Record<string,string|undefined>
type H = HTMLElementTagNameMap
export interface Styled<K extends keyof HTMLElementTagNameMap> {
  (innerText?:string, attributes?:A):El<K>
  className:string // does NOT include leading dot
  with(selector:string, css:string):void
}

let clazz = 0

export function clear() {
  clazz = 0
  const sheet = style?.sheet
  /* v8 ignore next */
  if (sheet === null) return
  while (sheet.cssRules.length > 0) {
    sheet.deleteRule(0)
  }
}

export const autoName = (tag:string):string => {
  clazz++
  return tag + "-" + clazz
}

export function nextSuffix() {
  clazz++
  return clazz
}

export function styled<K extends keyof H>(tag:K, css:string):Styled<K>
export function styled<K extends keyof H>(tag:K, name:string, css:string):Styled<K>
export function styled<K extends keyof H>(tag:K, cssOrName:string, css?:string):Styled<K> {
  const className = css !== undefined ? autoName(cssOrName) : autoName(tag)
  if (css === undefined) css = cssOrName
  const rule = "." + className + " { " + css + "}"
  insert(rule)
  const result = (innerText:string = "", attributes:A = {}) => {
    return el(tag).preserve(className).inner(innerText).attrs(attributes)
  }
  result.className = className
  result.with = (selector:string, css:string) => {
    const rule = "." + className + selector + " { " + css + "}"
    insert(rule)    
  }
  return result
}


export const addRule = (selector:string, css:string):void => {
  const rule = selector + " { " + css + "}"
  insert(rule)
}

export const keyframed = (animation:string, keyframes:string):string => {
  const tokens = animation.trim().split(" ")
  const name = tokens.at(-1)!
  if (name.length === 0) throw new StyleError("invalid animation: " + animation)
  const fullName = autoName(name)
  tokens[tokens.length - 1] = fullName
  const fullAnim = tokens.join(" ")
  const kfRule = `@keyframes ${fullName} {${keyframes}}`
  insert(kfRule)
  const clazz = `.${fullName} { animation: ${fullAnim}; }`
  insert(clazz)
  return `${fullName}`
}

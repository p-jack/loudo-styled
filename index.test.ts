import { afterEach, test, expect, describe, beforeEach } from "vitest"
import { styled, addRule, nextSuffix, clear, setLog, keyframed } from "./index"

function style() {
  return document.getElementById("loudo-styled") as HTMLStyleElement
}

function firstRule() {
  return style()?.sheet?.cssRules[0]?.cssText?.replaceAll("\n", "")
}

function lastRule() {
  const rules = style()?.sheet?.cssRules
  if (rules === undefined) return undefined
  return rules[rules.length - 1]?.cssText?.replaceAll("\n", "")
}

afterEach(()=>{
  clear()
})

test("automatically adds a <style> to document head", () => {
  nextSuffix()
  expect(style()).not.toBeNull()
})

describe("styled", () => {
  test("tag-based name", () => {
    const div = styled("div", `border: none;`)
    expect(div.className).toBe("div-1")
    expect(div().className).toBe("div-1")
    expect(firstRule()).toBe(".div-1 {border: none;}")
    const div2 = styled("div", ``)
    expect(div2.className).toBe("div-2")
  })
  test("specific name", () => {
    const div = styled("div", "foo", `border: none;`)
    expect(div.className).toBe("foo-1")
    expect(div().className).toBe("foo-1")
    expect(firstRule()).toBe(".foo-1 {border: none;}")
  })
})

test("addRule", () => {
  addRule("body", `background: black`)
  expect(firstRule()).toBe("body {background: black;}")
})

test("innerText", () => {
  const p = styled("p", ``)
  const elem = p("baz")
  expect(elem.innerText).toBe("baz")
})

test("attributes", () => {
  const input = styled("input", `font-color:red`)
  const elem = input("", {type:"email", "data-test":"test"})
  expect(elem.attr("type")).toBe("email")
  expect(elem.attr("data-test")).toBe("test")
})

describe("log", () => {
  const orig = console.log
  let captured = ""
  beforeEach(() => {
    setLog(true)
    console.log = (s:string) => { captured = s }
  })
  afterEach(() => {
    console.log = orig
    setLog(false)
  })
  test("log", () => {
    const div = styled("div", `border:none`)
    expect(captured).toBe("loudo-styled: .div-1 {border: none;}")
  })
})

test("with", () => {
  const div = styled("div", `color:black`)
  div.with(".dark", `color:white`)
  expect(firstRule()).toBe(".div-1 {color: black;}")
  expect(lastRule()).toBe(".div-1.dark {color: white;}")
})

test("keyframed", () => {
  const anim = keyframed("1s ease-out fadeOut", `from{opacity:0}to{opacity:1}`)
  expect(firstRule()).toBe("@keyframes fadeOut-1 {   from {opacity: 0;}   to {opacity: 1;} }")
  expect(lastRule()).toBe(".fadeOut-1 {animation: 1s ease-out fadeOut-1;}")
  expect(() => { keyframed("", ``) }).toThrow("invalid animation")
})
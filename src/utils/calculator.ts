// Calculator logic: a safe expression evaluator (no eval) plus automotive helpers.

interface Token {
  type: 'num' | 'op' | 'paren'
  value: string
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
}

function precedenceOf(op: string): number {
  if (op === 'u-' || op === 'u+') return 3
  return PRECEDENCE[op] ?? 0
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < input.length) {
    const c = input[i]
    if (c === ' ') {
      i++
      continue
    }
    if ((c >= '0' && c <= '9') || c === '.') {
      let num = ''
      while (i < input.length && ((input[i] >= '0' && input[i] <= '9') || input[i] === '.')) {
        num += input[i]
        i++
      }
      tokens.push({ type: 'num', value: num })
      continue
    }
    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '%') {
      tokens.push({ type: 'op', value: c })
      i++
      continue
    }
    if (c === '(' || c === ')') {
      tokens.push({ type: 'paren', value: c })
      i++
      continue
    }
    throw new Error(`Unexpected character: ${c}`)
  }
  return tokens
}

function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = []
  const stack: Token[] = []

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'num') {
      output.push(t)
    } else if (t.type === 'op') {
      const prev = tokens[i - 1]
      const isUnary =
        (t.value === '-' || t.value === '+') &&
        (prev === undefined || prev.type === 'op' || (prev.type === 'paren' && prev.value === '('))
      const effOp = isUnary ? (t.value === '-' ? 'u-' : 'u+') : t.value
      const prec = precedenceOf(effOp)
      while (stack.length) {
        const top = stack[stack.length - 1]
        if (top.type === 'op' && precedenceOf(top.value) >= prec) {
          output.push(stack.pop() as Token)
        } else {
          break
        }
      }
      stack.push({ type: 'op', value: effOp })
    } else if (t.value === '(') {
      stack.push(t)
    } else if (t.value === ')') {
      while (stack.length && stack[stack.length - 1].value !== '(') {
        output.push(stack.pop() as Token)
      }
      if (!stack.length) throw new Error('Mismatched parentheses')
      stack.pop()
    }
  }

  while (stack.length) {
    const top = stack.pop() as Token
    if (top.value === '(') throw new Error('Mismatched parentheses')
    output.push(top)
  }
  return output
}

function evalRPN(rpn: Token[]): number {
  const stack: number[] = []
  for (const t of rpn) {
    if (t.type === 'num') {
      stack.push(parseFloat(t.value))
    } else if (t.type === 'op') {
      if (t.value === 'u-' || t.value === 'u+') {
        const a = stack.pop()
        if (a === undefined) throw new Error('Invalid expression')
        stack.push(t.value === 'u-' ? -a : a)
        continue
      }
      const b = stack.pop()
      const a = stack.pop()
      if (a === undefined || b === undefined) throw new Error('Invalid expression')
      switch (t.value) {
        case '+':
          stack.push(a + b)
          break
        case '-':
          stack.push(a - b)
          break
        case '*':
          stack.push(a * b)
          break
        case '/':
          if (b === 0) throw new Error('Division by zero')
          stack.push(a / b)
          break
        case '%':
          stack.push(a % b)
          break
        default:
          throw new Error('Invalid expression')
      }
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression')
  return stack[0]
}

/** Evaluate a normalized expression string (uses * / and ASCII - + %). */
export function evaluateExpression(input: string): number {
  const normalized = input.replace(/×/g, '*').replace(/÷/g, '/').trim()
  if (!normalized) throw new Error('Empty expression')
  const rpn = toRPN(tokenize(normalized))
  return evalRPN(rpn)
}

/** Toggle the sign of the last numeric operand in a display string. */
export function toggleSign(expr: string): string {
  const match = expr.match(/(\d*\.?\d+)(?!.*\d)/)
  if (!match) {
    return expr.startsWith('-') ? expr.slice(1) : '-' + expr
  }
  const num = match[0]
  const start = match.index as number
  const before = expr.slice(0, start)
  if (before.endsWith('-')) {
    return expr.slice(0, start - 1) + num + expr.slice(start + num.length)
  }
  return before + '-' + num + expr.slice(start + num.length)
}

// ---- Automotive calculations ----

export interface ChargeCostInput {
  currentSoc: number
  targetSoc: number
  capacity: number
  price: number
}

export interface ChargeCostResult {
  energy: number
  cost: number
}

/** Energy (kWh) and cost to charge from current SOC to target SOC. */
export function calcChargeCost({ currentSoc, targetSoc, capacity, price }: ChargeCostInput): ChargeCostResult {
  const delta = Math.max(0, targetSoc - currentSoc)
  const energy = (delta / 100) * capacity
  const cost = energy * price
  return { energy, cost }
}

/** Estimated time (hours) to charge the required energy at a given power (kW). */
export function calcChargeTime(energyKwh: number, powerKw: number): number {
  if (powerKw <= 0) return 0
  return energyKwh / powerKw
}

/** Wh/km consumption for a trip. */
export function calcConsumption(distanceKm: number, energyKwh: number): number {
  if (distanceKm <= 0) return 0
  return (energyKwh * 1000) / distanceKm
}

/** Estimated range (km) from available battery energy and average consumption. */
export function calcRange(capacityKwh: number, currentSoc: number, avgWhPerKm: number): number {
  if (avgWhPerKm <= 0) return 0
  const availableWh = (capacityKwh * currentSoc) / 100 * 1000
  return availableWh / avgWhPerKm
}

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { LocationQuery } from 'vue-router'

const props = defineProps<{
  launchQuery?: LocationQuery
}>()

const display = ref('0')
const first = ref<number | null>(null)
const operator = ref<string | null>(null)
const waitingForSecond = ref(false)

function inputDigit(digit: string) {
  if (waitingForSecond.value) {
    display.value = digit
    waitingForSecond.value = false
    return
  }

  display.value = display.value === '0' ? digit : `${display.value}${digit}`
}

function inputDot() {
  if (waitingForSecond.value) {
    display.value = '0.'
    waitingForSecond.value = false
    return
  }

  if (!display.value.includes('.')) {
    display.value = `${display.value}.`
  }
}

function clearAll() {
  display.value = '0'
  first.value = null
  operator.value = null
  waitingForSecond.value = false
}

function setOperator(nextOp: string) {
  const inputValue = Number.parseFloat(display.value)

  if (first.value === null) {
    first.value = inputValue
  } else if (operator.value && !waitingForSecond.value) {
    first.value = compute(first.value, inputValue, operator.value)
    display.value = String(first.value)
  }

  operator.value = nextOp
  waitingForSecond.value = true
}

function compute(a: number, b: number, op: string) {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '*') return a * b
  if (op === '/') return b === 0 ? 0 : a / b
  return b
}

function equals() {
  if (first.value === null || !operator.value) {
    return
  }

  const second = Number.parseFloat(display.value)
  const result = compute(first.value, second, operator.value)
  display.value = String(Number.isFinite(result) ? result : 0)
  first.value = result
  operator.value = null
  waitingForSecond.value = true
}

onMounted(() => {
  const value = props.launchQuery?.value
  const rawValue = Array.isArray(value) ? value[0] : value
  if (typeof rawValue !== 'string') {
    return
  }

  const parsed = Number.parseFloat(rawValue)
  if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
    display.value = String(parsed)
    first.value = null
    operator.value = null
    waitingForSecond.value = false
  }
})
</script>

<template>
  <div class="calculator-app">
    <div class="calculator-screen">{{ display }}</div>

    <div class="calculator-grid">
      <button class="calculator-key function" @click="clearAll">AC</button>
      <button class="calculator-key function" @click="setOperator('/')">/</button>
      <button class="calculator-key function" @click="setOperator('*')">*</button>
      <button class="calculator-key function" @click="setOperator('-')">-</button>

      <button class="calculator-key" @click="inputDigit('7')">7</button>
      <button class="calculator-key" @click="inputDigit('8')">8</button>
      <button class="calculator-key" @click="inputDigit('9')">9</button>
      <button class="calculator-key function" @click="setOperator('+')">+</button>

      <button class="calculator-key" @click="inputDigit('4')">4</button>
      <button class="calculator-key" @click="inputDigit('5')">5</button>
      <button class="calculator-key" @click="inputDigit('6')">6</button>
      <button class="calculator-key equals" @click="equals">=</button>

      <button class="calculator-key" @click="inputDigit('1')">1</button>
      <button class="calculator-key" @click="inputDigit('2')">2</button>
      <button class="calculator-key" @click="inputDigit('3')">3</button>
      <button class="calculator-key" @click="inputDigit('0')">0</button>

      <button class="calculator-key dot" @click="inputDot">.</button>
    </div>
  </div>
</template>

<style scoped>
.calculator-app {
  display: grid;
  gap: 10px;
}

.calculator-screen {
  border-radius: 12px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px;
  text-align: right;
  font-weight: 600;
  font-size: 1.2rem;
}

.calculator-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.calculator-key {
  border: 0;
  border-radius: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.78);
  color: #0f172a;
  font-weight: 600;
}

.calculator-key.function {
  background: rgba(189, 212, 245, 0.82);
}

.calculator-key.equals {
  grid-row: span 2;
  background: #2a62d4;
  color: #fff;
}

.calculator-key.dot {
  grid-column: span 3;
}
</style>

<template>
  <div class="calculator">
    <div class="calculator-display">
      <div class="expression">{{ expression }}</div>
      <div class="result">{{ display }}</div>
    </div>
    <div class="calculator-buttons">
      <button class="btn btn-clear" @click="clear">C</button>
      <button class="btn btn-operator" @click="backspace">⌫</button>
      <button class="btn btn-operator" @click="inputOperator('%')">%</button>
      <button class="btn btn-operator" @click="inputOperator('/')">÷</button>
      
      <button class="btn btn-number" @click="inputNumber('7')">7</button>
      <button class="btn btn-number" @click="inputNumber('8')">8</button>
      <button class="btn btn-number" @click="inputNumber('9')">9</button>
      <button class="btn btn-operator" @click="inputOperator('*')">×</button>
      
      <button class="btn btn-number" @click="inputNumber('4')">4</button>
      <button class="btn btn-number" @click="inputNumber('5')">5</button>
      <button class="btn btn-number" @click="inputNumber('6')">6</button>
      <button class="btn btn-operator" @click="inputOperator('-')">−</button>
      
      <button class="btn btn-number" @click="inputNumber('1')">1</button>
      <button class="btn btn-number" @click="inputNumber('2')">2</button>
      <button class="btn btn-number" @click="inputNumber('3')">3</button>
      <button class="btn btn-operator" @click="inputOperator('+')">+</button>
      
      <button class="btn btn-zero" @click="inputNumber('0')">0</button>
      <button class="btn btn-number" @click="inputDecimal">.</button>
      <button class="btn btn-equals" @click="calculate">=</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalculatorApp',
  data() {
    return {
      display: '0',
      expression: '',
      currentNumber: '0',
      previousNumber: '',
      operator: null,
      shouldResetDisplay: false
    }
  },
  methods: {
    inputNumber(num) {
      if (this.shouldResetDisplay) {
        this.currentNumber = num
        this.shouldResetDisplay = false
      } else {
        if (this.currentNumber === '0' && num !== '0') {
          this.currentNumber = num
        } else if (this.currentNumber !== '0') {
          this.currentNumber += num
        }
      }
      this.updateDisplay()
    },
    inputDecimal() {
      if (this.shouldResetDisplay) {
        this.currentNumber = '0.'
        this.shouldResetDisplay = false
      } else if (!this.currentNumber.includes('.')) {
        this.currentNumber += '.'
      }
      this.updateDisplay()
    },
    inputOperator(op) {
      if (this.operator && !this.shouldResetDisplay) {
        this.calculate()
      }
      
      this.previousNumber = this.currentNumber
      this.operator = op
      this.shouldResetDisplay = true
      
      const operatorSymbols = {
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷',
        '%': '%'
      }
      
      this.expression = `${this.previousNumber} ${operatorSymbols[op]}`
    },
    calculate() {
      if (!this.operator || !this.previousNumber) return
      
      const prev = parseFloat(this.previousNumber)
      const current = parseFloat(this.currentNumber)
      let result
      
      switch (this.operator) {
        case '+':
          result = prev + current
          break
        case '-':
          result = prev - current
          break
        case '*':
          result = prev * current
          break
        case '/':
          result = current !== 0 ? prev / current : 'Error'
          break
        case '%':
          result = prev % current
          break
      }
      
      if (result === 'Error') {
        this.display = 'Error'
        this.expression = ''
        this.currentNumber = '0'
        this.previousNumber = ''
        this.operator = null
        this.shouldResetDisplay = true
      } else {
        const operatorSymbols = {
          '+': '+',
          '-': '-',
          '*': '×',
          '/': '÷',
          '%': '%'
        }
        
        this.expression = `${this.previousNumber} ${operatorSymbols[this.operator]} ${this.currentNumber} =`
        this.currentNumber = this.formatNumber(result)
        this.previousNumber = ''
        this.operator = null
        this.shouldResetDisplay = true
        this.updateDisplay()
      }
    },
    clear() {
      this.display = '0'
      this.expression = ''
      this.currentNumber = '0'
      this.previousNumber = ''
      this.operator = null
      this.shouldResetDisplay = false
    },
    backspace() {
      if (this.currentNumber.length > 1) {
        this.currentNumber = this.currentNumber.slice(0, -1)
      } else {
        this.currentNumber = '0'
      }
      this.updateDisplay()
    },
    updateDisplay() {
      this.display = this.currentNumber
    },
    formatNumber(num) {
      if (Number.isInteger(num)) {
        return num.toString()
      }
      return parseFloat(num.toFixed(10)).toString()
    }
  }
}
</script>

<style scoped>
.calculator {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border-radius: 12px;
  overflow: hidden;
}

.calculator-display {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  text-align: right;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.expression {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  min-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result {
  font-size: 36px;
  font-weight: 300;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calculator-buttons {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px;
}

.btn {
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.btn:active {
  transform: scale(0.95);
}

.btn-number {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 400;
}

.btn-number:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-operator {
  background: rgba(102, 126, 234, 0.3);
  color: #667eea;
  font-weight: 500;
}

.btn-operator:hover {
  background: rgba(102, 126, 234, 0.5);
}

.btn-clear {
  background: rgba(255, 95, 87, 0.3);
  color: #ff5f57;
  font-weight: 500;
}

.btn-clear:hover {
  background: rgba(255, 95, 87, 0.5);
}

.btn-equals {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  grid-column: span 2;
}

.btn-equals:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
}

.btn-zero {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 400;
  grid-column: span 2;
}

.btn-zero:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>

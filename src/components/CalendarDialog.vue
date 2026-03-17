<template>
  <div class="calendar-dialog" ref="calendarDialog">
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="current-month">{{ currentYear }}年 {{ currentMonth + 1 }}月</div>
      <button class="nav-btn" @click="nextMonth">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <div class="calendar-body">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>

      <div class="days-grid">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index"
          class="day-cell"
          :class="{ 
            'other-month': day.otherMonth,
            'today': day.isToday,
            'selected': day.isSelected
          }"
          @click="selectDate(day)"
        >
          {{ day.date }}
        </div>
      </div>
    </div>

    <div class="calendar-footer">
      <button class="today-btn" @click="goToToday">回到今天</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarDialog',
  data() {
    return {
      currentDate: new Date(),
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      weekdays: ['日', '一', '二', '三', '四', '五', '六']
    }
  },
  mounted() {
    setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside)
    }, 100)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  computed: {
    calendarDays() {
      const year = this.currentYear
      const month = this.currentMonth
      
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const daysInPrevMonth = new Date(year, month, 0).getDate()
      
      const today = new Date()
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
      
      const days = []
      
      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
          date: daysInPrevMonth - i,
          otherMonth: true,
          isToday: false,
          isSelected: false
        })
      }
      
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          date: i,
          otherMonth: false,
          isToday: isCurrentMonth && i === today.getDate(),
          isSelected: isCurrentMonth && i === today.getDate()
        })
      }
      
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          otherMonth: true,
          isToday: false,
          isSelected: false
        })
      }
      
      return days
    }
  },
  methods: {
    handleClickOutside(event) {
      const calendarDialog = this.$refs.calendarDialog
      if (calendarDialog && !calendarDialog.contains(event.target)) {
        this.$emit('close')
      }
    },
    prevMonth() {
      this.currentMonth--
      if (this.currentMonth < 0) {
        this.currentMonth = 11
        this.currentYear--
      }
    },
    nextMonth() {
      this.currentMonth++
      if (this.currentMonth > 11) {
        this.currentMonth = 0
        this.currentYear++
      }
    },
    selectDate(day) {
      if (!day.otherMonth) {
        const today = new Date()
        today.setFullYear(this.currentYear)
        today.setMonth(this.currentMonth)
        today.setDate(day.date)
        this.currentDate = today
      }
    },
    goToToday() {
      const today = new Date()
      this.currentYear = today.getFullYear()
      this.currentMonth = today.getMonth()
      this.currentDate = today
    }
  }
}
</script>

<style scoped>
.calendar-dialog {
  position: fixed;
  bottom: 60px;
  right: 16px;
  width: 380px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 10000;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.nav-btn svg {
  width: 18px;
  height: 18px;
  color: white;
}

.current-month {
  font-size: 16px;
  font-weight: 600;
}

.calendar-body {
  padding: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #999;
  padding: 8px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.day-cell:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.1);
}

.day-cell.other-month {
  color: #ccc;
}

.day-cell.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.day-cell.selected {
  border: 2px solid #667eea;
}

.day-cell.today:hover {
  opacity: 0.9;
}

.calendar-footer {
  padding: 12px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
}

.today-btn {
  padding: 8px 24px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.today-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style>

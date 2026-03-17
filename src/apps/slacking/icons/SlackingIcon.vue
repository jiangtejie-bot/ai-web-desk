<template>
  <div class="slacking-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="16" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'SlackingIcon'
}
</script>

<style scoped>
.slacking-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slacking-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}
</style>

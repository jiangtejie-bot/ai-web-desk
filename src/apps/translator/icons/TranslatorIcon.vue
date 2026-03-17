<template>
  <div class="translator-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M5 8l6 6"/>
      <path d="M4 14h6"/>
      <path d="M2 5h12"/>
      <path d="M7 2h1"/>
      <path d="M22 22l-5-10-5 10"/>
      <path d="M14 18h6"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'TranslatorIcon'
}
</script>

<style scoped>
.translator-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.translator-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}
</style>

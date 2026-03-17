<template>
  <div class="bookmark-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10"/>
      <path d="M12 2v20"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'BookmarkIcon'
}
</script>

<style scoped>
.bookmark-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-icon svg {
  width: 100%;
  height: 100%;
}
</style>

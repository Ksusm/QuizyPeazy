<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header>
      <h1>🎮 Quizy-Peazy</h1>
      <p>Multiplayer Trivia Game</p>
    </header>
    
    <main>
      <RouterView />
    </main>
    
    <footer>
      <p>&copy; 2025 Quizy-Peazy - WAB Project</p>
    </footer>
  </div>
</template>

<style scoped>
header {
  text-align: center;
  padding: 2rem 0;
  border-bottom: 2px solid #42b983;
  margin-bottom: 2rem;
}

header h1 {
  font-size: 2.5rem;
  margin: 0;
  color: #42b983;
}

header p {
  margin: 0.5rem 0 0;
  color: #666;
}

main {
  min-height: 60vh;
  padding: 1rem;
}

footer {
  text-align: center;
  padding: 1rem;
  margin-top: 3rem;
  border-top: 1px solid #ddd;
  color: #999;
  font-size: 0.9rem;
}
</style>

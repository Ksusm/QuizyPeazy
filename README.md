# Quizy-Peazy

Real-time multiplayer trivia game. Players join a room with a code, 
answer questions on a timer, and watch the leaderboard update live.

## What it does
- Room-based multiplayer with unique join codes
- Live score updates via WebSockets
- Player profiles with total score history
- 4 independent backend services

## Architecture
| Service | Does |
|---|---|
| Auth | Registration, login, profiles |
| Question | Trivia question storage |
| Game Session | Rooms, rounds, scoring |
| Realtime | WebSocket live updates |

## Tech stack
Spring Boot, WebSockets, microservices architecture
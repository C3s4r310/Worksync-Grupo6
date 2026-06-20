# Graph Report - /home/natsu/Documents/APF2 DWIntegrado  (2026-06-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 723 nodes · 1286 edges · 52 communities (35 shown, 17 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 51|Community 51]]

## God Nodes (most connected - your core abstractions)
1. `tareaDTO` - 26 edges
2. `miembroDTO` - 18 edges
3. `proyectoDTO` - 18 edges
4. `tareaSERVICIO` - 16 edges
5. `compilerOptions` - 16 edges
6. `loadAuth()` - 15 edges
7. `comentarioDTO` - 14 edges
8. `getAuthHeader()` - 14 edges
9. `MiembroProyecto` - 13 edges
10. `Comentario` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Project (frontend-nextjs)` --semantically_similar_to--> `Next.js`  [INFERRED] [semantically similar]
  frontend-nextjs/README.md → prompt_sprint2_kanban.txt
- `next.svg (public asset)` --shares_data_with--> `Next.js Project (frontend-nextjs)`  [INFERRED]
  frontend-nextjs/public/next.svg → frontend-nextjs/README.md
- `vercel.svg (public asset)` --shares_data_with--> `Vercel Deployment Platform`  [INFERRED]
  frontend-nextjs/public/vercel.svg → frontend-nextjs/README.md
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  frontend-nextjs/app/login/page.tsx → frontend-nextjs/hooks/useAuth.ts
- `TareasPage()` --calls--> `useAuth()`  [INFERRED]
  frontend-nextjs/app/proyectos/[proyectoId]/tareas/page.tsx → frontend-nextjs/hooks/useAuth.ts

## Import Cycles
- None detected.

## Communities (52 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (33): Long, Map, PostMapping, ResponseEntity, String, List, Long, Optional (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (25): DeleteMapping, GetMapping, Long, Map, PostMapping, ResponseEntity, String, List (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (16): List, Proyecto, LocalDate, Long, String, List, LocalDate, Long (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (33): LABEL_ESTADO, PRIORIDAD_ICONO, LABEL_ESTADO, PRIORIDAD_ICONO, actualizarTarea(), agregarComentario(), agregarEvidenciaUrl(), buscarTareas() (+25 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (18): comentarioDTO, GetMapping, Long, PostMapping, ResponseEntity, List, Long, LocalDateTime (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (39): next.svg (public asset), pnpm Workspace Configuration, sharp (native build dep), unrs-resolver (native build dep), Clean Architecture, Controllers Layer, Drag & Drop Interaction, DTOs (Data Transfer Objects) (+31 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (15): Optional, String, Usuario, LoginRequestDTO, RegisterRequestDTO, String, List, Long (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (22): dependencies, axios, next, react, react-dom, devDependencies, eslint, eslint-config-next (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (11): DeleteMapping, GetMapping, LocalDate, Long, Map, PostMapping, PutMapping, ResponseEntity (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (11): Override, Long, String, Claims, FilterChain, HttpServletRequest, HttpServletResponse, JwtAuthenticationFilter (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (17): BADGE, ESTADOS, FORM_VACIO, FormData, LABEL, PRIORIDAD_BADGE, PRIORIDAD_LABEL, buscarProyectos() (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (14): Home(), AppLayout(), AppLayoutProps, NAV_ITEMS, ProtectedRoute(), ProtectedRouteProps, CrearProyectoPage(), CuentaPage() (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (5): LocalDateTime, Long, PrePersist, Rol, MiembroProyecto

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (11): DeleteMapping, GetMapping, List, LocalDate, Long, PostMapping, proyectoDTO, PutMapping (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (4): LocalDateTime, Long, String, Comentario

### Community 16 - "Community 16"
Cohesion: 0.19
Nodes (4): Long, Rol, String, Usuario

### Community 17 - "Community 17"
Cohesion: 0.30
Nodes (11): MiembroSeleccionado, agregarMiembro(), getAuthHeader(), getBaseUrl(), listarMiembros(), MiembroDTO, retirarMiembro(), cambiarRolUsuario() (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.20
Nodes (10): Login(), Register(), apiClient, decodeJwt(), getErrorMessage(), login(), recuperarContrasena(), register() (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.27
Nodes (9): GetMapping, List, Long, Map, PutMapping, ResponseEntity, String, userDTO (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (3): Long, String, userDTO

### Community 22 - "Community 22"
Cohesion: 0.31
Nodes (7): LoginRequestDTO, Map, PostMapping, RegisterRequestDTO, ResponseEntity, String, AuthController

### Community 23 - "Community 23"
Cohesion: 0.42
Nodes (6): AuthContext, AuthContextType, AuthResponse, User, clearAuth(), saveAuth()

### Community 24 - "Community 24"
Cohesion: 0.31
Nodes (6): avanceDTO, GetMapping, Long, PostMapping, ResponseEntity, avanceController

### Community 25 - "Community 25"
Cohesion: 0.39
Nodes (5): Override, WebConfig, CorsRegistry, ResourceHandlerRegistry, WebMvcConfigurer

### Community 27 - "Community 27"
Cohesion: 0.36
Nodes (6): LocalDate, Long, Specification, String, Tarea, TareaSpecification

### Community 28 - "Community 28"
Cohesion: 0.43
Nodes (4): Override, Rol, String, RolConverter

### Community 29 - "Community 29"
Cohesion: 0.43
Nodes (5): LocalDate, Proyecto, Specification, String, ProyectoSpecification

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, AuthProvider()

### Community 31 - "Community 31"
Cohesion: 0.47
Nodes (4): HistorialCambioTarea, List, Long, HistorialCambioTareaRepository

### Community 32 - "Community 32"
Cohesion: 0.53
Nodes (4): Bean, SecurityConfig, HttpSecurity, SecurityFilterChain

## Knowledge Gaps
- **124 isolated node(s):** `ApplicationConfig`, `Long`, `Long`, `String`, `String` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `ApplicationConfig`, `Long`, `Long` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06435498089920658 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06203007518796992 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09513742071881606 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1109936575052854 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.0782051282051282 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.058029689608636977 - nodes in this community are weakly interconnected._
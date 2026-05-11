# Cashi — App Mobile de Finanzas Personales

App de finanzas personales construida con **React Native + Expo +
TypeScript + Expo Router + AsyncStorage + Zod**. Permite registrar
transacciones (ingresos y egresos), organizarlas por categorías y
ver el balance en una pantalla dedicada. Toda la persistencia es
local en el dispositivo — los datos sobreviven al cierre de la app.

Proyecto entregado para la **Evaluación 2 — Desarrollo de
Aplicaciones Móviles** (Cashi: App Mobile de Finanzas Personales).

---

## Stack

| Paquete | Versión | Para qué |
|---|---|---|
| `expo` | ~54.0 | Runtime y herramientas |
| `expo-router` | ~6.0 | Navegación file-based (Stack + Tabs) |
| `react-native` | 0.81 | Core mobile |
| `typescript` | ~5.9 | Tipado estático |
| `@react-native-async-storage/async-storage` | 2.2 | Persistencia clave-valor |
| `zod` | 4.4 | Validación de formularios |

---

## Requisitos

- **Node.js 18+**
- **yarn 1.22.4** (vía Corepack):

```bash
corepack enable
corepack prepare yarn@1.22.4 --activate
```

---

## Instalación y ejecución

```bash
# Clonar
git clone https://github.com/JeanGuitard04/cashi-app.git
cd cashi-app

# Instalar dependencias
yarn install

# Iniciar el dev server de Expo
yarn start
```

El comando `yarn start` abre el menú de Expo. Desde ahí:

- **Expo Go**: escaneá el QR con tu celular (después de instalar
  Expo Go desde la App Store o Play Store).
- **Emulador Android**: presioná `a`.
- **Simulador iOS** (solo macOS): presioná `i`.
- **Web** (limitado): presioná `w`.

### Comandos directos

```bash
yarn android    # Abre directamente en emulador Android
yarn ios        # Abre directamente en simulador iOS
yarn web        # Abre directamente en el navegador
yarn lint       # Verifica estilo de código con ESLint
```

---

## Credenciales de login

El login está hardcodeado en memoria (sin backend en esta unidad):

- **Email**: `juanito@example.com`
- **Password**: `1234`

Cualquier otra combinación muestra "Credenciales incorrectas" en
pantalla.

---

## Estructura del proyecto

```
cashi-app/
  app/                       ← Pantallas (file-based routing)
    _layout.tsx              ← Stack raíz: login + tabs
    index.tsx                ← Login
    (tabs)/                  ← Grupo de tabs
      _layout.tsx            ← Tab bar (Transacciones, Balance, Categorías)
      index.tsx              ← Pantalla Transacciones (lista)
      balance.tsx            ← Pantalla Balance
      categories.tsx         ← Pantalla Categorías (lista)
      transaction/
        _layout.tsx          ← Stack interno
        [id].tsx             ← Form crear/editar transacción
      category/
        _layout.tsx
        [id].tsx             ← Form crear/editar categoría
  hooks/                     ← Toda la lógica vive acá
    useLogin.ts
    useTransactions.ts       ← CRUD de transacciones
    useTransactionForm.ts    ← Form con 4 campos
    useCategories.ts         ← CRUD de categorías
    useCategoryForm.ts       ← Form de categoría
    useBalance.ts            ← Cálculo de totales (compone useTransactions)
  schemas/                   ← Validación Zod
    transaction.schema.ts
    category.schema.ts
  types/                     ← Interfaces de dominio
    transaction.ts
    category.ts
  components/                ← Componentes UI compartidos
  constants/
    theme.ts                 ← Paleta de colores
  docs/                      ← Documentación paso a paso del desarrollo
```

---

## Arquitectura — los componentes solo renderizan

La regla de oro de este proyecto: **toda la lógica vive en custom
hooks**. Los componentes solo importan el hook y renderizan lo que
les devuelve. Cero `AsyncStorage` directo en pantallas, cero
`filter`/`reduce` en componentes, cero validación a mano.

| Capa | Responsabilidad | Archivo |
|---|---|---|
| Tipos | Forma de los datos | `types/*.ts` |
| Validación | Reglas de negocio del form | `schemas/*.schema.ts` |
| CRUD | Read-modify-write contra AsyncStorage | `hooks/use*s.ts` |
| Formulario | Estado, errores, submit | `hooks/use*Form.ts` |
| Cálculo derivado | Totales, agregaciones | `hooks/useBalance.ts` |
| Vistas | Renderizar y capturar eventos | `app/**/*.tsx` |

Para entender el detalle del por qué de cada decisión, ver
[`docs/`](./docs/) — hay un MD por cada sub-etapa del desarrollo.

---

## Flujos clave

```
Usuario abre la app
        ↓
Login (juanito@example.com / 1234)
        ↓
Tabs (Transacciones / Balance / Categorías)
        ↓
   ┌────────────────────────────────────────────┐
   ↓                    ↓                       ↓
Transacciones        Balance              Categorías
(lista + + + tap)   (totales en hook)   (lista + + + tap)
   ↓                                            ↓
form transacción                          form categoría
(amount + type +                          (name)
 description +
 selector categoría)
```

---

## Uso de IA en el desarrollo

Se utilizó **Claude Code** (`claude-sonnet-4-6`) como asistente de
pair programming. Su rol fue ayudar a desbloquear puntos
conceptualmente complejos durante el desarrollo, no escribir
código sin entender. Declaramos los **dos casos puntuales** donde
la IA fue clave:

### Caso 1 — Bug de navegación entre sub-trees del Tabs navigator

**Contexto**: cuando intentamos hacer `router.back()` desde el
formulario de categoría/transacción para volver a la lista, el
usuario terminaba en el tab de "Transacciones" en vez de en el
tab origen. El comportamiento era inconsistente entre sesiones.

**Cómo se usó la IA**: para diagnosticar la causa raíz —
identificó que (a) los formularios viven en sub-trees ocultos
con `href: null`, (b) cuando el Stack interno queda vacío
después de un `router.back()`, native-stack cae al `anchor`
definido en `unstable_settings`, (c) el anchor `(tabs)` resuelve
al primer tab declarado (`index` = Transacciones).

**Aprendizaje**: el `anchor` de Expo Router no es solo para deep
linking — afecta el fallback de back navigation cuando un Stack
interno queda sin más screens que pop-ear. La solución idiomática
es usar `router.replace("/destino-explícito")` cuando el destino
después de una operación es conocido, en vez de depender de la
historia del navigator. Aplicamos esto + un override de
`headerLeft` en el sub-layout para que la flecha del header
también navegue explícito.

### Caso 2 — Bug del input con valor stale al re-abrir el form

**Contexto**: al abrir el form, tipear algo, cancelar y volver a
abrir, el input mostraba el valor anterior en vez de aparecer
vacío. Pasaba en categorías y se hacía mucho peor en
transacciones (4 campos en vez de 1).

**Cómo se usó la IA**: para entender por qué el patrón del
proyecto ejemplo (`useEffect` con `defaultValues` en deps) no
funcionaba en nuestro caso. Identificó que (a) el ejemplo tiene
un Stack con 4 screens declarados y la lista vive en el mismo
tab que el form, lo que garantiza unmount limpio; (b) nuestra
estructura tiene Stacks de 1 solo screen y el form
vive en un sub-tree distinto del list, lo que hace que
native-stack a veces reuse la instancia del componente al
re-pushear; (c) `useState` solo inicializa una vez por instancia,
así que la reusada conserva el state viejo.

**Aprendizaje**: `useEffect(fn, [deps])` corre cuando cambian los
deps. Si el componente nunca se desmonta y los deps nunca cambian
(create mode con `defaultValues = undefined`), nunca corre.
`useFocusEffect` corre cada vez que la pantalla recibe foco,
independientemente de si la instancia es nueva. Es la forma
idiomática de resetear state cuando el lifecycle natural del
componente no coincide con la "sesión lógica" del usuario.

---

## Verificación

```bash
# TypeScript
npx tsc --noEmit

# Linter
yarn lint
```

Ambos deben pasar sin errores ni warnings.

---

## Recursos

- [Documentación de Expo](https://docs.expo.dev/)
- [Documentación de Expo Router](https://docs.expo.dev/router/introduction/)
- [Documentación de AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Documentación de Zod](https://zod.dev)

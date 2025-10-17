# REPOSITORIO ISW 4K3 G13

## Tabla de contenidos

- [Información general](#información-general)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Listado de ítems de configuración](#listado-de-ítems-de-configuración)
- [Definición de línea base](#definición-de-línea-base)
- [Historial de marcado de líneas base](#historial-de-marcado-de-líneas-base)
- [Listado de etiquetas en las reglas de nombrado](#listado-de-etiquetas-en-las-reglas-de-nombrado)

## Información general

**Cátedra:** Ingeniería y Calidad de Software

**Curso:** 4K3  

**Profesores del curso:**

| Apellido y nombre   | Rol                            |
|---------------------|--------------------------------|
| Covaro, Laura       | Adjunto                        |   
| Massano, Cecilia    | Auxiliar de trabajos prácticos |  
| Garnero, Constanza  | Auxiliar de trabajos prácticos |  
| Izaguirre, Ezequiel | Adscripto                      |   

**Número de grupo:** Grupo 13

**Integrantes del grupo:**

| Apellido y nombre           | Legajo |
|-----------------------------|--------|
| Brizuela, María del Milagro | 89693  |
| Cavalleri Grosso, Mateo     | 95980  |
| Druetta, María Fátima       | 85545  |
| Internicola, Macarena       | 90758  |
| Mandrilli, Bautista         | 89654  |
| Moreno Mezzadra, Sol Fátima | 94537  |
| Paste Kvapil, Ignacio José  | 95802  |
| Patiño, Juan Cruz           | 89875  |

## Estructura del repositorio

### `teorico`
Contiene material de estudio y referencia teórica. Incluye:

- **`bibliografia`**: Libros, papers y apuntes clasificados por tema.  
  - **`ingenieria_software`**: Material sobre ingeniería de software.  
  - **`testing_software`**: Material sobre pruebas de software.  
  - **`pensamiento_agil`**: Material sobre metodologías ágiles.  
  - **`scm`**: Material sobre gestión de configuración de software.  
  - **`lean_kanban`**: Material sobre Lean y Kanban.  
- **`presentaciones`**: Presentaciones de clase en formato digital.  

### `practico`
Contiene recursos de apoyo para el desarrollo práctico del curso. Incluye:

- **`templates`**: Plantillas para trabajos o parciales.  
- **`guias`**: Guías de ejercicios e instrucciones para trabajos prácticos y de investigación.  

### `entregas`
Contiene los entregables del grupo. Incluye:

- **`trabajos_investigacion`**: Carpetas para cada trabajo de investigación con sus archivos correspondientes.  
- **`trabajos_practicos`**: Carpetas para cada trabajo práctico con sus archivos correspondientes.  

A medida que vayamos avanzando en el transcurso de la materia iremos publicando los archivos relacionados con trabajos prácticos y de investigación en nuestro repositorio.

## Listado de ítems de configuración

| Ítem de configuración                                             | Regla de nombrado                                  | Ubicación física                                                                                                                          |
|-------------------------------------------------------------------|----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| Material bibliográfico sobre ingeniería de software               | `<autor>_<aaaa>_<nombre_material>.<ext>`           | [Bibliografía — Ingeniería de software](teorico/bibliografia/ingenieria_software)                                                         |
| Material bibliográfico sobre testing de software                  | `<autor>_<aaaa>_<nombre_material>.<ext>`           | [Bibliografía — Testing de software](teorico/bibliografia/testing_software)                                                               |
| Material bibliográfico sobre pensamiento ágil                     | `<autor>_<aaaa>_<nombre_material>.<ext>`           | [Bibliografía — Pensamiento ágil](teorico/bibliografia/pensamiento_agil)                                                                  |
| Material bibliográfico sobre SCM                                  | `<autor>_<aaaa>_<nombre_material>.<ext>`           | [Bibliografía — SCM](teorico/bibliografia/scm)                                                                                            |
| Material bibliográfico sobre Lean y Kanban                        | `<autor>_<aaaa>_<nombre_material>.<ext>`           | [Bibliografía — Lean y Kanban](teorico/bibliografia/lean_kanban)                                                                          |
| Presentación de clase                                             | `<aaaa>_<nn>_<nombre_material>.<ext>`              | [Presentaciones](teorico/presentaciones)                                                                                                  |
| Template para prácticos o parciales                               | `<aaaa>_<nombre_material>.<ext>`                   | [Templates](practico/templates)                                                                                                           |
| Guía de ejercicios o trabajos                                     | `<aaaa>_<nombre_material>.<ext>`                   | [Guías](practico/guias)                                                                                                                   |
| Trabajo de investigación                                          | `tp<nn>_4k3_g13_<nombre_tema>_<nombre_tipo>.<ext>` | [Trabajos de investigación](entregas/trabajos_investigacion)                                                                              |
| Trabajo práctico                                                  | `tp<nn>_4k3_g13_<nombre_tema>_<nombre_tipo>.<ext>` | [Trabajos prácticos](entregas/trabajos_practicos)                                                                                         |

## Definición de línea base

La línea base del proyecto se definirá una vez se entreguen los trabajos prácticos evaluables.
Esto significa que la línea se establecerá antes de la finalización de la fecha de entrega de cada trabajo práctico evaluable, por lo que las correcciones o ajustes posteriores identificados en cada trabajo solo podrán implementarse en la línea base de la entrega siguiente, asegurando que cada línea base permanezca estable y controlada.

**Regla de nombrado:**  `linea_base_tp<nn>`

## Historial de marcado de líneas base

| Fecha de Definición | Autor de la Definición | Descripción de la Línea Base |
|--------------------|-----------------------|-----------------------------|
| 2025-10-17         | Milagro Brizuela      | Línea base del TP4. |

**Nota:**  La línea base del TP4 constituye una excepción al criterio actual. Inicialmente, se trabajó con un procedimiento de marcado de líneas base posterior a la fecha de finalización de la entrega de cada trabajo, pero posteriormente se decidió redefinir dicho criterio. A partir de los siguientes trabajos, todas las líneas base se marcarán antes de la finalización de la fecha de entrega de cada trabajo práctico evaluable.

## Listado de etiquetas en las reglas de nombrado

| Etiqueta            | Definición                                                                                                                                                                                                                                           |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<autor>`           | Indica el apellido del autor del material, escrito en minúscula. Si hay varios autores, solo se utiliza el primero. Ejemplo: “Ingeniería de Software — Ian Somerville” se nombra como **somerville**.                                                 |
| `<aaaa>`            | Indica el año de publicación del material, en formato de cuatro dígitos. Ejemplo: **2025**.                                                                                                                                                          |
| `<nn>`              | Indica un número de dos cifras que identifica de manera única cada material, trabajo o línea base. Ejemplo: **01** para el primero, **02** para el segundo.                                                                                          | 
| `<nombre_material>` | Indica el nombre del material proporcionado por la cátedra, en minúscula. Los espacios se reemplazan por guiones bajos. Ejemplo: “Ingeniería de Software” se nombra como **ingenieria_de_software**.                                                 |
| `<nombre_tema>`     | Indica el tema específico del trabajo, en minúscula. Los espacios se reemplazan por guiones bajos. Ejemplo: “Design Thinking” se nombra como **design_thinking**.                                                                                    |
| `<nombre_tipo>`     | Indica el tipo de trabajo entregado, en minúscula. Ejemplo: **informe**, **gráfico**, **tabla**, **presentación**.                                                                                                                                   |
| `<ext>`             | Indica la extensión del archivo entregado. Ejemplo: **.docx**, **.xlsx**, **.pdf**.                                                                                                                                                                  |
| `<hito>`            | Indica el momento del proyecto al que se asocia la línea base. Ejemplo: Si se define después de la corrección del TP4, se nombra como **post_correcciones_tp4**.                                                                                     |

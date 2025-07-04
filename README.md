
# MesaLista

**MesaLista** es una solución monolítica de gestión para pequeños y medianos restaurantes que no tienen acceso a sistemas en la nube. Diseñado para funcionar en entornos locales con bajo presupuesto, permite administrar de forma flexible pedidos, entregas, empleados, clientes, incidentes y menús semanales.

---

## Descripción General

MesaLista fue creado para cubrir las necesidades operativas de restaurantes locales, ofreciendo una alternativa robusta y económica a los sistemas SaaS. Gracias a su arquitectura ligera, puede funcionar con recursos mínimos y sin depender de proveedores externos.

---

## Tecnologías Utilizadas

- **Java 21**
- **Spring Boot**
- **MySQL 8.0.39 o superior**
- **Thymeleaf**
- **JavaScript (ES6)**
- **REST API**
- **ZeroTier One** (para red local simulada)

---

## Instalación y Requisitos

No se necesita Docker ni herramientas complejas. Solo asegúrate de tener:

1. **MySQL 8.0.39+** instalado y configurado (puede ser la edición gratuita).
2. **Java 21 o superior** con la variable de entorno correctamente configurada.
3. **ZeroTier One** instalado para conectar dispositivos como si estuvieran en red local.
4. **Conexión a Internet** estable en el establecimiento.

### Ejecución
Una vez configurada la base de datos, ejecuta el archivo `.jar`
Abre terminal GIT o CMD de windows y ecribe el siguiente comando:

```bash
java -jar MesalistaZeroTier.jar
```

---

## Funcionalidades Principales

- ✔️ Mesalista ofrece:
  - CRUD de Clientes
  - CRUD de Productos
  - CRUD de Empleados (y Deliveries)
  - Pedidos (con trazabilidad y control fino)
  - Entregas con trazabilidad
  - Control de mesas en el restaurante
  - Módulo de incidentes para reportar problemas
  - Menús complamente personalizados y rotativos
  - Reportes para toma de decisiones estratégicas
  - Imprimir reportes
  - Exportar PDF
  - Exportar CSV
  - Exportar Backup de la Base de Datos + opción de limpieza posterior
  - Vista móvil para personal de entrega
  - Integración con Google Maps para rutas de delivery
  - Control de ciclo de vida de pedidos: agregar, modificar, cancelar, continuar pedidos incompletos
  - Soporte para auditoría a nivel de base de datos

---

## Roles y Permisos

| Rol      | Permisos                                                                 |
|----------|--------------------------------------------------------------------------|
| Admin    | Acceso total al sistema                                                  |
| Gerente  | Acceso total al sistema                                                  |
| Mesero   | Tomar y confirmar pedidos. Sin acceso a entregas, empleados ni reportes  |
| Delivery | Solo visualiza pedidos para entregar                                     |
| Cocina   | Confirmar pedidos. Sin acceso a reportes, empleados ni entregas          |

---

## Consideraciones

- Este software **está diseñado para uso exclusivo del personal del restaurante.**

---

## Autor

**Ariel Camilo**  
Desarrollo activo desde mayo 2025  

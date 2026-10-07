APEX FIT - FUSIÓN FINAL

Cambios aplicados:
1. Se mantiene la funcionalidad SOAP + JAAS + JWT del proyecto FINAL_SOAP_ASISTENCIA_JAVADOC_FIX.
2. JavaDoc Maven queda configurado en pom.xml. Para generarlo:
   mvn clean javadoc:javadoc
   Abrir: target/site/apidocs/index.html
3. Sesión segura de 5 minutos para ADMIN, CLIENTE y ENTRENADOR.
   Backend: app.security.expiration-seconds=300
   Frontend: contador visible en la interfaz y cierre automático.
4. Se corrigió el mapeo de asistencia_entrenador para evitar el error de columnas duplicadas.
   Si tu base ya tenía columnas viejas, ejecutar SQL_FIX_ASISTENCIA_ENTRENADOR_FINAL.sql en pgAdmin.
5. Se agregaron imágenes visuales a productos y punto de venta.
6. El modal de inscripción queda más abajo, centrado y con scroll seguro.
7. Se agregó bloque Staff de Entrenadores en Clientes y Entrenadores.

IMPORTANTE:
- No se cambió PDF, QR ni transferencias.
- No se incluye node_modules ni target para evitar errores por falta de espacio. Ejecuta npm install en gym-frontend.


CAMBIOS EXTRA UI:
- Temporizador de sesión oculto para ADMIN; se mantiene para CLIENTE y ENTRENADOR.
- Modales centrados, con alto máximo y scroll interno para que se vea todo el formulario de pagos.
- Botón "Ingresar otra inscripción" visible para CLIENTE en Inscripciones, además de "Nueva Inscripción" para ADMIN.
- Staff de entrenadores se mantiene visible en Dashboard y módulos Cliente/Entrenador.
- Se agregaron imágenes SVG para productos en public/assets/img/products.
Cambios UI final: modales pagos/inscripciones centrados y completos; product-thumb con imagen visible para todos los roles.

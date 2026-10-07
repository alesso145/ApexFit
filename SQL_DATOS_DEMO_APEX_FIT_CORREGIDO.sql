-- APEX FIT - DATOS DE PRUEBA CORREGIDOS
-- Tablas en singular, conforme a las entidades Java del proyecto.
-- IMPORTANTE: las contraseñas de auth_users se manejan mejor desde DataInitializer
-- porque Spring Security usa BCrypt. Por eso aquí se evita romper el login.

-- Los usuarios admin/cliente/entrenador se crean automáticamente desde DataInitializer.java
-- con contraseña 123456 cifrada en BCrypt. No se insertan aquí para evitar errores de login.

INSERT INTO entrenador (apellido, cedula, especialidad, nombre, telefono) VALUES
('Ramírez', '1712345678', 'Musculación', 'Pedro', '0981111111'),
('Vera', '1723456789', 'Crossfit', 'Sofía', '0982222222'),
('Mora', '1734567890', 'Cardio', 'Andrés', '0983333333'),
('Paredes', '1745678901', 'Spinning', 'Luis', '0984444444'),
('Salazar', '1756789012', 'Yoga', 'Gabriela', '0985555555');

INSERT INTO cliente (apellido, cedula, correo, estado, fecha_registro, nombre, telefono) VALUES
('Cabrera', '1750011122', 'javier@gmail.com', true, CURRENT_DATE, 'Javier', '0991112233'),
('Mena', '1750022233', 'ana@gmail.com', true, CURRENT_DATE, 'Ana', '0982223344'),
('López', '1750033344', 'diego@gmail.com', true, CURRENT_DATE, 'Diego', '0973334455'),
('Torres', '1750044455', 'maria@gmail.com', true, CURRENT_DATE, 'María', '0964445566'),
('Castro', '1750055566', 'kevin@gmail.com', true, CURRENT_DATE, 'Kevin', '0955556677');

INSERT INTO membresia (descripcion, duracion_dias, nombre, precio) VALUES
('Acceso básico al gimnasio por 30 días', 30, 'Mensual', 25.00),
('Acceso completo por 3 meses', 90, 'Trimestral', 65.00),
('Acceso completo por 6 meses', 180, 'Semestral', 120.00),
('Acceso completo por 1 año', 365, 'Anual', 220.00);

INSERT INTO clase (cupo_maximo, descripcion, horario, nombre, id_entrenador) VALUES
(20, 'Clase de fuerza y pesas', 'Lunes 08:00 - 09:00', 'Musculación', 1),
(15, 'Entrenamiento funcional intenso', 'Martes 18:00 - 19:00', 'Crossfit', 2),
(25, 'Ejercicios cardiovasculares', 'Miércoles 17:00 - 18:00', 'Cardio', 3),
(18, 'Clase en bicicleta estática', 'Jueves 19:00 - 20:00', 'Spinning', 4),
(12, 'Relajación y flexibilidad', 'Viernes 07:00 - 08:00', 'Yoga', 5);

INSERT INTO inscripcion (estado, fecha_fin, fecha_inicio, id_cliente, id_membresia) VALUES
('ACTIVA', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE, 1, 1),
('ACTIVA', CURRENT_DATE + INTERVAL '90 days', CURRENT_DATE, 2, 2),
('ACTIVA', CURRENT_DATE + INTERVAL '365 days', CURRENT_DATE, 3, 4),
('ACTIVA', CURRENT_DATE + INTERVAL '180 days', CURRENT_DATE, 4, 3),
('ACTIVA', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE, 5, 1);

INSERT INTO pago (estado, fecha_pago, metodo_pago, monto, tipo_pago, id_inscripcion) VALUES
('PAGADO', CURRENT_DATE, 'Efectivo', 25.00, 'MEMBRESIA', 1),
('PAGADO', CURRENT_DATE, 'Transferencia', 65.00, 'MEMBRESIA', 2),
('PAGADO', CURRENT_DATE, 'Tarjeta', 220.00, 'MEMBRESIA', 3),
('PAGADO', CURRENT_DATE, 'Efectivo', 120.00, 'MEMBRESIA', 4),
('PAGADO', CURRENT_DATE, 'Transferencia', 25.00, 'MEMBRESIA', 5);

INSERT INTO asistencia (fecha_asistencia, id_clase, id_cliente) VALUES
(CURRENT_DATE, 1, 1),
(CURRENT_DATE, 2, 2),
(CURRENT_DATE, 3, 3),
(CURRENT_DATE, 4, 4),
(CURRENT_DATE, 5, 5);

INSERT INTO producto (descripcion, nombre, precio, stock) VALUES
('Proteína en polvo 1kg', 'Proteína Whey', 45.00, 20),
('Botella deportiva para gimnasio', 'Shaker', 8.50, 50),
('Bebida hidratante personal', 'Gatorade', 1.50, 100),
('Toalla deportiva', 'Toalla Gym', 6.00, 40),
('Guantes para pesas', 'Guantes Gym', 12.00, 25);

INSERT INTO venta (fecha_venta, total, id_cliente) VALUES
(CURRENT_DATE, 53.50, 1),
(CURRENT_DATE, 9.00, 2),
(CURRENT_DATE, 45.00, 3),
(CURRENT_DATE, 18.00, 4),
(CURRENT_DATE, 12.00, 5);

INSERT INTO detalle_venta (cantidad, precio_unitario, subtotal, id_producto, id_venta) VALUES
(1, 45.00, 45.00, 1, 1),
(1, 8.50, 8.50, 2, 1),
(6, 1.50, 9.00, 3, 2),
(1, 45.00, 45.00, 1, 3),
(3, 6.00, 18.00, 4, 4),
(1, 12.00, 12.00, 5, 5);

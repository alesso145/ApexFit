-- Ejecuta esto en pgAdmin si ya tienes clases creadas y quieres llenar el nuevo campo aula.
UPDATE clase SET aula = 'Área de Pesas A1' WHERE LOWER(nombre) LIKE '%muscul%';
UPDATE clase SET aula = 'Box Funcional B2' WHERE LOWER(nombre) LIKE '%cross%';
UPDATE clase SET aula = 'Sala Cardio C1' WHERE LOWER(nombre) LIKE '%cardio%';
UPDATE clase SET aula = 'Sala Spinning S1' WHERE LOWER(nombre) LIKE '%spinning%';
UPDATE clase SET aula = 'Aula Zen Y1' WHERE LOWER(nombre) LIKE '%yoga%';
UPDATE clase SET aula = 'Sala General G1' WHERE aula IS NULL OR aula = '';

-- Usuarios demo seguros: no duplican si ya existen.
INSERT INTO auth_users (username, password, role, activo)
VALUES ('admin', '123456', 'ADMIN', true),
       ('cliente', '123456', 'CLIENTE', true),
       ('entrenador', '123456', 'ENTRENADOR', true)
ON CONFLICT (username) DO NOTHING;

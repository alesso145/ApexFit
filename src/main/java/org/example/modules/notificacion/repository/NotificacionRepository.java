package org.example.modules.notificacion.repository;

import org.example.modules.notificacion.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findTop50ByDestinatarioOrderByFechaDescIdNotificacionDesc(String destinatario);

    Optional<Notificacion> findByIdNotificacionAndDestinatario(Long id, String destinatario);

    @Modifying
    @Query("update Notificacion n set n.leida = true where n.destinatario = :u and n.leida = false")
    int marcarTodasLeidas(@Param("u") String username);

    @Modifying
    @Query("delete from Notificacion n where n.destinatario = :u")
    int eliminarTodas(@Param("u") String username);
}

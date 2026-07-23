package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.ContactMessage;
import com.petcare.petwellness.Enums.ContactMessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    Page<ContactMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<ContactMessage> findByStatusOrderByCreatedAtDesc(ContactMessageStatus status, Pageable pageable);

    long countByStatus(ContactMessageStatus status);

    @Query("select count(cm) from ContactMessage cm where cm.status = com.petcare.petwellness.Enums.ContactMessageStatus.UNREAD")
    long countUnreadMessages();
}

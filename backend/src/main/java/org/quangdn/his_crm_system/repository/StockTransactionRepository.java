package org.quangdn.his_crm_system.repository;

import org.quangdn.his_crm_system.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByReferenceOrderByIdAsc(String reference);
}

package com.fashmarket.api.repository;
import com.fashmarket.api.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByActivoTrue();
}

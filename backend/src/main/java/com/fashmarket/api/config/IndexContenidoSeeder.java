package com.fashmarket.api.config;

import com.fashmarket.api.model.IndexContenido;
import com.fashmarket.api.repository.IndexContenidoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class IndexContenidoSeeder implements CommandLineRunner {
    private final IndexContenidoRepository repository;
    public IndexContenidoSeeder(IndexContenidoRepository repository) { this.repository = repository; }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;
        repository.save(new IndexContenido("hero", "principal", "Todo lo que necesitas en un solo lugar", "Compra productos para tu día a día con ofertas, atención rápida y seguimiento de pedidos.", "img/abrir.png", "productos.html", true, 1));
        repository.save(new IndexContenido("beneficio", "envios", "Envíos rápidos", "Recibe tus productos con seguimiento y atención personalizada.", "img/envios.png", null, true, 1));
        repository.save(new IndexContenido("beneficio", "seguridad", "Compra segura", "Tu pedido queda registrado y puedes revisar su estado.", "img/seguridad.png", null, true, 2));
        repository.save(new IndexContenido("beneficio", "atencion", "Atención personalizada", "Te ayudamos antes, durante y después de tu compra.", "img/atencion.png", null, true, 3));
        repository.save(new IndexContenido("paso", "paso1", "Elige tus productos", "Explora categorías, ofertas y productos destacados.", null, null, true, 1));
        repository.save(new IndexContenido("paso", "paso2", "Agrégalos al carrito", "Selecciona cantidades y revisa tu compra.", null, null, true, 2));
        repository.save(new IndexContenido("paso", "paso3", "Confirma tu pedido", "El pedido se guarda y se descuenta el stock automáticamente.", null, null, true, 3));
        repository.save(new IndexContenido("testimonio", "cliente1", "Compra sencilla y rápida", "Me gustó poder encontrar productos y ofertas en un solo lugar.", null, null, true, 1));
        repository.save(new IndexContenido("contacto", "principal", "¿Necesitas ayuda?", "Comunícate con FastMarket para resolver tus dudas sobre productos, pedidos o entregas.", null, "ayuda.html", true, 1));
    }
}

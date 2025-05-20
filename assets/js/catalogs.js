document.addEventListener("DOMContentLoaded", function () {
  const strapiUrl = "https://gm-cms-production.up.railway.app";
  const catalogContainer = document.querySelector(".feature-slider-one");

  if (!catalogContainer) {
    console.error(
      "El contenedor para los catálogos (.feature-slider-one) no fue encontrado en el DOM."
    );
    return;
  }

  async function fetchCatalogs() {
    try {
      const response = await fetch(
        `${strapiUrl}/api/catalogos?populate=imagenes`
      );
      if (!response.ok) {
        throw new Error(
          `Error al obtener los datos de Strapi. Código HTTP: ${response.status}`
        );
      }
      const jsonData = await response.json(); // jsonData ahora contiene el objeto completo { data: [...], meta: {...} }

      if (!jsonData.data || jsonData.data.length === 0) {
        catalogContainer.innerHTML =
          "<p>No hay catálogos disponibles en este momento.</p>";
        return;
      }

      renderCatalogs(jsonData.data); // Pasamos el array de catálogos a renderCatalogs
    } catch (error) {
      console.error("Error al cargar los catálogos desde Strapi:", error);
      catalogContainer.innerHTML =
        "<p>Hubo un error al cargar los catálogos. Por favor, inténtalo de nuevo más tarde.</p>";
    }
  }

  function renderCatalogs(catalogs) {
    catalogContainer.innerHTML = ""; // Limpiar cualquier contenido estático o previo

    catalogs.forEach((catalog) => {
      // URL de la imagen: usamos directamente catalog.imagenes.url si está disponible
      const imageUrl =
        catalog.imagenes && catalog.imagenes.url
          ? catalog.imagenes.url
          : "assets/images/catalogos - productos/default-placeholder.png"; // Imagen por defecto

      const productName = catalog.titulo || "Nombre del Producto";
      const productPrice =
        typeof catalog.precio === "number" && !isNaN(catalog.precio)
          ? `${catalog.precio.toLocaleString()}`
          : "";

      // Usar el link del catálogo si está disponible, de lo contrario usar el enlace por defecto
      const productDetailUrl =
        catalog.link || `shop-details.html?id=${catalog.id}`;

      const catalogItemHTML = `
                <div class="product-item style-one mb-40">
                    <div class="product-thumbnail">
                        <img src="${imageUrl}" alt="${productName}">
                        <div class="hover-content">                         
                            <a href="${imageUrl}" class="img-popup icon-btn"><i class="fa fa-eye"></i></a>
                        </div>
                        <div class="cart-button">
                            <a target="_blank" href="${productDetailUrl}" class="cart-btn"><i class="far fa-shopping-basket"></i>
                                <span class="text">Ver</span></a>
                        </div>
                    </div>
                    <div class="product-info-wrap">
                        <div class="product-info">
                            <ul class="ratings rating5"> 
                                <li><i class="fas fa-star"></i></li>
                                <li><i class="fas fa-star"></i></li>
                                <li><i class="fas fa-star"></i></li>
                                <li><i class="fas fa-star"></i></li>
                                <li><i class="fas fa-star"></i></li>
                                <li><a href="#">(80)</a></li> 
                            </ul>
                            <h4 class="title">
                                <a href="${productDetailUrl}">${productName}</a>
                            </h4>
                        </div>
                        <div class="product-price">
                            <span class="price new-price"><span class="currency">$</span>${productPrice}</span>
                        </div>
                    </div>
                </div>
            `;
      catalogContainer.insertAdjacentHTML("beforeend", catalogItemHTML);
    });

    if (typeof jQuery !== "undefined" && jQuery.fn.slick) {
      const $featureSlider = jQuery(catalogContainer);
      if ($featureSlider.hasClass("slick-initialized")) {
        $featureSlider.slick("unslick");
      }

      $featureSlider.slick({
        dots: true,
        arrows: true,
        infinite: true,
        speed: 6000, // Velocidad de la animación
        autoplay: true,
        autoplaySpeed: 0, // Transición continua
        slidesToShow: 3,
        slidesToScroll: 1,
        appendArrows: jQuery(".feature-arrows.style-one"),
        prevArrow:
          '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
        nextArrow:
          '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>',
        responsive: [
          // Ajusta los breakpoints
          {
            breakpoint: 1200,
            settings: { slidesToShow: 3 },
          },
          {
            breakpoint: 992,
            settings: { slidesToShow: 2 },
          },
          {
            breakpoint: 767,
            settings: { slidesToShow: 1 },
          },
        ],
      });
    }

    // Re-inicializar Magnific Popup para los nuevos elementos .img-popup
    if (typeof jQuery !== "undefined" && jQuery.fn.magnificPopup) {
      jQuery(".img-popup").magnificPopup({
        type: "image",
        gallery: {
          enabled: true,
        },
      });
    }
  }

  fetchCatalogs();
});

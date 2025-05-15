document.addEventListener("DOMContentLoaded", function () {
  const strapiUrl = "http://localhost:1337";
  const productsApiEndpoint = "/api/productos";
  const relatedSliderContainer = document.querySelector(
    ".releted-product-slider"
  );

  if (!relatedSliderContainer) {
    console.warn(
      "El contenedor .releted-product-slider no fue encontrado en shop-details.html."
    );
    return;
  }

  async function fetchAllProductsForSlider() {
    const pageSize = 200;
    let page = 1;
    let allProducts = [];
    let totalPages = 1;

    try {
      do {
        const response = await fetch(
          `${strapiUrl}${productsApiEndpoint}?populate=imagenes&pagination[page]=${page}&pagination[pageSize]=${pageSize}`
        );
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const jsonData = await response.json();
        if (jsonData.data && jsonData.data.length > 0) {
          allProducts = [...allProducts, ...jsonData.data];
        }
        totalPages = jsonData.meta.pagination.pageCount;
        page++;
      } while (page <= totalPages);

      if (allProducts.length === 0) {
        relatedSliderContainer.innerHTML =
          "<p>No hay productos para mostrar.</p>";
        return;
      }
      renderProductsInSlider(allProducts);
    } catch (error) {
      console.error("Error al cargar productos para el slider:", error);
      relatedSliderContainer.innerHTML = "<p>Error al cargar productos.</p>";
    }
  }

  function renderProductsInSlider(products) {
    relatedSliderContainer.innerHTML = ""; // Limpiar

    products.forEach((product) => {
      const productId = product.documentId || product.id;
      const productTitle = product.titulo || "Nombre del Producto";
      const productPrice =
        typeof product.precio === "number" && !isNaN(product.precio)
          ? product.precio.toLocaleString()
          : "N/A";
      let imageUrl = "assets/images/products/default-placeholder.png";
      if (
        product.imagenes &&
        product.imagenes.length > 0 &&
        product.imagenes[0].url
      ) {
        imageUrl = product.imagenes[0].url;
      }
      const productDetailUrl = `shop-details.html?id=${productId}`;

      const productItemHTML = `
              <div class="product-item style-one mb-40"> 
                <div class="product-thumbnail">
                  <img src="${imageUrl}" alt="${productTitle}" />
                  <div class="hover-content">
                    <a href="${imageUrl}" class="img-popup icon-btn"><i class="fa fa-eye"></i></a>
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
                      <li><a href="#">(50)</a></li>
                    </ul>
                    <h4 class="title">
                      <a href="${productDetailUrl}">${productTitle}</a>
                    </h4>
                  </div>
                  <div class="product-price">
                    <span class="price new-price"><span class="currency">$</span>${productPrice}</span>
                  </div>
                </div>
              </div>
            `;
      relatedSliderContainer.insertAdjacentHTML("beforeend", productItemHTML);
    });

    // Re-inicializar Slick Slider para .releted-product-slider
    if (
      typeof jQuery !== "undefined" &&
      jQuery.fn.slick &&
      jQuery(relatedSliderContainer).length > 0
    ) {
      const $slider = jQuery(relatedSliderContainer);
      if ($slider.hasClass("slick-initialized")) {
        $slider.slick("unslick");
      }
      $slider.slick({
        dots: false,
        arrows: true,
        infinite: products.length > 3, // Evitar error si hay pocos items
        speed: 800,
        slidesToShow: 3, // Ajusta según tu diseño
        slidesToScroll: 1,
        prevArrow:
          '<button class="prev"><i class="far fa-angle-left"></i></button>',
        nextArrow:
          '<button class="next"><i class="far fa-angle-right"></i></button>',
        appendArrows: jQuery(".releted-product-arrows.style-one"),
        responsive: [
          { breakpoint: 992, settings: { slidesToShow: 2 } },
          { breakpoint: 768, settings: { slidesToShow: 1 } },
        ],
      });
    }

    // Re-inicializar Magnific Popup para los nuevos .img-popup dentro del slider
    if (typeof jQuery !== "undefined" && jQuery.fn.magnificPopup) {
      jQuery(".releted-product-slider .img-popup").magnificPopup({
        type: "image",
        gallery: { enabled: true },
      });
    }
  }

  fetchAllProductsForSlider(); // Iniciar la carga de productos para el slider
});

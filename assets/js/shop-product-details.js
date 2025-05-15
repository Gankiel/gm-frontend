document.addEventListener("DOMContentLoaded", function () {
  const strapiUrl = "https://gm-cms-production.up.railway.app";
  const productsApiEndpoint = "/api/productos"; 

  // Función para obtener el ID del producto desde los parámetros de la URL
  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  // Función para obtener y mostrar los detalles del producto
  async function fetchProductDetails(productId) {
    if (!productId) {
      console.error("No se proporcionó ID de producto en la URL.");
      const mainContentArea = document.querySelector(".shop-details-wrapper");
      if (mainContentArea) {
        mainContentArea.innerHTML =
          "<p>No se ha especificado un producto para mostrar. Por favor, verifique el enlace.</p>";
      }
      return;
    }

    try {
      const response = await fetch(
        `${strapiUrl}${productsApiEndpoint}/${productId}?populate=imagenes`
      );

      if (!response.ok) {
        throw new Error(
          `Error al obtener los detalles del producto. Código HTTP: ${response.status}`
        );
      }

      const jsonData = await response.json();
      const product = jsonData.data; // El objeto del producto

      if (!product) {
        console.error("Producto no encontrado con el ID:", productId);
        const mainContentArea = document.querySelector(".shop-details-wrapper");
        if (mainContentArea) {
          mainContentArea.innerHTML =
            "<p>Detalles del producto no disponibles o producto no encontrado.</p>";
        }
        return;
      }

      renderProductDetails(product);
    } catch (error) {
      console.error("Error al cargar los detalles del producto:", error);
      const mainContentArea = document.querySelector(".shop-details-wrapper");
      if (mainContentArea) {
        mainContentArea.innerHTML =
          "<p>Hubo un error al cargar los detalles del producto. Por favor, inténtalo de nuevo más tarde.</p>";
      }
    }
  }

  // Función para renderizar los detalles del producto en el HTML
  function renderProductDetails(product) {
    // Poblar título del producto
    const productTitleElement = document.querySelector(
      ".shop-details-wrapper .product-info h4.title"
    );
    if (productTitleElement) {
      productTitleElement.textContent = product.titulo || "Nombre del Producto";
    }

    // Poblar precio del producto
    const productPriceElement = document.querySelector(
      ".shop-details-wrapper .product-price .price.new-price"
    );
    if (productPriceElement) {
      const price =
        typeof product.precio === "number" && !isNaN(product.precio)
          ? product.precio.toLocaleString()
          : "No disponible";
      productPriceElement.innerHTML = `<span class="currency">$</span>${price}`;
    }

    // Poblar descripción del producto
    const productDescriptionElement = document.querySelector(
      ".shop-details-wrapper .product-info > p"
    ); // Asume que el primer <p> es para la descripción principal
    if (productDescriptionElement) {
      let descriptionText = "Descripción no disponible.";
      if (
        Array.isArray(product.descripcion) &&
        product.descripcion.length > 0
      ) {
        // Intentar extraer texto de la estructura de descripción
        descriptionText = product.descripcion
          .map((block) => {
            if (block.type === "paragraph" && Array.isArray(block.children)) {
              return block.children.map((child) => child.text || "").join("");
            }
            return "";
          })
          .join("\n\n"); // Unir párrafos con doble salto de línea
        if (!descriptionText.trim()) {
          descriptionText = "Descripción no disponible.";
        }
      } else if (typeof product.descripcion === "string") {
        // Fallback si es una cadena simple
        descriptionText = product.descripcion;
      }
      productDescriptionElement.textContent = descriptionText;
    }

    // Poblar imágenes del producto (Galería principal y miniaturas)
    const mainImageSlider = document.querySelector(
      ".product-gallery-area .product-big-slider"
    );
    const thumbSlider = document.querySelector(
      ".product-gallery-area .product-thumb-slider"
    );

    if (product.imagenes && product.imagenes.length > 0) {
      if (mainImageSlider) mainImageSlider.innerHTML = ""; // Limpiar slider principal
      if (thumbSlider) thumbSlider.innerHTML = ""; // Limpiar miniaturas

      product.imagenes.forEach((imgData) => {
        const imageUrl = imgData.url; // URL directa de la imagen en Strapi v4
        const imageAlt =
          imgData.alternativeText || product.titulo || "Imagen del producto";

        if (mainImageSlider) {
          const mainSlideHTML = `
                        <div class="product-img">
                            <a href="${imageUrl}" class="img-popup"><img src="${imageUrl}" alt="${imageAlt}"></a>
                        </div>`;
          mainImageSlider.insertAdjacentHTML("beforeend", mainSlideHTML);
        }

        if (thumbSlider) {
          const thumbSlideHTML = `
                        <div class="product-img">
                            <img src="${imageUrl}" alt="${imageAlt}">
                        </div>`;
          thumbSlider.insertAdjacentHTML("beforeend", thumbSlideHTML);
        }
      });

      // Re-inicializar Sliders Slick (jQuery)
      if (typeof jQuery !== "undefined" && jQuery.fn.slick) {
        const $bigSlider = jQuery(".product-gallery-area .product-big-slider");
        const $thumbSlider = jQuery(
          ".product-gallery-area .product-thumb-slider"
        );

        if ($bigSlider.hasClass("slick-initialized")) {
          $bigSlider.slick("unslick");
        }
        if ($thumbSlider.hasClass("slick-initialized")) {
          $thumbSlider.slick("unslick");
        }

        $bigSlider.slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          fade: true,
          asNavFor: $thumbSlider, // Sincronizar con el slider de miniaturas
        });

        $thumbSlider.slick({
          slidesToShow: 4,
          slidesToScroll: 1,
          asNavFor: $bigSlider, // Sincronizar con el slider principal
          dots: false,
          arrows: true, // O false si no usas flechas de Slick aquí
          focusOnSelect: true,
        });
      }

      // Re-inicializar Magnific Popup para las nuevas imágenes
      if (typeof jQuery !== "undefined" && jQuery.fn.magnificPopup) {
        jQuery(
          ".product-gallery-area .product-big-slider .img-popup"
        ).magnificPopup({
          type: "image",
          gallery: {
            enabled: true,
          },
        });
      }
    } else {
      // Caso sin imágenes
      if (mainImageSlider)
        mainImageSlider.innerHTML =
          '<div class="product-img"><img src="assets/images/products/product-big-1.jpg" alt="Producto sin imagen"></div>';
      if (thumbSlider) thumbSlider.innerHTML = "";
    }

    // Actualizar enlace del botón de WhatsApp
    const whatsappButton = document.querySelector('.product-cart-variation .whatsapp-button');
    if (whatsappButton) {
        const phoneNumber = "+573237564731";
        const productUrl = window.location.href; // URL de la página actual del producto
        // Asegurarse de que product.titulo existe y tiene valor antes de usarlo
        const productTitleForMessage = product.titulo || "este producto"; 
        const message = `Hola, estoy interesado en ${productTitleForMessage}. Puedes verlo aquí: ${productUrl}`;
        const whatsappWebUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        whatsappButton.href = whatsappWebUrl;
    } else {
        console.warn('Botón de WhatsApp (.product-cart-variation .whatsapp-button) no encontrado para actualizar. Asegúrate de que el botón exista en tu HTML con la clase "whatsapp-button" dentro de un elemento con clase "product-cart-variation".');
    }
  }

  // Ejecución principal: obtener ID y cargar detalles
  const productId = getProductIdFromUrl();
  fetchProductDetails(productId);
});
